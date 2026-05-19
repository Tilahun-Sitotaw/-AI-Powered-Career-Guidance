const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// Simple in-memory cache with TTL (5 minutes)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCacheKey = (userId, type) => `${userId}:${type}`;
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✓ Cache hit for: ${key}`);
    return cached.data;
  }
  if (cached) cache.delete(key);
  return null;
};
const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Robustly extract JSON object from AI response
 */
const extractJson = (text) => {
  try {
    return JSON.parse(text.trim());
  } catch (err) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const potentialJson = text.substring(start, end + 1);
        return JSON.parse(potentialJson);
      } catch (innerErr) {
        throw new Error('Could not parse JSON from AI response');
      }
    }
    throw new Error('No JSON object found in AI response');
  }
};

const invalidateCache = (userId) => {
  for (const key of cache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      cache.delete(key);
    }
  }
};

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

const callGemini = async (prompt, cacheKey = null, bypassCache = false) => {
  // Check cache first
  if (cacheKey && !bypassCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`📡 Calling Gemini (${modelName}) for scholarships...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        safetySettings 
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      if (!text) throw new Error('Empty response from Gemini');
      
      console.log(`✅ Gemini success with model: ${modelName}`);
      
      // Cache the result
      if (cacheKey) {
        setCachedData(cacheKey, text);
      }
      return text;
    } catch (err) {
      const msg = err.message || '';
      console.error(`❌ Gemini model ${modelName} failed:`, msg.slice(0, 200));
      lastError = err;
      continue;
    }
  }
  throw lastError;
};

/**
 * Generate personalized scholarships using Gemini
 */
const generateScholarships = async (user, bypassCache = false) => {
  const dept = user.department || 'Not specified';
  const skills = user.skills?.join(', ') || 'Not specified';
  const interests = user.interests?.join(', ') || 'Not specified';
  const role = user.preferredRole || 'Not specified';

  const profileSummary = [
    `Name: ${user.name}`,
    `Department: ${dept}`,
    `Year of Study: ${user.year || 'Not specified'}`,
    `Skills: ${skills}`,
    `Interests: ${interests}`,
    `Preferred Role: ${role}`,
  ].join('\n');

  const prompt = `You are a world-class scholarship advisor. Suggest 6-8 REAL, LEGITIMATE scholarships for a student with the following profile. Each scholarship must be UNIQUE and DIFFERENT from the others.

STUDENT PROFILE:
${profileSummary}

CRITICAL REQUIREMENTS:
1. REAL SCHOLARSHIPS: Use well-known, legitimate scholarship programs (e.g., Fulbright, Chevening, DAAD, World Bank, African Development Bank, Gates Cambridge, etc.)
2. DEPARTMENT RELEVANCE: If the student is in ${dept}, focus on scholarships for that field
3. SKILL ALIGNMENT: Match scholarships to their skills: ${skills}
4. GEOGRAPHIC DIVERSITY: Include a mix of Global opportunities and LOCAL opportunities in Ethiopia
5. UNIQUE OPPORTUNITIES: Each scholarship MUST be DIFFERENT - no duplicates or similar programs
6. VALID LINKS: Provide the OFFICIAL scholarship portal URL (e.g., https://www.fulbright.org.et/ for Fulbright Ethiopia)

Return ONLY a valid JSON object with this exact structure:
{
  "scholarships": [
    {
      "name": "Real Scholarship Name",
      "provider": "Organization Name",
      "description": "What the scholarship covers and offers",
      "amount": "Funding amount or 'Fully funded' or 'Partial'",
      "eligibility": "Who can apply (e.g., Ethiopian citizens, African students, etc.)",
      "deadline": "Application deadline (e.g., March 31, 2026)",
      "link": "OFFICIAL_SCHOLARSHIP_PORTAL_URL",
      "matchReason": "Why this scholarship is perfect for this student based on their profile"
    }
  ]
}

EXAMPLES OF REAL SCHOLARSHIPS:
- Fulbright Scholarship (USA)
- Chevening Scholarship (UK)
- DAAD Scholarship (Germany)
- Erasmus Mundus (Europe)
- African Development Bank Scholarship
- World Bank Scholarship
- Google Africa Scholarship
- Microsoft TEALS Scholarship
- Mastercard Foundation Scholarship
- Mandela Washington Fellowship

No markdown, no code blocks, just JSON.`;

  try {
    const profileString = [
      user.department || '',
      user.preferredRole || '',
      user.country || '',
      (user.skills || []).join(','),
      (user.interests || []).join(',')
    ].join('|');
    const cacheKey = `${user._id}:scholarships:${profileString}`;
    const text = await callGemini(prompt, cacheKey, bypassCache);
    const parsed = extractJson(text);
    console.log(`✅ Generated ${parsed.scholarships?.length || 0} scholarships for ${user.name}`);
    return parsed;
  } catch (error) {
    console.error('Gemini generation failed:', error.message);
    return buildFallbackScholarships(user);
  }
};

/**
 * Fallback scholarships when Gemini fails
 * Uses user's actual data, not generic templates
 */
const buildFallbackScholarships = (user) => {
  const dept = (user.department || 'General').toLowerCase();
  const skills = user.skills || [];

  // Department-specific scholarship data
  const deptData = {
    'social science': [
      { name: 'Fulbright Scholarship', provider: 'US State Department', link: 'https://www.fulbright.org.et/' },
      { name: 'Chevening Scholarship', provider: 'UK Foreign Office', link: 'https://www.chevening.org/' },
      { name: 'DAAD Scholarship', provider: 'German Academic Exchange', link: 'https://www.daad.de/en/' },
      { name: 'Erasmus Mundus', provider: 'European Commission', link: 'https://erasmus-plus.ec.europa.eu/' },
      { name: 'African Development Bank Scholarship', provider: 'AfDB', link: 'https://www.afdb.org/' },
      { name: 'Mastercard Foundation Scholarship', provider: 'Mastercard Foundation', link: 'https://www.mastercardfdn.org/' }
    ],
    'business': [
      { name: 'Google Africa Scholarship', provider: 'Google', link: 'https://www.google.com/careers/students/' },
      { name: 'World Bank Scholarship', provider: 'World Bank', link: 'https://www.worldbank.org/' },
      { name: 'Chevening Scholarship', provider: 'UK Foreign Office', link: 'https://www.chevening.org/' },
      { name: 'DAAD Scholarship', provider: 'German Academic Exchange', link: 'https://www.daad.de/en/' },
      { name: 'Mandela Washington Fellowship', provider: 'US State Department', link: 'https://mandelawashingtonfelowship.org/' },
      { name: 'African Development Bank Scholarship', provider: 'AfDB', link: 'https://www.afdb.org/' }
    ],
    'technology': [
      { name: 'Google Africa Scholarship', provider: 'Google', link: 'https://www.google.com/careers/students/' },
      { name: 'Microsoft TEALS Scholarship', provider: 'Microsoft', link: 'https://www.microsoft.com/en-us/teals' },
      { name: 'Fulbright Scholarship', provider: 'US State Department', link: 'https://www.fulbright.org.et/' },
      { name: 'DAAD Scholarship', provider: 'German Academic Exchange', link: 'https://www.daad.de/en/' },
      { name: 'Erasmus Mundus', provider: 'European Commission', link: 'https://erasmus-plus.ec.europa.eu/' },
      { name: 'African Development Bank Scholarship', provider: 'AfDB', link: 'https://www.afdb.org/' }
    ],
    'engineering': [
      { name: 'DAAD Scholarship', provider: 'German Academic Exchange', link: 'https://www.daad.de/en/' },
      { name: 'Fulbright Scholarship', provider: 'US State Department', link: 'https://www.fulbright.org.et/' },
      { name: 'Erasmus Mundus', provider: 'European Commission', link: 'https://erasmus-plus.ec.europa.eu/' },
      { name: 'World Bank Scholarship', provider: 'World Bank', link: 'https://www.worldbank.org/' },
      { name: 'African Development Bank Scholarship', provider: 'AfDB', link: 'https://www.afdb.org/' },
      { name: 'Chevening Scholarship', provider: 'UK Foreign Office', link: 'https://www.chevening.org/' }
    ],
    'healthcare': [
      { name: 'World Health Organization Scholarship', provider: 'WHO', link: 'https://www.who.int/' },
      { name: 'Fulbright Scholarship', provider: 'US State Department', link: 'https://www.fulbright.org.et/' },
      { name: 'DAAD Scholarship', provider: 'German Academic Exchange', link: 'https://www.daad.de/en/' },
      { name: 'Chevening Scholarship', provider: 'UK Foreign Office', link: 'https://www.chevening.org/' },
      { name: 'African Development Bank Scholarship', provider: 'AfDB', link: 'https://www.afdb.org/' },
      { name: 'Mastercard Foundation Scholarship', provider: 'Mastercard Foundation', link: 'https://www.mastercardfdn.org/' }
    ],
    'arts': [
      { name: 'Fulbright Scholarship', provider: 'US State Department', link: 'https://www.fulbright.org.et/' },
      { name: 'Chevening Scholarship', provider: 'UK Foreign Office', link: 'https://www.chevening.org/' },
      { name: 'DAAD Scholarship', provider: 'German Academic Exchange', link: 'https://www.daad.de/en/' },
      { name: 'Erasmus Mundus', provider: 'European Commission', link: 'https://erasmus-plus.ec.europa.eu/' },
      { name: 'African Development Bank Scholarship', provider: 'AfDB', link: 'https://www.afdb.org/' },
      { name: 'Mastercard Foundation Scholarship', provider: 'Mastercard Foundation', link: 'https://www.mastercardfdn.org/' }
    ]
  };

  // Find matching department or default to general scholarships
  const matchedKey = Object.keys(deptData).find(k => dept.includes(k) || k.includes(dept));
  const baseScholarships = matchedKey ? deptData[matchedKey] : deptData['business'];

  return {
    scholarships: baseScholarships.map((s, i) => ({
      name: s.name,
      provider: s.provider,
      description: `${s.name} for students in ${user.department || 'your field'}. Supports academic excellence and career development.`,
      amount: i === 0 ? 'Fully funded' : i === 1 ? 'Partial funding' : 'Varies',
      eligibility: `Open to ${user.department || 'qualified'} students. Check official website for specific requirements.`,
      deadline: `Check ${s.provider} website for current deadlines`,
      link: s.link,
      matchReason: `Perfect match for your ${user.department || 'field'} background and ${user.preferredRole || 'career goals'}`
    }))
  };
};

/**
 * GET /api/scholarships
 * Fetch personalized scholarships
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const scholarships = await generateScholarships(user);
    res.json(scholarships);
  } catch (error) {
    console.error('Scholarships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/scholarships/regenerate
 * Force regenerate scholarships
 */
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Force regenerating scholarships for: ${user.name} (${user.department})`);
    invalidateCache(req.userId);
    const scholarships = await generateScholarships(user, true); // true bypasses cache
    res.json({ message: 'Scholarships regenerated', ...scholarships });
  } catch (error) {
    console.error('Regenerate scholarships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

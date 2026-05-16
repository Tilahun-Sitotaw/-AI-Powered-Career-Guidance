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
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
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
      console.log(`📡 Calling Gemini (${modelName}) for internships...`);
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
 * Generate personalized internship opportunities using Gemini
 */
const generateInternships = async (user, bypassCache = false) => {
  const dept = user.department || 'Not specified';
  const role = user.preferredRole || 'Not specified';

  const profileSummary = [
    `Name: ${user.name}`,
    `Department: ${dept}`,
    `Year of Study: ${user.year || 'Not specified'}`,
    `Skills: ${user.skills?.length > 0 ? user.skills.join(', ') : 'None listed'}`,
    `Interests: ${user.interests?.length > 0 ? user.interests.join(', ') : 'None listed'}`,
    `Preferred Role: ${role}`,
  ].join('\n');

  const prompt = `You are a world-class career advisor specializing in internships. Suggest 6-8 highly relevant, PROFESSIONAL internship opportunities for a student with the following profile.

STUDENT PROFILE:
${profileSummary}

CRITICAL REQUIREMENTS:
1. DEPARTMENT RELEVANCE: If the student is in ${dept}, focus on NGOs, International Organizations, Research Institutes, and Social Work agencies. DO NOT suggest software engineering unless they explicitly list it as a skill/interest.
2. ROLE ALIGNMENT: Match opportunities strictly to their preferred role: "${role}".
3. REAL COMPANIES: Use well-known, legitimate companies (e.g., UNICEF, UN, Save the Children, ICRC, or major banks/firms depending on their field).
4. VALID URLs: Provide the OFFICIAL careers page URL for the company. Do not hallucinate direct application links. Use the root career portal (e.g., https://unicef.org/careers).
5. GEOGRAPHIC DIVERSITY: Include a mix of Global opportunities and LOCAL opportunities in Ethiopia (e.g. United Nations ECA, CBE, or local NGOs).

Return ONLY a valid JSON object with this exact structure:
{
  "internships": [
    {
      "company": "Real Company Name",
      "position": "Specific Job Title",
      "department": "Team Name",
      "location": "City, Country or Remote",
      "duration": "Duration (e.g. 3 months)",
      "responsibilities": ["Responsibility 1", "Responsibility 2"],
      "requiredSkills": ["Skill 1", "Skill 2"],
      "whyGoodFit": "Contextual reason why this fits their profile",
      "stipend": "Salary/Stipend info",
      "difficulty": "Easy|Medium|Hard",
      "applyUrl": "OFFICIAL_CAREERS_PORTAL_URL"
    }
  ]
}

No markdown, no code blocks, just JSON.`;

  try {
    const cacheKey = `${user._id}:internships:${dept}:${role}`;
    const text = await callGemini(prompt, cacheKey, bypassCache);
    const parsed = extractJson(text);
    console.log(`✅ Generated ${parsed.internships?.length || 0} internship opportunities for ${user.name}`);
    return parsed;
  } catch (error) {
    console.error('Gemini generation failed:', error.message);
    return buildFallbackInternships(user);
  }
};

/**
 * Fallback internships when Gemini fails
 * Uses user's actual data, not generic templates
 */
const buildFallbackInternships = (user) => {
  const dept = (user.department || 'General').toLowerCase();
  const role = user.preferredRole || 'Professional';

  // Department-specific internship data
  const deptData = {
    'social science': [
      { company: 'UNICEF', position: 'Social Policy Intern', link: 'https://www.unicef.org/careers' },
      { company: 'Save the Children', position: 'Program Support Intern', link: 'https://www.savethechildren.net/careers' },
      { company: 'ICRC', position: 'Humanitarian Affairs Intern', link: 'https://www.icrc.org/en/work-for-the-icrc' }
    ],
    'business': [
      { company: 'McKinsey & Company', position: 'Business Analyst Intern', link: 'https://www.mckinsey.com/careers' },
      { company: 'CBE (Ethiopia)', position: 'Finance Intern', link: 'https://www.cbe.com.et/en/vacancy/' },
      { company: 'Deloitte', position: 'Consulting Intern', link: 'https://www2.deloitte.com/global/en/careers/students.html' }
    ],
    'technology': [
      { company: 'Google', position: 'Software Engineering Intern', link: 'https://careers.google.com/students/' },
      { company: 'Microsoft', position: 'Cloud Solutions Intern', link: 'https://careers.microsoft.com/students' },
      { company: 'Safaricom Ethiopia', position: 'Tech Graduate Intern', link: 'https://www.safaricom.et/careers' }
    ],
    'healthcare': [
      { company: 'World Health Organization', position: 'Public Health Intern', link: 'https://www.who.int/careers' },
      { company: 'Red Cross', position: 'Healthcare Administration Intern', link: 'https://www.redcross.org/about-us/careers.html' },
      { company: 'St. Paul Hospital', position: 'Medical Research Intern', link: 'https://sphmmc.edu.et/' }
    ],
    'arts': [
      { company: 'Adobe', position: 'Creative Design Intern', link: 'https://www.adobe.com/careers.html' },
      { company: 'National Museum', position: 'Curation Intern', link: 'https://www.metmuseum.org/about-the-met/career-opportunities' },
      { company: 'Netflix', position: 'Content Strategy Intern', link: 'https://jobs.netflix.com/' }
    ]
  };

  // Find matching department or default to LinkedIn search
  const matchedKey = Object.keys(deptData).find(k => dept.includes(k) || k.includes(dept));
  const baseOpportunities = matchedKey ? deptData[matchedKey] : [
    { company: 'LinkedIn', position: `${role} Intern`, link: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}` }
  ];

  return {
    internships: baseOpportunities.map((op, i) => ({
      company: op.company,
      position: op.position,
      department: user.department || 'Professional Services',
      location: i === 1 ? 'Addis Ababa, Ethiopia' : 'Remote / Global',
      duration: '3-6 months',
      responsibilities: [
        `Support the ${op.company} team in ${op.position} tasks`,
        'Collaborate on high-impact projects',
        'Gain professional experience in your field'
      ],
      requiredSkills: ['Communication', 'Dedication', 'Role-specific Knowledge'],
      whyGoodFit: `Matches your interest in ${op.company} and your goal to be a ${role}`,
      stipend: 'Competitive',
      difficulty: i === 0 ? 'Hard' : 'Medium',
      applyUrl: op.link
    }))
  };
};

/**
 * GET /api/internships
 * Fetch personalized internship opportunities
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const internships = await generateInternships(user);
    res.json(internships);
  } catch (error) {
    console.error('Internships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/internships/regenerate
 * Force regenerate internship opportunities
 */
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Force regenerating internship opportunities for: ${user.name} (${user.department})`);
    invalidateCache(req.userId);
    const internships = await generateInternships(user, true); // true bypasses cache
    res.json({ message: 'Internship opportunities regenerated', ...internships });
  } catch (error) {
    console.error('Regenerate internships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

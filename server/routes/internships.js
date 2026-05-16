const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

const invalidateCache = (userId) => {
  for (const key of cache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      cache.delete(key);
    }
  }
};

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

/**
 * Call Gemini with automatic model fallback and caching
 */
const callGemini = async (prompt, cacheKey = null, bypassCache = false) => {
  // Check cache first
  if (cacheKey && !bypassCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`✓ Gemini success with model: ${modelName}`);
      
      // Cache the result
      if (cacheKey) {
        setCachedData(cacheKey, text);
      }
      return text;
    } catch (err) {
      const msg = err.message || '';
      console.warn(`✗ Gemini model ${modelName} failed: ${msg.slice(0, 100)}`);
      lastError = err;
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      if (!isQuota) break;
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
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    console.log(`✓ Generated ${parsed.internships?.length || 0} internship opportunities for ${user.name}`);
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
  const dept = user.department || 'Technology';
  const role = user.preferredRole || 'Software Developer';
  const skills = user.skills || [];
  const interests = user.interests || [];

  return {
    internships: [
      {
        company: 'Tech Company 1',
        position: `${role} Intern`,
        department: 'Engineering',
        location: 'Remote',
        duration: '3-6 months',
        responsibilities: [
          'Work on real projects',
          'Collaborate with team members',
          'Learn industry practices',
        ],
        requiredSkills: skills.length > 0 ? skills.slice(0, 3) : ['Technical Skills'],
        whyGoodFit: `Matches your ${role} aspirations in ${dept}`,
        stipend: 'Competitive',
        difficulty: 'Medium',
        applyUrl: '#',
      },
      {
        company: 'Tech Company 2',
        position: `${interests[0] || 'Technology'} Specialist Intern`,
        department: 'Product',
        location: 'Remote',
        duration: '3-6 months',
        responsibilities: [
          'Develop solutions',
          'Support team projects',
          'Gain practical experience',
        ],
        requiredSkills: skills.length > 1 ? skills.slice(1, 4) : ['Problem Solving'],
        whyGoodFit: `Aligns with your interest in ${interests[0] || 'technology'}`,
        stipend: 'Competitive',
        difficulty: 'Medium',
        applyUrl: '#',
      },
      {
        company: 'Local Company',
        position: `${role} Intern`,
        department: 'Development',
        location: 'Addis Ababa, Ethiopia',
        duration: '2-4 months',
        responsibilities: [
          'Build applications',
          'Work with team',
          'Contribute to projects',
        ],
        requiredSkills: skills.length > 0 ? skills : ['Core Skills'],
        whyGoodFit: `Great opportunity to gain experience in ${dept} locally`,
        stipend: 'Competitive',
        difficulty: 'Easy',
        applyUrl: '#',
      },
    ],
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

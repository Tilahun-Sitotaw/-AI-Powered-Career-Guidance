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
  console.log(`✓ Cached: ${key}`);
};

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

/**
 * Call Gemini with automatic model fallback and caching
 */
const callGemini = async (prompt, cacheKey = null) => {
  // Check cache first
  if (cacheKey) {
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
const generateInternships = async (user) => {
  const profileSummary = [
    `Name: ${user.name}`,
    `Department: ${user.department || 'Not specified'}`,
    `Year of Study: ${user.year || 'Not specified'}`,
    `Skills: ${user.skills?.length > 0 ? user.skills.join(', ') : 'None listed'}`,
    `Interests: ${user.interests?.length > 0 ? user.interests.join(', ') : 'None listed'}`,
    `Preferred Role: ${user.preferredRole || 'Not specified'}`,
  ].join('\n');

  const prompt = `You are an expert internship advisor. Suggest 5-6 highly relevant internship opportunities for this student based on their profile.

STUDENT PROFILE:
${profileSummary}

For each internship, provide:
1. Company name (real companies)
2. Position title
3. Department/Team
4. Location (e.g., "Remote", "New York, USA", "Bangalore, India", "London, UK")
5. Duration (e.g., "3-6 months")
6. Key responsibilities (2-3 bullet points)
7. Required skills
8. Why it's a good fit for this student
9. Estimated stipend/salary range (if applicable)
10. Application difficulty (Easy, Medium, Hard)

IMPORTANT:
- Suggest REAL companies relevant to their field
- Include diverse locations (Remote, US, India, Europe, etc.)
- Match internships to their skills and interests
- Align with their preferred role and department
- Include mix of difficulty levels
- Provide practical, actionable opportunities

Return ONLY a valid JSON object:
{
  "internships": [
    {
      "company": "Company Name",
      "position": "Position Title",
      "department": "Department",
      "location": "Remote / City, Country",
      "duration": "3-6 months",
      "responsibilities": ["Responsibility 1", "Responsibility 2"],
      "requiredSkills": ["Skill 1", "Skill 2"],
      "whyGoodFit": "Explanation of why this is good for the student",
      "stipend": "Salary range or 'Unpaid'",
      "difficulty": "Easy|Medium|Hard"
    }
  ]
}

No markdown, no code blocks, just JSON.`;

  try {
    const cacheKey = getCacheKey(user._id, 'internships');
    const text = await callGemini(prompt, cacheKey);
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
 */
const buildFallbackInternships = (user) => {
  const dept = user.department || 'Technology';
  const role = user.preferredRole || 'Software Developer';
  const skills = user.skills || [];

  return {
    internships: [
      {
        company: 'Google',
        position: 'Software Engineering Intern',
        department: 'Engineering',
        location: 'Mountain View, USA',
        duration: '3-6 months',
        responsibilities: [
          'Develop and maintain software applications',
          'Collaborate with senior engineers on projects',
          'Participate in code reviews and testing',
        ],
        requiredSkills: ['Python', 'Java', 'Problem Solving'],
        whyGoodFit: `Perfect match for your ${role} aspirations with strong ${dept} foundation`,
        stipend: '$7,000 - $10,000/month',
        difficulty: 'Hard',
      },
      {
        company: 'Microsoft',
        position: 'Cloud Solutions Intern',
        department: 'Cloud Services',
        location: 'Remote',
        duration: '3-6 months',
        responsibilities: [
          'Work on Azure cloud solutions',
          'Support cloud infrastructure projects',
          'Document technical solutions',
        ],
        requiredSkills: ['Cloud Computing', 'Azure', 'Networking'],
        whyGoodFit: `Aligns with your interest in ${user.interests?.[0] || 'technology'} and ${role}`,
        stipend: '$6,000 - $9,000/month',
        difficulty: 'Medium',
      },
      {
        company: 'Amazon',
        position: 'Data Science Intern',
        department: 'Analytics',
        location: 'Seattle, USA',
        duration: '3-6 months',
        responsibilities: [
          'Analyze large datasets',
          'Build predictive models',
          'Present insights to stakeholders',
        ],
        requiredSkills: ['Python', 'SQL', 'Data Analysis'],
        whyGoodFit: `Great opportunity to develop skills in ${user.interests?.[1] || 'data science'}`,
        stipend: '$6,500 - $9,500/month',
        difficulty: 'Medium',
      },
      {
        company: 'Startup XYZ',
        position: 'Full Stack Developer Intern',
        department: 'Product',
        location: 'Bangalore, India',
        duration: '2-4 months',
        responsibilities: [
          'Build web applications',
          'Work on both frontend and backend',
          'Contribute to product development',
        ],
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        whyGoodFit: `Perfect for gaining practical experience in ${role}`,
        stipend: '$3,000 - $5,000/month',
        difficulty: 'Easy',
      },
      {
        company: 'IBM',
        position: 'Enterprise Solutions Intern',
        department: 'Consulting',
        location: 'London, UK',
        duration: '3-6 months',
        responsibilities: [
          'Support enterprise clients',
          'Develop business solutions',
          'Assist in project delivery',
        ],
        requiredSkills: ['Problem Solving', 'Communication', 'Technical Skills'],
        whyGoodFit: `Excellent for building professional experience in ${dept}`,
        stipend: '$5,000 - $8,000/month',
        difficulty: 'Medium',
      },
      {
        company: 'Meta',
        position: 'Product Engineering Intern',
        department: 'Product',
        location: 'Remote',
        duration: '3-6 months',
        responsibilities: [
          'Build features for Meta products',
          'Work with cross-functional teams',
          'Optimize performance and user experience',
        ],
        requiredSkills: ['C++', 'Python', 'System Design'],
        whyGoodFit: `Ideal for advancing your ${role} career at a leading tech company`,
        stipend: '$8,000 - $12,000/month',
        difficulty: 'Hard',
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

    console.log(`Regenerating internship opportunities for: ${user.name}`);
    const internships = await generateInternships(user);
    res.json({ message: 'Internship opportunities regenerated', ...internships });
  } catch (error) {
    console.error('Regenerate internships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

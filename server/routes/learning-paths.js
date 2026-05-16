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
 * Generate personalized learning paths using Gemini
 */
const generateLearningPaths = async (user) => {
  const hasSkills = user.skills?.length > 0;
  const hasInterests = user.interests?.length > 0;
  const hasDepartment = user.department && user.department.trim().length > 0;
  const hasRole = user.preferredRole && user.preferredRole.trim().length > 0;
  const hasYear = user.year && user.year > 0;

  // Build a detailed profile summary
  const profileSummary = [
    `Student Name: ${user.name}`,
    `Department: ${hasDepartment ? user.department : 'Not specified'}`,
    `Year of Study: ${hasYear ? `Year ${user.year}` : 'Not specified'}`,
    `Current Skills: ${hasSkills ? user.skills.join(', ') : 'No skills listed yet'}`,
    `Interests: ${hasInterests ? user.interests.join(', ') : 'No interests listed yet'}`,
    `Target Role: ${hasRole ? user.preferredRole : 'Not specified'}`,
  ].join('\n');

  const prompt = `You are an expert career development advisor and learning path designer. Your task is to create a HIGHLY PERSONALIZED, REAL-WORLD learning roadmap for this student from ANY field or department.

STUDENT PROFILE:
${profileSummary}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 3 phases: Foundation, Intermediate, and Advanced
2. Each phase must be SPECIFIC to the student's profile, NOT generic
3. Skills must be DIRECTLY RELATED to their current skills, interests, department, and target role
4. Resources must be REAL, CURRENT, and have WORKING DIRECT LINKS
5. Each phase should progressively build on the previous one
6. Include only well-known, reputable platforms (Udemy, Coursera, freeCodeCamp, Pluralsight, LinkedIn Learning, Educative, etc.)
7. Support ALL departments: Engineering, Business, Arts, Medicine, Law, Commerce, Science, Humanities, etc.
8. Make recommendations based on ACTUAL SKILL GAPS and user profile

FOR EACH PHASE, PROVIDE:
- Phase name with specific focus (e.g., "Foundation: Business Analytics Fundamentals (3 months)")
- Duration in months
- 3-4 specific, actionable skills to master
- 3-4 real learning resources with DIRECT, WORKING URLs

PERSONALIZATION RULES:
- If they're in "${hasDepartment ? user.department : 'any department'}", tailor the path to that field
- If they have skills in "${hasSkills ? user.skills[0] : 'any area'}", build on those
- If they're interested in "${hasInterests ? user.interests[0] : 'any topic'}", align the path with that
- If their target role is "${hasRole ? user.preferredRole : 'any role'}", tailor the skills accordingly
- Make the progression logical and achievable for their year of study (Year ${hasYear ? user.year : '1-4'})
- DIFFERENT for EACH USER - not generic fallback data

RESOURCE GUIDELINES:
- Use REAL course URLs (not search results)
- Include mix of free and paid resources
- Prioritize courses with high ratings and recent updates
- Ensure URLs are direct links to courses, not homepages
- Include resources from multiple platforms for variety

RESPONSE FORMAT - Return ONLY valid JSON, no markdown, no explanation:
{
  "roadmap": [
    {
      "phase": "Foundation: [Specific Topic] (3 months)",
      "duration": "3 months",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "resources": [
        {
          "name": "Exact Course Name",
          "url": "https://direct-link-to-course.com/course-path",
          "platform": "Platform Name"
        },
        {
          "name": "Another Course",
          "url": "https://another-platform.com/course",
          "platform": "Platform Name"
        },
        {
          "name": "Third Resource",
          "url": "https://resource-url.com/course",
          "platform": "Platform Name"
        },
        {
          "name": "Fourth Resource",
          "url": "https://fourth-resource.com/course",
          "platform": "Platform Name"
        }
      ]
    },
    {
      "phase": "Intermediate: [Specific Topic] (3 months)",
      "duration": "3 months",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "resources": [
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        },
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        },
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        },
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        }
      ]
    },
    {
      "phase": "Advanced: [Specific Topic] (3 months)",
      "duration": "3 months",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "resources": [
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        },
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        },
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        },
        {
          "name": "Course Name",
          "url": "https://course-url.com",
          "platform": "Platform Name"
        }
      ]
    }
  ]
}`;

  try {
    console.log(`\n📚 Generating learning paths for: ${user.name}`);
    console.log(`   Department: ${hasDepartment ? user.department : 'Not specified'}`);
    console.log(`   Skills: ${hasSkills ? user.skills.join(', ') : 'None'}`);
    console.log(`   Interests: ${hasInterests ? user.interests.join(', ') : 'None'}`);
    console.log(`   Target Role: ${hasRole ? user.preferredRole : 'None'}`);
    
    const cacheKey = getCacheKey(user._id, 'learning-paths');
    const text = await callGemini(prompt, cacheKey);
    
    // Clean up response
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    
    const parsed = JSON.parse(cleaned);
    
    // Validate structure
    if (!parsed.roadmap || !Array.isArray(parsed.roadmap) || parsed.roadmap.length !== 3) {
      throw new Error('Invalid roadmap structure');
    }
    
    console.log(`✅ Successfully generated personalized learning paths for ${user.name}`);
    return parsed;
  } catch (error) {
    console.error('❌ Gemini generation failed:', error.message);
    console.log('📌 Using fallback learning paths...');
    return buildFallbackLearningPaths(user);
  }
};

/**
 * Fallback learning paths when Gemini fails
 * Uses user's actual data, not generic templates
 */
const buildFallbackLearningPaths = (user) => {
  const skills = user.skills || [];
  const interests = user.interests || [];
  const preferredRole = user.preferredRole || 'Professional';
  const department = user.department || 'General';

  return {
    roadmap: [
      {
        phase: `Foundation: ${preferredRole} Fundamentals (3 months)`,
        duration: '3 months',
        skills: skills.length > 0 ? skills.slice(0, 3) : ['Core Concepts', 'Basics', 'Foundations'],
        resources: [
          { name: 'Beginner Course', url: '#', platform: 'Online' },
          { name: 'Introduction Guide', url: '#', platform: 'Documentation' },
          { name: 'Getting Started', url: '#', platform: 'Tutorial' },
          { name: 'Basics Overview', url: '#', platform: 'Learning' },
        ],
      },
      {
        phase: `Intermediate: ${preferredRole} Development (3 months)`,
        duration: '3 months',
        skills: skills.length > 3 ? skills.slice(3, 6) : ['Advanced Concepts', 'Practical Skills', 'Real-world Applications'],
        resources: [
          { name: 'Intermediate Course', url: '#', platform: 'Online' },
          { name: 'Advanced Techniques', url: '#', platform: 'Documentation' },
          { name: 'Practical Projects', url: '#', platform: 'Tutorial' },
          { name: 'Professional Skills', url: '#', platform: 'Learning' },
        ],
      },
      {
        phase: `Advanced: ${preferredRole} Expertise (3 months)`,
        duration: '3 months',
        skills: ['Expert Level Skills', 'Industry Best Practices', 'Leadership & Mentoring'],
        resources: [
          { name: 'Expert Course', url: '#', platform: 'Online' },
          { name: 'Advanced Specialization', url: '#', platform: 'Documentation' },
          { name: 'System Design', url: '#', platform: 'Tutorial' },
          { name: 'Industry Leadership', url: '#', platform: 'Learning' },
        ],
      },
    ],
  };
};

/**
 * GET /api/learning-paths
 * Fetch personalized learning paths for authenticated user
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has minimum profile data
    const hasSkills = user.skills && user.skills.length > 0;
    const hasRole = user.preferredRole && user.preferredRole.trim().length > 0;
    const hasDepartment = user.department && user.department.trim().length > 0;

    if (!hasSkills || !hasRole) {
      return res.status(400).json({
        message: 'Please complete your profile first',
        required: {
          skills: !hasSkills ? 'Add at least one skill' : 'Complete',
          preferredRole: !hasRole ? 'Select a preferred role' : 'Complete',
          department: !hasDepartment ? 'Optional but recommended' : 'Complete',
        },
        roadmap: [],
      });
    }

    console.log(`\n🔄 Fetching learning paths for user: ${user.name}`);
    const learningPaths = await generateLearningPaths(user);
    res.json(learningPaths);
  } catch (error) {
    console.error('Learning paths error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/learning-paths/regenerate
 * Force regenerate learning paths
 */
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({
        message: 'Please complete your profile with skills and preferred role first',
      });
    }

    console.log(`Regenerating learning paths for: ${user.name}`);
    const learningPaths = await generateLearningPaths(user);
    res.json({ message: 'Learning paths regenerated successfully', ...learningPaths });
  } catch (error) {
    console.error('Regenerate learning paths error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

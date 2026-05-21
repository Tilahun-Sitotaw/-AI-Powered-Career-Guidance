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
 * Uses user's actual data with REAL resource URLs
 */
const buildFallbackLearningPaths = (user) => {
  const skills = user.skills || [];
  const interests = user.interests || [];
  const preferredRole = user.preferredRole || 'Professional';
  const department = user.department || 'General';

  // Real resource database by role/skill
  const resourcesByRole = {
    'developer': {
      foundation: [
        { name: 'The Complete JavaScript Course 2024', url: 'https://www.udemy.com/course/the-complete-javascript-course-2024/', platform: 'Udemy' },
        { name: 'JavaScript Fundamentals - freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript/', platform: 'freeCodeCamp' },
        { name: 'MDN Web Docs - JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', platform: 'MDN' },
        { name: 'JavaScript Basics on Coursera', url: 'https://www.coursera.org/learn/javascript', platform: 'Coursera' }
      ],
      intermediate: [
        { name: 'React - The Complete Guide 2024', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', platform: 'Udemy' },
        { name: 'Advanced JavaScript - Udemy', url: 'https://www.udemy.com/course/javascript-advanced-concepts/', platform: 'Udemy' },
        { name: 'Web Development Bootcamp - freeCodeCamp', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', platform: 'freeCodeCamp' },
        { name: 'Node.js - Pluralsight', url: 'https://www.pluralsight.com/courses/nodejs', platform: 'Pluralsight' }
      ],
      advanced: [
        { name: 'Full Stack Web Development - Coursera', url: 'https://www.coursera.org/specializations/full-stack-web-and-multiplatform-mobile-app-development', platform: 'Coursera' },
        { name: 'System Design Masterclass - Udemy', url: 'https://www.udemy.com/course/system-design-interview/', platform: 'Udemy' },
        { name: 'Clean Code - Uncle Bob Lectures', url: 'https://www.youtube.com/playlist?list=PLmmYSbUCWJ4x1GO3IKV5vYX1RRt2in_-VG', platform: 'YouTube' },
        { name: 'Microservices Architecture - Educative', url: 'https://www.educative.io/courses/microservices-architecture', platform: 'Educative' }
      ]
    },
    'data scientist': {
      foundation: [
        { name: 'Python for Data Science - Udemy', url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning/', platform: 'Udemy' },
        { name: 'Data Science Foundations - Coursera', url: 'https://www.coursera.org/learn/data-science-foundations', platform: 'Coursera' },
        { name: 'Statistics and Probability - Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability', platform: 'Khan Academy' },
        { name: 'SQL for Data Analysis - Mode Analytics', url: 'https://mode.com/sql-tutorial/', platform: 'Mode Analytics' }
      ],
      intermediate: [
        { name: 'Machine Learning A-Z - Udemy', url: 'https://www.udemy.com/course/machinelearning/', platform: 'Udemy' },
        { name: 'Applied Data Science with Python - Coursera', url: 'https://www.coursera.org/specializations/data-science-python', platform: 'Coursera' },
        { name: 'Data Visualization with Tableau - Udemy', url: 'https://www.udemy.com/course/tableau10/', platform: 'Udemy' },
        { name: 'Pandas & NumPy - DataCamp', url: 'https://www.datacamp.com/courses/data-manipulation-with-pandas', platform: 'DataCamp' }
      ],
      advanced: [
        { name: 'Deep Learning Specialization - Coursera', url: 'https://www.coursera.org/specializations/deep-learning', platform: 'Coursera' },
        { name: 'Advanced Machine Learning - Andrew Ng', url: 'https://www.coursera.org/learn/machine-learning-projects', platform: 'Coursera' },
        { name: 'Feature Engineering for ML - Kaggle', url: 'https://www.kaggle.com/learn/feature-engineering', platform: 'Kaggle' },
        { name: 'Production ML Engineering - Coursera', url: 'https://www.coursera.org/learn/machine-learning-projects', platform: 'Coursera' }
      ]
    },
    'ai engineer': {
      foundation: [
        { name: 'AI for Everyone - Coursera', url: 'https://www.coursera.org/learn/ai-for-everyone', platform: 'Coursera' },
        { name: 'Introduction to AI - edX', url: 'https://www.edx.org/course/introduction-to-artificial-intelligence-ai', platform: 'edX' },
        { name: 'Python for AI - Udemy', url: 'https://www.udemy.com/course/python-for-machine-learning-data-science-and-artificial-intelligence/', platform: 'Udemy' },
        { name: 'Fundamentals of AI - freeCodeCamp', url: 'https://www.freecodecamp.org/learn/machine-learning-with-python/', platform: 'freeCodeCamp' }
      ],
      intermediate: [
        { name: 'Natural Language Processing - Coursera', url: 'https://www.coursera.org/learn/natural-language-processing', platform: 'Coursera' },
        { name: 'Computer Vision - Udemy', url: 'https://www.udemy.com/course/computer-vision-a-z/', platform: 'Udemy' },
        { name: 'Neural Networks & Deep Learning - Coursera', url: 'https://www.coursera.org/learn/neural-networks-deep-learning', platform: 'Coursera' },
        { name: 'TensorFlow 2.0 Complete Course - Udemy', url: 'https://www.udemy.com/course/deep-learning-with-tensorflow-2/', platform: 'Udemy' }
      ],
      advanced: [
        { name: 'Generative AI - Google DeepLearning.AI', url: 'https://www.deeplearning.ai/short-courses/generative-ai-with-llms/', platform: 'DeepLearning.AI' },
        { name: 'Transformer Models - Coursera', url: 'https://www.coursera.org/learn/generative-ai-with-llms', platform: 'Coursera' },
        { name: 'LLM Specialization - DeepLearning.AI', url: 'https://www.deeplearning.ai/short-courses/large-language-models/', platform: 'DeepLearning.AI' },
        { name: 'MLOps Engineering - Coursera', url: 'https://www.coursera.org/learn/machine-learning-operations-mlops', platform: 'Coursera' }
      ]
    },
    'business analyst': {
      foundation: [
        { name: 'Business Analysis Fundamentals - Udemy', url: 'https://www.udemy.com/course/business-analysis-fundamentals/', platform: 'Udemy' },
        { name: 'Introduction to Business Analytics - Coursera', url: 'https://www.coursera.org/learn/business-analytics', platform: 'Coursera' },
        { name: 'SQL for Business Analytics - Coursera', url: 'https://www.coursera.org/learn/business-analytics-using-sql', platform: 'Coursera' },
        { name: 'Excel for Data Analysis - LinkedIn Learning', url: 'https://www.linkedin.com/learning/excel-for-data-analysis', platform: 'LinkedIn Learning' }
      ],
      intermediate: [
        { name: 'Advanced SQL - Udemy', url: 'https://www.udemy.com/course/sql-advanced/', platform: 'Udemy' },
        { name: 'Tableau for Business Analytics - Udemy', url: 'https://www.udemy.com/course/tableau-for-business-analytics/', platform: 'Udemy' },
        { name: 'Power BI Desktop - Microsoft', url: 'https://learn.microsoft.com/en-us/power-bi/', platform: 'Microsoft' },
        { name: 'Requirements Gathering - Coursera', url: 'https://www.coursera.org/learn/requirements-gathering', platform: 'Coursera' }
      ],
      advanced: [
        { name: 'Advanced Analytics - Coursera', url: 'https://www.coursera.org/specializations/business-analytics', platform: 'Coursera' },
        { name: 'Strategic Business Analytics - Coursera', url: 'https://www.coursera.org/learn/strategic-business-analytics', platform: 'Coursera' },
        { name: 'Decision Analytics - Udemy', url: 'https://www.udemy.com/course/decision-analytics/', platform: 'Udemy' },
        { name: 'Business Intelligence - edX', url: 'https://www.edx.org/course/business-intelligence', platform: 'edX' }
      ]
    },
    'web developer': {
      foundation: [
        { name: 'The Complete Web Developer Bootcamp - Udemy', url: 'https://www.udemy.com/course/the-complete-web-developer-bootcamp/', platform: 'Udemy' },
        { name: 'Responsive Web Design - freeCodeCamp', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', platform: 'freeCodeCamp' },
        { name: 'HTML & CSS Fundamentals - Codecademy', url: 'https://www.codecademy.com/learn/learn-html', platform: 'Codecademy' },
        { name: 'Web Design for Beginners - Coursera', url: 'https://www.coursera.org/learn/web-design-for-everybody', platform: 'Coursera' }
      ],
      intermediate: [
        { name: 'React Complete Course - Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', platform: 'Udemy' },
        { name: 'JavaScript Advanced - freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', platform: 'freeCodeCamp' },
        { name: 'Vue.js Mastery - VueJS Docs', url: 'https://vuejs.org/guide/introduction.html', platform: 'Vue' },
        { name: 'Web APIs - MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/API', platform: 'MDN' }
      ],
      advanced: [
        { name: 'Full Stack Web Development - Coursera', url: 'https://www.coursera.org/specializations/full-stack-web-and-multiplatform-mobile-app-development', platform: 'Coursera' },
        { name: 'Advanced React Patterns - Frontend Masters', url: 'https://frontendmasters.com/courses/advanced-react/', platform: 'Frontend Masters' },
        { name: 'Web Performance - Frontend Masters', url: 'https://frontendmasters.com/courses/web-performance/', platform: 'Frontend Masters' },
        { name: 'System Design for Web Apps - Udemy', url: 'https://www.udemy.com/course/system-design-interview/', platform: 'Udemy' }
      ]
    }
  };

  // Get role-specific resources or default
  const roleKey = preferredRole.toLowerCase();
  let resources = resourcesByRole[roleKey];
  if (!resources) {
    // Find closest match
    const match = Object.keys(resourcesByRole).find(key => roleKey.includes(key.split(' ')[0]));
    resources = match ? resourcesByRole[match] : resourcesByRole['developer'];
  }

  return {
    roadmap: [
      {
        phase: `Foundation: ${preferredRole} Fundamentals (3 months)`,
        duration: '3 months',
        skills: skills.length > 0 ? skills.slice(0, 3) : ['Core Concepts', 'Basics', 'Foundations'],
        resources: resources.foundation
      },
      {
        phase: `Intermediate: ${preferredRole} Development (3 months)`,
        duration: '3 months',
        skills: skills.length > 3 ? skills.slice(3, 6) : ['Advanced Concepts', 'Practical Skills', 'Real-world Applications'],
        resources: resources.intermediate
      },
      {
        phase: `Advanced: ${preferredRole} Expertise (3 months)`,
        duration: '3 months',
        skills: ['Expert Level Skills', 'Industry Best Practices', 'Leadership & Mentoring'],
        resources: resources.advanced
      }
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

const express = require('express');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini with v1 API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1',
});

// Model priority list — tries each in order until one succeeds
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

/**
 * Build a stable hash from the user's career-relevant profile fields.
 * Any change to skills, interests, department, year, or preferredRole
 * will produce a different hash → triggers regeneration.
 */
const buildProfileHash = (user) => {
  const key = JSON.stringify({
    skills: [...(user.skills || [])].sort(),
    interests: [...(user.interests || [])].sort(),
    department: user.department || '',
    year: user.year || '',
    preferredRole: user.preferredRole || '',
  });
  return crypto.createHash('md5').update(key).digest('hex');
};

/**
 * Call Gemini with automatic model fallback.
 */
const callGemini = async (prompt) => {
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`Gemini success with model: ${modelName}`);
      return text;
    } catch (err) {
      const msg = err.message || '';
      console.warn(`Gemini model ${modelName} failed: ${msg.slice(0, 100)}`);
      lastError = err;
      // Only try next model on quota/rate-limit errors
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      if (!isQuota) break;
    }
  }
  throw lastError;
};

/**
 * Use Gemini to generate personalized career recommendations
 * based on the user's actual profile data.
 */
const generateRecommendations = async (user) => {
  const hasSkills = user.skills?.length > 0;
  const hasInterests = user.interests?.length > 0;

  const profileSummary = [
    `Name: ${user.name}`,
    `Department: ${user.department || 'Not specified'}`,
    `Year of Study: ${user.year || 'Not specified'}`,
    `Skills: ${hasSkills ? user.skills.join(', ') : 'None listed'}`,
    `Interests: ${hasInterests ? user.interests.join(', ') : 'None listed'}`,
    `Preferred Role: ${user.preferredRole || 'Not specified'}`,
  ].join('\n');

  const prompt = `You are an expert AI career guidance counselor. Analyze this student profile carefully and generate HIGHLY PERSONALIZED career recommendations that are UNIQUE to this specific student.

STUDENT PROFILE:
${profileSummary}

CRITICAL INSTRUCTIONS:
- Every recommendation MUST directly reference the student's actual skills (${hasSkills ? user.skills.join(', ') : 'none yet'})
- Every recommendation MUST align with their interests (${hasInterests ? user.interests.join(', ') : 'none yet'})
- Career paths MUST match their preferred role: "${user.preferredRole || 'not specified'}"
- Skill gaps MUST be skills they are MISSING relative to their preferred role — do NOT list skills they already have
- Interview questions MUST be relevant to their specific target career
- If the student has no skills/interests yet, recommend foundational paths for their department

Return ONLY a valid JSON object. No markdown, no code blocks, no explanation. Just the JSON:
{
  "careerPaths": [
    {"title": "string", "description": "string", "matchScore": number}
  ],
  "roadmap": [
    {"phase": "string", "duration": "string", "skills": ["string"], "resources": ["string"]}
  ],
  "projects": [
    {"title": "string", "description": "string", "difficulty": "Beginner|Intermediate|Advanced", "skills": ["string"]}
  ],
  "skillGaps": [
    {"skill": "string", "importance": "High|Medium|Low", "resources": ["string"]}
  ],
  "interviewQuestions": [
    {"question": "string", "category": "string", "difficulty": "Beginner|Intermediate|Advanced"}
  ],
  "salaryInsights": {"entryLevel": number, "midLevel": number, "senior": number}
}

REQUIREMENTS:
- 4-6 careerPaths sorted by matchScore descending (60-98 range)
- Exactly 3 roadmap phases (Foundation, Intermediate, Advanced) — each phase builds on the previous
- 3 projects of increasing difficulty using the student's actual skills
- 4-5 skillGaps — ONLY skills the student does NOT already have but needs for their preferred role
- 5-6 interview questions specific to their target career field
- Salary in USD realistic for the career paths generated`;

  try {
    const text = await callGemini(prompt);
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    console.log(`Generated ${parsed.careerPaths?.length} career paths for ${user.name} (${user.preferredRole || 'no role'})`);
    return parsed;
  } catch (error) {
    console.error('Gemini generation failed, using profile-aware fallback:', error.message);
    return buildFallbackRecommendations(user);
  }
};

/**
 * Profile-aware fallback when Gemini is unavailable.
 * Uses the user's actual data — never generic.
 */
const buildFallbackRecommendations = (user) => {
  const skills = user.skills || [];
  const interests = user.interests || [];
  const preferredRole = user.preferredRole || 'Software Developer';
  const dept = user.department || 'technology';

  // Determine skill gaps: common career skills minus what the user already has
  const allCareerSkills = ['System Design', 'Cloud Computing', 'DevOps', 'Data Structures & Algorithms',
    'Machine Learning', 'Docker', 'Kubernetes', 'SQL', 'REST APIs', 'TypeScript'];
  const userSkillsLower = skills.map((s) => s.toLowerCase());
  const gaps = allCareerSkills
    .filter((s) => !userSkillsLower.includes(s.toLowerCase()))
    .slice(0, 4);

  return {
    careerPaths: [
      {
        title: preferredRole,
        description: `A career path aligned with your ${dept} background and skills in ${skills.slice(0, 2).join(', ') || 'technology'}. This role directly matches your stated preference.`,
        matchScore: 90,
      },
      {
        title: interests[0] ? `${interests[0]} Engineer` : 'Full Stack Developer',
        description: `Leverage your interest in ${interests[0] || 'software development'} to build a focused career. Your existing skills provide a strong foundation.`,
        matchScore: 82,
      },
      {
        title: interests[1] ? `${interests[1]} Specialist` : 'Backend Developer',
        description: `Combine your ${dept} knowledge with ${interests[1] || 'server-side'} expertise to become a specialist in this growing field.`,
        matchScore: 74,
      },
    ],
    roadmap: [
      {
        phase: 'Foundation (3 months)',
        duration: '3 months',
        skills: skills.length ? skills.slice(0, 3) : ['Programming Basics', 'Data Structures', 'Git'],
        resources: ['freeCodeCamp', 'Coursera', 'MDN Web Docs'],
      },
      {
        phase: 'Intermediate (3 months)',
        duration: '3 months',
        skills: skills.length > 3 ? skills.slice(3, 6) : ['System Design', 'Databases', 'REST APIs'],
        resources: ['Udemy', 'Pluralsight', 'LinkedIn Learning'],
      },
      {
        phase: 'Advanced (3 months)',
        duration: '3 months',
        skills: ['Cloud Services', 'CI/CD', 'Architecture Patterns'],
        resources: ['AWS Docs', 'Docker Docs', 'System Design Primer'],
      },
    ],
    projects: [
      {
        title: `${preferredRole} Portfolio Project`,
        description: `Build a portfolio project demonstrating your ${skills[0] || 'programming'} skills relevant to ${preferredRole}.`,
        difficulty: 'Beginner',
        skills: skills.slice(0, 2).length ? skills.slice(0, 2) : ['HTML', 'CSS', 'JavaScript'],
      },
      {
        title: `${interests[0] || 'Web'} Application`,
        description: `Build a full-featured application in the ${interests[0] || 'web'} domain with authentication and database integration.`,
        difficulty: 'Intermediate',
        skills: skills.slice(0, 3).length ? skills.slice(0, 3) : ['React', 'Node.js', 'MongoDB'],
      },
      {
        title: 'Production-Ready System',
        description: `Design and deploy a scalable system relevant to ${preferredRole} with proper DevOps practices.`,
        difficulty: 'Advanced',
        skills: ['Docker', 'CI/CD', 'Cloud Deployment'],
      },
    ],
    skillGaps: gaps.map((skill, i) => ({
      skill,
      importance: i < 2 ? 'High' : 'Medium',
      resources: [`${skill} Documentation`, `${skill} Course on Udemy`],
    })),
    interviewQuestions: [
      {
        question: `Describe a project where you used ${skills[0] || 'your primary skill'} to solve a real problem.`,
        category: 'Technical',
        difficulty: 'Intermediate',
      },
      {
        question: `What are the key responsibilities of a ${preferredRole}?`,
        category: 'Role Knowledge',
        difficulty: 'Beginner',
      },
      {
        question: `How would you design a scalable system for a ${interests[0] || 'web'} application?`,
        category: 'System Design',
        difficulty: 'Advanced',
      },
      {
        question: 'Tell me about a time you had to learn a new technology quickly. How did you approach it?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
      },
      {
        question: `What trends in ${interests[0] || 'technology'} are you most excited about and why?`,
        category: 'Industry Knowledge',
        difficulty: 'Intermediate',
      },
    ],
    salaryInsights: { entryLevel: 55000, midLevel: 95000, senior: 145000 },
  };
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/recommendations
// Returns cached recommendations UNLESS the user's profile has changed since last generation
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentHash = buildProfileHash(user);
    let recommendation = await Recommendation.findOne({ userId: req.userId });

    const needsRegeneration =
      !recommendation ||                          // no data at all
      !recommendation.profileHash ||              // old data without hash (pre-fix)
      recommendation.profileHash !== currentHash; // profile changed since last generation

    if (needsRegeneration) {
      console.log(`Profile changed or no data — regenerating for: ${user.name}`);
      const recommendations = await generateRecommendations(user);

      recommendation = await Recommendation.findOneAndUpdate(
        { userId: req.userId },
        { $set: { ...recommendations, profileHash: currentHash, updatedAt: new Date() } },
        { new: true, upsert: true }
      );
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/recommendations/regenerate — force regenerate regardless of cache
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log(`Force regenerating for: ${user.name}`);
    const currentHash = buildProfileHash(user);
    const recommendations = await generateRecommendations(user);

    const recommendation = await Recommendation.findOneAndUpdate(
      { userId: req.userId },
      { $set: { ...recommendations, profileHash: currentHash, updatedAt: new Date() } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Recommendations regenerated successfully', recommendation });
  } catch (error) {
    console.error('Regenerate recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

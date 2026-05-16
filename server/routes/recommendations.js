const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Use Gemini to generate personalized career recommendations
 * based on the user's actual profile data.
 */
const generateRecommendations = async (user) => {
  const profileSummary = `
Name: ${user.name}
Department: ${user.department || 'Not specified'}
Year of Study: ${user.year || 'Not specified'}
Skills: ${user.skills?.length ? user.skills.join(', ') : 'None listed'}
Interests: ${user.interests?.length ? user.interests.join(', ') : 'None listed'}
Preferred Role: ${user.preferredRole || 'Not specified'}
  `.trim();

  const prompt = `
You are an expert AI career guidance counselor. Based on the following student profile, generate highly personalized career recommendations.

Student Profile:
${profileSummary}

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with this exact structure:
{
  "careerPaths": [
    {
      "title": "Career title",
      "description": "2-sentence description of this career",
      "matchScore": 85
    }
  ],
  "roadmap": [
    {
      "phase": "Phase name (e.g. Foundation - 3 months)",
      "duration": "3 months",
      "skills": ["skill1", "skill2", "skill3"],
      "resources": ["Resource 1", "Resource 2", "Resource 3"]
    }
  ],
  "projects": [
    {
      "title": "Project title",
      "description": "Brief project description",
      "difficulty": "Beginner|Intermediate|Advanced",
      "skills": ["skill1", "skill2"]
    }
  ],
  "skillGaps": [
    {
      "skill": "Skill name",
      "importance": "High|Medium|Low",
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "interviewQuestions": [
    {
      "question": "Interview question text",
      "category": "Category name",
      "difficulty": "Beginner|Intermediate|Advanced"
    }
  ],
  "salaryInsights": {
    "entryLevel": 55000,
    "midLevel": 95000,
    "senior": 140000
  }
}

Rules:
- Generate exactly 4-6 careerPaths ranked by matchScore (highest first), tailored to the student's skills and interests
- Generate exactly 3 roadmap phases (Foundation, Intermediate, Advanced)
- Generate exactly 3 projects of increasing difficulty
- Generate exactly 4-5 skillGaps based on what the student is missing for their preferred role
- Generate exactly 5-6 interview questions relevant to their target career
- matchScore must be a number between 60 and 98
- Salary values must be realistic numbers in USD
- All content must be specifically tailored to this student's profile, NOT generic
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    // Fallback to profile-aware defaults if Gemini fails
    return buildFallbackRecommendations(user);
  }
};

/**
 * Fallback recommendations using the user's actual profile data
 * when Gemini is unavailable.
 */
const buildFallbackRecommendations = (user) => {
  const skills = user.skills || [];
  const interests = user.interests || [];
  const preferredRole = user.preferredRole || 'Software Developer';

  return {
    careerPaths: [
      {
        title: preferredRole,
        description: `A career path aligned with your background in ${user.department || 'technology'}. Leverage your existing skills to excel in this role.`,
        matchScore: 90,
      },
      {
        title: interests[0] ? `${interests[0]} Specialist` : 'Full Stack Developer',
        description: `Combine your interest in ${interests[0] || 'web development'} with technical skills to build a strong career.`,
        matchScore: 80,
      },
      {
        title: 'Software Engineer',
        description: 'Design and build scalable software systems used by millions of people worldwide.',
        matchScore: 75,
      },
    ],
    roadmap: [
      {
        phase: 'Foundation (3 months)',
        duration: '3 months',
        skills: skills.length ? skills.slice(0, 3) : ['Programming Basics', 'Data Structures', 'Algorithms'],
        resources: ['Coursera', 'freeCodeCamp', 'MDN Web Docs'],
      },
      {
        phase: 'Intermediate (3 months)',
        duration: '3 months',
        skills: skills.length > 3 ? skills.slice(3, 6) : ['System Design', 'Databases', 'APIs'],
        resources: ['Udemy', 'Pluralsight', 'LinkedIn Learning'],
      },
      {
        phase: 'Advanced (3 months)',
        duration: '3 months',
        skills: ['Cloud Services', 'DevOps', 'Architecture Patterns'],
        resources: ['AWS Docs', 'Docker Docs', 'System Design Primer'],
      },
    ],
    projects: [
      {
        title: 'Personal Portfolio Website',
        description: 'Build a responsive portfolio showcasing your projects and skills.',
        difficulty: 'Beginner',
        skills: skills.slice(0, 2).length ? skills.slice(0, 2) : ['HTML', 'CSS'],
      },
      {
        title: 'Full Stack CRUD Application',
        description: 'Build a complete web application with authentication and database integration.',
        difficulty: 'Intermediate',
        skills: ['React', 'Node.js', 'MongoDB'],
      },
      {
        title: 'Scalable Microservices App',
        description: 'Design and deploy a microservices-based application on the cloud.',
        difficulty: 'Advanced',
        skills: ['Docker', 'Kubernetes', 'CI/CD'],
      },
    ],
    skillGaps: [
      {
        skill: 'System Design',
        importance: 'High',
        resources: ['System Design Primer', 'Grokking the System Design Interview'],
      },
      {
        skill: 'Cloud Computing',
        importance: 'High',
        resources: ['AWS Free Tier', 'Google Cloud Skills Boost'],
      },
      {
        skill: 'DevOps Practices',
        importance: 'Medium',
        resources: ['Docker Docs', 'GitHub Actions Docs'],
      },
      {
        skill: 'Data Structures & Algorithms',
        importance: 'High',
        resources: ['LeetCode', 'NeetCode.io'],
      },
    ],
    interviewQuestions: [
      {
        question: `What experience do you have with ${skills[0] || 'programming'}?`,
        category: 'Technical',
        difficulty: 'Beginner',
      },
      {
        question: 'Explain the difference between SQL and NoSQL databases.',
        category: 'Database',
        difficulty: 'Intermediate',
      },
      {
        question: 'Design a scalable URL shortening service.',
        category: 'System Design',
        difficulty: 'Advanced',
      },
      {
        question: 'Tell me about a challenging project you worked on and how you overcame obstacles.',
        category: 'Behavioral',
        difficulty: 'Intermediate',
      },
      {
        question: 'What is your approach to debugging a production issue?',
        category: 'Problem Solving',
        difficulty: 'Intermediate',
      },
    ],
    salaryInsights: {
      entryLevel: 55000,
      midLevel: 95000,
      senior: 145000,
    },
  };
};

// GET /api/recommendations — fetch or generate for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    let recommendation = await Recommendation.findOne({ userId: req.userId });

    if (!recommendation) {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const recommendations = await generateRecommendations(user);
      recommendation = new Recommendation({ userId: req.userId, ...recommendations });
      await recommendation.save();
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/recommendations/regenerate — force regenerate using Gemini
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recommendations = await generateRecommendations(user);

    let recommendation = await Recommendation.findOne({ userId: req.userId });
    if (recommendation) {
      Object.assign(recommendation, recommendations);
      recommendation.updatedAt = new Date();
    } else {
      recommendation = new Recommendation({ userId: req.userId, ...recommendations });
    }

    await recommendation.save();
    res.json({ message: 'Recommendations regenerated successfully', recommendation });
  } catch (error) {
    console.error('Regenerate recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

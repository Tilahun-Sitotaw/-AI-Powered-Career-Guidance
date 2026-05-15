const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const axios = require('axios');

const router = express.Router();

// Mock AI recommendation logic (replace with actual OpenAI/Gemini API)
const generateRecommendations = async (userProfile) => {
  // This is a mock implementation
  // In production, integrate with OpenAI or Gemini API
  
  const careerPaths = [
    {
      title: 'Software Engineer',
      description: 'Build scalable applications and systems',
      matchScore: 95,
    },
    {
      title: 'Data Scientist',
      description: 'Analyze data and build ML models',
      matchScore: 85,
    },
    {
      title: 'Product Manager',
      description: 'Lead product strategy and development',
      matchScore: 75,
    },
  ];

  const roadmap = [
    {
      phase: 'Foundation (3 months)',
      duration: '3 months',
      skills: ['JavaScript', 'React', 'Node.js'],
      resources: ['Udemy', 'Codecademy', 'FreeCodeCamp'],
    },
    {
      phase: 'Intermediate (3 months)',
      duration: '3 months',
      skills: ['Advanced React', 'Database Design', 'API Development'],
      resources: ['Pluralsight', 'Coursera', 'LinkedIn Learning'],
    },
    {
      phase: 'Advanced (3 months)',
      duration: '3 months',
      skills: ['System Design', 'DevOps', 'Cloud Services'],
      resources: ['System Design Primer', 'AWS Docs', 'Docker Docs'],
    },
  ];

  const projects = [
    {
      title: 'Todo App',
      description: 'Build a simple todo application with React',
      difficulty: 'Beginner',
      skills: ['React', 'JavaScript', 'CSS'],
    },
    {
      title: 'E-commerce Platform',
      description: 'Build a full-stack e-commerce application',
      difficulty: 'Intermediate',
      skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
    },
    {
      title: 'Real-time Chat Application',
      description: 'Build a real-time chat app with WebSockets',
      difficulty: 'Advanced',
      skills: ['Socket.io', 'React', 'Node.js', 'Database Design'],
    },
  ];

  const skillGaps = [
    {
      skill: 'System Design',
      importance: 'High',
      resources: ['System Design Primer', 'Grokking the System Design Interview'],
    },
    {
      skill: 'DevOps',
      importance: 'Medium',
      resources: ['Docker Docs', 'Kubernetes Docs', 'AWS Certified Solutions Architect'],
    },
    {
      skill: 'Advanced Database Design',
      importance: 'High',
      resources: ['Database Design Course', 'SQL Performance Tuning'],
    },
  ];

  const interviewQuestions = [
    {
      question: 'Explain the difference between let, const, and var in JavaScript',
      category: 'JavaScript',
      difficulty: 'Beginner',
    },
    {
      question: 'Design a URL shortening service like bit.ly',
      category: 'System Design',
      difficulty: 'Advanced',
    },
    {
      question: 'What is the difference between SQL and NoSQL databases?',
      category: 'Database',
      difficulty: 'Intermediate',
    },
  ];

  const salaryInsights = {
    entryLevel: 60000,
    midLevel: 120000,
    senior: 180000,
  };

  return {
    careerPaths,
    roadmap,
    projects,
    skillGaps,
    interviewQuestions,
    salaryInsights,
  };
};

// Get recommendations
router.get('/', auth, async (req, res) => {
  try {
    let recommendation = await Recommendation.findOne({ userId: req.userId });

    if (!recommendation) {
      const user = await User.findById(req.userId);
      const recommendations = await generateRecommendations(user);

      recommendation = new Recommendation({
        userId: req.userId,
        ...recommendations,
      });

      await recommendation.save();
    }

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Regenerate recommendations
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const recommendations = await generateRecommendations(user);

    let recommendation = await Recommendation.findOne({ userId: req.userId });

    if (recommendation) {
      Object.assign(recommendation, recommendations);
      recommendation.updatedAt = new Date();
    } else {
      recommendation = new Recommendation({
        userId: req.userId,
        ...recommendations,
      });
    }

    await recommendation.save();

    res.json({
      message: 'Recommendations regenerated successfully',
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store chat histories per user (in-memory, will be lost on server restart)
const chatHistories = new Map();

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

/**
 * Call Gemini with automatic model fallback
 */
const callGemini = async (prompt) => {
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`✓ Gemini chat success with model: ${modelName}`);
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
 * POST /api/chat/send
 * Send a message to Gemini and get a response
 */
router.post('/send', auth, async (req, res) => {
  try {
    const { message, context = 'general' } = req.body;
    const userId = req.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build context-aware prompt
    let systemPrompt = '';
    if (context === 'career') {
      systemPrompt = `You are a career guidance expert. The user is a ${user.department || 'student'} student interested in ${user.preferredRole || 'a career'}. 
Their skills include: ${user.skills?.join(', ') || 'not specified'}.
Their interests are: ${user.interests?.join(', ') || 'not specified'}.
Provide personalized, actionable career advice.`;
    } else if (context === 'learning') {
      systemPrompt = `You are a learning path expert. Help the user create a personalized learning roadmap.
The user is a ${user.department || 'student'} student with skills in: ${user.skills?.join(', ') || 'not specified'}.
Provide specific, actionable learning recommendations with real resources.`;
    } else if (context === 'interview') {
      systemPrompt = `You are an interview preparation expert. Help the user prepare for interviews for the role of ${user.preferredRole || 'a professional position'}.
Provide realistic interview questions and tips based on their profile.`;
    } else {
      systemPrompt = `You are a helpful career and education advisor. Provide personalized guidance based on the user's profile.`;
    }

    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;

    console.log(`\n💬 Chat message from ${user.name} (context: ${context})`);
    const response = await callGemini(fullPrompt);

    res.json({
      message: response,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: 'Failed to get response from AI',
      error: error.message,
    });
  }
});

/**
 * POST /api/chat/clear
 * Clear chat history for user
 */
router.post('/clear', auth, async (req, res) => {
  try {
    const userId = req.userId;
    chatHistories.delete(userId);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ message: 'Failed to clear chat history' });
  }
});

module.exports = router;

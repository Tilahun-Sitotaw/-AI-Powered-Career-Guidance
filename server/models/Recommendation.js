const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  profileHash: {
    type: String,
    default: null,
  },
  careerPaths: [{
    title: String,
    description: String,
    matchScore: Number,
  }],
  roadmap: [{
    phase: String,
    duration: String,
    skills: [String],
    resources: [String],
  }],
  projects: [{
    title: String,
    description: String,
    difficulty: String,
    skills: [String],
  }],
  skillGaps: [{
    skill: String,
    importance: String,
    resources: [String],
  }],
  interviewQuestions: [{
    question: String,
    category: String,
    difficulty: String,
    answer: String,
  }],
  scholarships: [{
    name: String,
    provider: String,
    description: String,
    amount: String,
    eligibility: String,
    deadline: String,
    link: String,
    matchReason: String,
  }],
  examResults: {
    lastTaken: Date,
    score: Number,
    total: Number,
    percent: Number,
    examGaps: [{
      skill: String,
      score: Number,
      importance: String,
      source: { type: String, default: 'exam' },
    }],
  },
  salaryInsights: {
    entryLevel: Number,
    midLevel: Number,
    senior: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recommendation', recommendationSchema);

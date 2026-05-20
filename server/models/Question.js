const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    skillsCombination: {
      type: [String],
      required: true,
      index: true,
    },
    skillsHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    questions: [
      {
        question: String,
        skill: String,
        difficulty: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced'],
        },
        options: [String],
        correctIndex: Number,
        explanation: String,
      },
    ],
    source: {
      type: String,
      enum: ['gemini', 'fallback'],
      default: 'gemini',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expire: 7776000, // 90 days TTL in seconds
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);

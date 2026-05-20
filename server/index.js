const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from server directory first (has all keys), then root as fallback
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // root .env — won't overwrite keys already loaded

// Redundancy: Ensure GEMINI_API_KEY is populated using the available backup keys
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 
                             process.env.GEMINI_API_KEY_1 || 
                             process.env.GEMINI_API_KEY_2 || 
                             process.env.GEMINI_API_KEY_3 || 
                             process.env.GEMINI_API_KEY_4 ||
                             process.env.GEMINI_API_KEY_5 ||
                             process.env.GEMINI_API_KEY_6;

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpath-ai';
console.log('Attempting to connect to MongoDB...');
console.log('URI (first 50 chars):', mongoURI.substring(0, 50) + '...');

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
})
.then(() => {
  console.log('✓ MongoDB connected successfully');
  console.log('Connection state:', mongoose.connection.readyState);
})
.catch(err => {
  console.error('✗ MongoDB connection error:', err.message);
  console.error('This is expected if MongoDB Atlas IP whitelist is not configured.');
  console.error('Please ensure your IP is whitelisted in MongoDB Atlas.');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/learning-paths', require('./routes/learning-paths'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/contact', require('./routes/contact'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/auth/verify-otp`);
  console.log(`   - GET  /api/health\n`);
});

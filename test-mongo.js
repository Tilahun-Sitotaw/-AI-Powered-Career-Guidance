const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpath-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✓ MongoDB connected successfully!');
  console.log('Connection state:', mongoose.connection.readyState);
  process.exit(0);
})
.catch(err => {
  console.error('✗ MongoDB connection failed:');
  console.error('Error:', err.message);
  console.error('Code:', err.code);
  process.exit(1);
});

// Also log connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');

const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile — also clears the recommendation cache so next
// visit to /api/recommendations triggers a fresh Gemini generation
router.put('/', auth, async (req, res) => {
  try {
    const { name, department, year, skills, interests, preferredRole } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, department, year, skills, interests, preferredRole },
      { new: true }
    ).select('-password -otp -otpExpiry');

    // Invalidate cached recommendations by clearing the profileHash.
    // The next GET /api/recommendations will detect the mismatch and regenerate.
    await Recommendation.findOneAndUpdate(
      { userId: req.userId },
      { $set: { profileHash: null } }
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

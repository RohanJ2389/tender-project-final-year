const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// GET /users - Fetch all users except admins
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;

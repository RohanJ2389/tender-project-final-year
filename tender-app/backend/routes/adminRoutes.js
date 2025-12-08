const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// GET /users - Fetch all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check if the logged-in user is super admin
    const loggedInUser = await User.findById(req.user.userId);

    let query = {};
    // If not super admin, exclude super admin users from the list
    if (!loggedInUser.isSuperAdmin) {
      query.isSuperAdmin = { $ne: true };
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// PUT /users/:userId/role - Update user role
router.put('/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying super admin
    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    // Do NOT allow changing the "super admin" user (admin@gmail.com) to non-admin
    if (user.email === 'admin@gmail.com' && role !== 'admin') {
      return res.status(403).json({ message: 'Cannot demote super admin' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role updated to ${role} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

module.exports = router;

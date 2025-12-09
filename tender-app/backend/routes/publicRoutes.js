const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const User = require('../models/User');
const Tender = require('../models/Tender');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

// GET /api/public/bids/stats - Get bid statistics for logged-in user
router.get('/bids/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalBids = await Bid.countDocuments({ bidderId: userId });

    const approvedBids = await Bid.countDocuments({
      bidderId: userId,
      status: 'accepted',
    });

    const rejectedBids = await Bid.countDocuments({
      bidderId: userId,
      status: 'rejected',
    });

    const pendingBids = await Bid.countDocuments({
      bidderId: userId,
      status: 'pending',
    });

    const stats = {
      totalBids,
      approvedBids,
      rejectedBids,
      pendingBids,
    };

    console.log('Backend bid stats for user', userId, ':', stats);

    res.json(stats);
  } catch (error) {
    console.error('Get bid stats error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/public/notifications - Get notifications for logged-in user
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/public/notifications/:id/read - Mark single notification as read
router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/public/notifications/read-all - Mark all notifications as read
router.patch('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ msg: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/public/profile - Get current user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/public/profile - Update current user's profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { companyName, businessCategory, phone, address, gstNumber } = req.body;

    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (businessCategory !== undefined) updateData.businessCategory = businessCategory;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      msg: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/public/landing-stats - Get landing page statistics
router.get('/landing-stats', async (req, res) => {
  try {
    const activeTenders = await Tender.countDocuments({ status: 'published' });
    const totalBids = await Bid.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    const stats = {
      activeTenders,
      totalBids,
      totalUsers,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get landing stats error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

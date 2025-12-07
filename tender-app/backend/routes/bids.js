// routes/bids.js - Bid management routes
const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const { authenticateToken } = require('./auth');

// POST /api/bids - Place a new bid
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tenderId, amount, proposal } = req.body;
    const bidderId = req.user.userId; // Get user ID from JWT token

    if (!tenderId || !amount) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const bid = new Bid({
      tenderId,
      bidderId,
      amount,
      proposal
    });

    await bid.save();

    res.status(201).json({
      msg: 'Bid placed successfully',
      bid
    });
  } catch (error) {
    console.error('Bid create error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/bids/tender/:tenderId - Get all bids for a tender
router.get('/tender/:tenderId', async (req, res) => {
  try {
    const bids = await Bid.find({ tenderId: req.params.tenderId }).sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    console.error('Get bids error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/bids/my-bids - Get all bids for the authenticated user
router.get('/my-bids', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // JWT payload has userId

    const bids = await Bid.find({ bidderId: userId })
      .populate('tenderId', 'title')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get my bids error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/bids/:bidId - Update bid status (admin only)
router.put('/:bidId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const bidId = req.params.bidId;

    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const bid = await Bid.findByIdAndUpdate(
      bidId,
      { status },
      { new: true }
    ).populate('tenderId', 'title').populate('bidderId', 'name');

    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    res.json({
      msg: 'Bid status updated successfully',
      bid
    });
  } catch (error) {
    console.error('Update bid error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/bids - Get all bids (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate('tenderId', 'title')
      .populate('bidderId', 'name')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get all bids error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

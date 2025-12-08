// routes/bids.js - Bid management routes
const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

// POST /api/bids - Place a new bid
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tenderId, amount, proposal } = req.body;
    const bidderId = req.user.userId; // Get user ID from JWT token

    if (!tenderId || !amount) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Check if user has already bid on this tender
    const existingBid = await Bid.findOne({ tenderId, bidderId });
    if (existingBid) {
      return res.status(400).json({
        msg: 'You have already submitted a bid for this tender. You can only submit one bid per tender.'
      });
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

// GET /api/bids/my-bids - Get all bids for the authenticated user with filters
router.get('/my-bids', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // JWT payload has userId
    const { search, status, sort, from, to } = req.query;

    let query = { bidderId: userId };

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    let bids = await Bid.find(query)
      .populate('tenderId', 'title')
      .sort({ createdAt: -1 });

    // Search filter (on tender title)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      bids = bids.filter(bid =>
        bid.tenderId && bid.tenderId.title && searchRegex.test(bid.tenderId.title)
      );
    }

    // Sort options
    if (sort) {
      switch (sort) {
        case 'newest':
          bids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          bids.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'highest':
          bids.sort((a, b) => b.amount - a.amount);
          break;
        case 'lowest':
          bids.sort((a, b) => a.amount - b.amount);
          break;
        default:
          // Keep default sort (newest first)
          break;
      }
    }

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

    // Get the bid before updating to check if status changed
    const oldBid = await Bid.findById(bidId).populate('tenderId', 'title').populate('bidderId', 'name email');

    const bid = await Bid.findByIdAndUpdate(
      bidId,
      { status },
      { new: true }
    ).populate('tenderId', 'title').populate('bidderId', 'name');

    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    // Create notification if status changed
    if (oldBid && oldBid.status !== status) {
      let title, message;
      const tenderTitle = bid.tenderId?.title || 'Tender';

      switch (status) {
        case 'accepted':
          title = 'Bid Approved';
          message = `Congratulations! Your bid for "${tenderTitle}" has been approved.`;
          break;
        case 'rejected':
          title = 'Bid Rejected';
          message = `Your bid for "${tenderTitle}" has been rejected.`;
          break;
        default:
          title = 'Bid Status Updated';
          message = `Your bid status for "${tenderTitle}" has been updated to ${status}.`;
      }

      // Create notification for the bidder
      await Notification.create({
        user: bid.bidderId._id,
        title,
        message,
        type: 'bid_status'
      });
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

// GET /api/bids/:bidId/tracking - Get bid tracking data for logged-in user
router.get('/:bidId/tracking', authenticateToken, async (req, res) => {
  console.log('Bid tracking route hit, params:', req.params, 'bidId:', req.params.bidId);
  try {
    const userId = req.user.userId;
    const bidId = req.params.bidId;

    if (!bidId || bidId === 'undefined') {
      console.log('Invalid bidId:', bidId);
      return res.status(400).json({ msg: 'Invalid bid ID' });
    }

    const bid = await Bid.findOne({ _id: bidId, bidderId: userId })
      .populate('tenderId', 'title');

    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }

    // Map bid status to tracking status
    let currentStatus;
    switch (bid.status) {
      case 'pending':
        currentStatus = 'UNDER_REVIEW';
        break;
      case 'accepted':
        currentStatus = 'APPROVED';
        break;
      case 'rejected':
        currentStatus = 'REJECTED';
        break;
      default:
        currentStatus = 'PENDING';
    }

    // Build timeline
    const timeline = [
      {
        step: 'SUBMITTED',
        label: 'Submitted',
        time: bid.createdAt,
        note: 'Bid submitted successfully'
      },
      {
        step: 'UNDER_REVIEW',
        label: 'Under Review',
        time: bid.status !== 'pending' ? bid.updatedAt : null,
        note: 'Department is reviewing your bid'
      },
      {
        step: 'TECHNICAL_EVAL',
        label: 'Technical Evaluation',
        time: bid.status !== 'pending' ? bid.updatedAt : null,
        note: 'Technical evaluation in progress'
      },
      {
        step: 'FINANCIAL_EVAL',
        label: 'Financial Evaluation',
        time: bid.status !== 'pending' ? bid.updatedAt : null,
        note: 'Financial evaluation in progress'
      },
      {
        step: 'FINAL_DECISION',
        label: 'Final Decision',
        time: bid.status !== 'pending' ? bid.updatedAt : null,
        note: bid.status === 'accepted' ? 'Bid approved' : bid.status === 'rejected' ? 'Bid rejected' : 'Final decision pending'
      }
    ];

    const trackingData = {
      bidId: bid._id,
      tenderId: bid.tenderId._id,
      tenderTitle: bid.tenderId.title,
      bidAmount: bid.amount,
      submissionDate: bid.createdAt,
      currentStatus,
      timeline
    };

    res.json(trackingData);
  } catch (error) {
    console.error('Get bid tracking error:', error.message);
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

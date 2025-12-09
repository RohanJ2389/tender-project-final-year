// routes/tenderRoutes.js - Tender management routes
const express = require('express');
const Tender = require('../models/Tender');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// POST /api/tenders - Add new tender to MongoDB
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, budget, startDate, deadline, status, department } = req.body;

    // Validation
    if (!title || !description || !budget || !startDate || !deadline || !department) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (department.trim() === '') {
      return res.status(400).json({ message: 'Department cannot be empty' });
    }

    if (budget <= 0) {
      return res.status(400).json({ message: 'Budget must be a positive number' });
    }

    const start = new Date(startDate);
    const end = new Date(deadline);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before deadline' });
    }

    const tender = new Tender({
      title: title.trim(),
      description: description.trim(),
      budget: parseFloat(budget),
      startDate: start,
      deadline: end,
      department: department.trim(),
      status: status || 'draft',
      createdBy: req.user.userId // From JWT token
    });

    await tender.save();

    res.status(201).json({
      message: 'Tender created successfully',
      tender
    });
  } catch (error) {
    console.error('Error creating tender:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    res.status(500).json({ message: 'Server error occurred while creating tender' });
  }
});

// GET /api/tenders - Fetch all tenders (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};

    // If user is not admin, only show published tenders
    if (req.user.role !== 'admin') {
      query.status = 'published';
    }

    const tenders = await Tender.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tenders);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/tenders/:id - Fetch single tender by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    res.json(tender);
  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ message: 'Server error occurred while fetching tender' });
  }
});

// PUT /api/tenders/:id - Update tender by ID
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, budget, startDate, deadline, status, department } = req.body;

    // Validation
    if (!title || !description || !budget || !startDate || !deadline || !department) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (budget <= 0) {
      return res.status(400).json({ message: 'Budget must be a positive number' });
    }

    const start = new Date(startDate);
    const end = new Date(deadline);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before deadline' });
    }

    const updatedTender = await Tender.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget),
        startDate: start,
        deadline: end,
        department: department.trim(),
        status: status || 'draft'
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!updatedTender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    res.json({
      message: 'Tender updated successfully',
      tender: updatedTender
    });
  } catch (error) {
    console.error('Error updating tender:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    res.status(500).json({ message: 'Server error occurred while updating tender' });
  }
});

// PUT /api/tenders/:id/publish - Publish tender by ID
router.put('/:id/publish', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);

    if (!tender) {
      return res.status(404).json({ msg: 'Tender not found' });
    }

    if (tender.status !== 'draft') {
      return res.status(400).json({ msg: 'Only draft tenders can be published' });
    }

    const updatedTender = await Tender.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );

    res.json(updatedTender);
  } catch (err) {
    console.error('Error publishing tender:', err);
    res.status(500).json({ msg: 'Failed to publish tender' });
  }
});

// PUT /api/tenders/:id/close - Close tender by ID
router.put('/:id/close', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedTender = await Tender.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );

    if (!updatedTender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    res.json({
      message: 'Tender closed successfully',
      tender: updatedTender
    });
  } catch (error) {
    console.error('Error closing tender:', error);
    res.status(500).json({ message: 'Server error occurred while closing tender' });
  }
});

// DELETE /api/tenders/:id - Delete tender by ID
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deletedTender = await Tender.findByIdAndDelete(req.params.id);

    if (!deletedTender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    res.json({ message: 'Tender deleted successfully' });
  } catch (error) {
    console.error('Error deleting tender:', error);
    res.status(500).json({ message: 'Server error occurred while deleting tender' });
  }
});

module.exports = router;

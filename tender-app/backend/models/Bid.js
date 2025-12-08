// models/Bid.js - Bid model for tender bidding system
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  proposal: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Transform function to include id field
bidSchema.methods.toJSON = function() {
  const bidObject = this.toObject();
  bidObject.id = bidObject._id.toString();
  return bidObject;
};

// Index for efficient queries
bidSchema.index({ tenderId: 1, bidderId: 1 });
bidSchema.index({ bidderId: 1 });

module.exports = mongoose.model('Bid', bidSchema);

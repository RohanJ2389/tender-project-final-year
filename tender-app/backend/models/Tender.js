// models/Tender.js - Tender model for tender management
const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'awarded', 'completed'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for bid count
tenderSchema.virtual('bidCount', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'tenderId',
  count: true,
});

tenderSchema.set('toJSON', { virtuals: true });
tenderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tender', tenderSchema);

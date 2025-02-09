const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }
}, { _id: false });

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  objective: {
    type: String,
    required: true,
  },
  linkedinVerified: {
    type: Boolean,
    default: false
  },
  testConfig: {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly'],
      default: 'daily'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    recipients: {
      type: [recipientSchema],
      default: []
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Add index for faster queries
campaignSchema.index({ user: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign; 
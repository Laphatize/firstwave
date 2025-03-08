const mongoose = require('mongoose');
const crypto = require('crypto');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  inviteCodes: [{
    code: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    maxUses: {
      type: Number,
      default: 1
    },
    uses: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
organizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate a new invite code
organizationSchema.methods.generateInviteCode = function(createdBy, expiresInHours = 24, maxUses = 1) {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  this.inviteCodes.push({
    code,
    createdBy,
    expiresAt,
    maxUses,
    uses: 0
  });

  return code;
};

// Validate and use an invite code
organizationSchema.methods.useInviteCode = function(code) {
  const inviteCode = this.inviteCodes.find(
    invite => invite.code === code && 
    invite.expiresAt > new Date() && 
    invite.uses < invite.maxUses
  );

  if (!inviteCode) {
    return false;
  }

  inviteCode.uses += 1;
  return true;
};

// Clean up expired invite codes
organizationSchema.methods.cleanupInviteCodes = function() {
  const now = new Date();
  this.inviteCodes = this.inviteCodes.filter(
    invite => invite.expiresAt > now && invite.uses < invite.maxUses
  );
};

module.exports = mongoose.model('Organization', organizationSchema); 
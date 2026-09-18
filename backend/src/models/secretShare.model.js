const mongoose = require('mongoose');

const secretShareSchema = new mongoose.Schema({
  shareToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  authTag: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Secret Note'
  },
  maxViews: {
    type: Number,
    default: 1,
    min: 1,
    max: 50
  },
  viewCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0 // Correct Mongoose TTL index option
  },
  passcodeHash: {
    type: String,
    default: null
  },
  isBurned: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SecretShare', secretShareSchema);

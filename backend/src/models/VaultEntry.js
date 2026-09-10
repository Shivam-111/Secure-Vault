const mongoose = require('mongoose');

const vaultEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    website: {
      type: String,
      required: [true, 'Website is required'],
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true
    },
    encryptedPassword: {
      type: String,
      required: [true, 'Encrypted password is required']
    },
    iv: {
      type: String,
      required: [true, 'IV is required']
    },
    authTag: {
      type: String,
      required: [true, 'Authentication tag is required']
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const VaultEntry = mongoose.model('VaultEntry', vaultEntrySchema);

module.exports = VaultEntry;

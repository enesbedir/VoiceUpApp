const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ServerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  inviteCode: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }],
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Davet kodu yenileme yöntemi
ServerSchema.methods.refreshInviteCode = function() {
  this.inviteCode = uuidv4();
  return this.save();
};

// Kullanıcının sunucuda olup olmadığını kontrol eden yardımcı yöntem
ServerSchema.methods.hasMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Kullanıcının sunucu sahibi olup olmadığını kontrol eden yardımcı yöntem
ServerSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

module.exports = mongoose.model('Server', ServerSchema);
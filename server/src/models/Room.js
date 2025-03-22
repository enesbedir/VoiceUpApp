const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  type: {
    type: String,
    enum: ['voice', 'video', 'text'],
    required: true
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  category: {
    type: String,
    default: 'Genel'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  permissionOverrides: [{
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    allow: {
      view: { type: Boolean, default: null },
      connect: { type: Boolean, default: null },
      speak: { type: Boolean, default: null },
      video: { type: Boolean, default: null },
      screenShare: { type: Boolean, default: null }
    },
    deny: {
      view: { type: Boolean, default: null },
      connect: { type: Boolean, default: null },
      speak: { type: Boolean, default: null },
      video: { type: Boolean, default: null },
      screenShare: { type: Boolean, default: null }
    }
  }],
  position: {
    type: Number,
    default: 0
  },
  currentUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Yardımcı metot: Kullanıcının bir odaya katılması
RoomSchema.methods.userJoin = function(userId) {
  if (!this.currentUsers.includes(userId)) {
    this.currentUsers.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Yardımcı metot: Kullanıcının bir odadan ayrılması
RoomSchema.methods.userLeave = function(userId) {
  this.currentUsers = this.currentUsers.filter(
    user => user.toString() !== userId.toString()
  );
  return this.save();
};

// Yardımcı metot: Kullanıcının bir odada olup olmadığını kontrol etme
RoomSchema.methods.hasUser = function(userId) {
  return this.currentUsers.some(user => user.toString() === userId.toString());
};

module.exports = mongoose.model('Room', RoomSchema);
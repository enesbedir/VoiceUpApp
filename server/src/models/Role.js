const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  color: {
    type: String,
    default: '#99AAB5'
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  permissions: {
    manageServer: { type: Boolean, default: false },
    manageRoles: { type: Boolean, default: false },
    manageChannels: { type: Boolean, default: false },
    kickMembers: { type: Boolean, default: false },
    banMembers: { type: Boolean, default: false },
    createInvite: { type: Boolean, default: true },
    changeNickname: { type: Boolean, default: true },
    manageNicknames: { type: Boolean, default: false },
    connectToVoice: { type: Boolean, default: true },
    speak: { type: Boolean, default: true },
    video: { type: Boolean, default: true },
    screenShare: { type: Boolean, default: true },
    muteMembers: { type: Boolean, default: false },
    deafenMembers: { type: Boolean, default: false },
    moveMembers: { type: Boolean, default: false }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  position: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Varsayılan "everyone" rolü oluşturma
RoleSchema.statics.createDefaultRole = async function(serverId) {
  return this.create({
    name: 'everyone',
    server: serverId,
    isDefault: true,
    permissions: {
      manageServer: false,
      manageRoles: false,
      manageChannels: false,
      kickMembers: false,
      banMembers: false,
      createInvite: true,
      changeNickname: true,
      manageNicknames: false,
      connectToVoice: true,
      speak: true,
      video: true,
      screenShare: true,
      muteMembers: false,
      deafenMembers: false,
      moveMembers: false
    }
  });
};

module.exports = mongoose.model('Role', RoleSchema);
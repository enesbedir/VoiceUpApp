const express = require('express');
const { body, validationResult } = require('express-validator');
const Server = require('../models/Server');
const User = require('../models/User');
const Role = require('../models/Role');
const Room = require('../models/Room');
const { protect, checkRole } = require('../utils/auth');

const router = express.Router();

// @route   POST /api/servers
// @desc    Yeni sunucu oluşturma
// @access  Private
router.post(
  '/',
  protect,
  [
    body('name').isLength({ min: 2, max: 50 }).trim(),
    body('description').optional().isLength({ max: 200 }).trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, icon } = req.body;

      // Yeni sunucu oluştur
      const server = await Server.create({
        name,
        description: description || '',
        icon: icon || '',
        owner: req.user._id,
        members: [{ user: req.user._id }]
      });

      // "everyone" varsayılan rolünü oluştur
      const everyoneRole = await Role.createDefaultRole(server._id);
      
      // İlk odaları oluştur
      const generalVoiceRoom = await Room.create({
        name: 'Genel Sesli',
        type: 'voice',
        server: server._id,
        category: 'Sesli Kanallar'
      });
      
      const generalVideoRoom = await Room.create({
        name: 'Genel Görüntülü',
        type: 'video',
        server: server._id,
        category: 'Görüntülü Kanallar'
      });
      
      const generalTextRoom = await Room.create({
        name: 'genel',
        type: 'text',
        server: server._id,
        category: 'Metin Kanalları'
      });
      
      // Sunucu bilgilerini güncelle
      server.roles.push(everyoneRole._id);
      server.rooms.push(generalVoiceRoom._id, generalVideoRoom._id, generalTextRoom._id);
      await server.save();
      
      // Kullanıcının sunucu listesini güncelle
      const user = await User.findById(req.user._id);
      user.servers.push(server._id);
      await user.save();
      
      res.status(201).json({
        server: {
          _id: server._id,
          name: server.name,
          description: server.description,
          icon: server.icon,
          inviteCode: server.inviteCode,
          owner: server.owner,
          members: server.members,
          rooms: server.rooms,
          roles: server.roles
        }
      });
    } catch (error) {
      console.error('Sunucu oluşturma hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
);

// @route   GET /api/servers
// @desc    Kullanıcının katıldığı sunucuları getirme
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Kullanıcının sunucu listesini al
    const user = await User.findById(req.user._id).populate('servers');
    
    res.json(user.servers);
  } catch (error) {
    console.error('Sunucuları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/servers/:id
// @desc    Belirli bir sunucunun detaylarını getirme
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('owner', 'username displayName avatar')
      .populate({
        path: 'members.user',
        select: 'username displayName avatar status'
      })
      .populate('roles')
      .populate({
        path: 'rooms',
        populate: {
          path: 'currentUsers',
          select: 'username displayName avatar status'
        }
      });
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcının bu sunucuya erişimi var mı kontrol et
    if (!server.hasMember(req.user._id)) {
      return res.status(403).json({ message: 'Bu sunucuya erişim izniniz yok' });
    }
    
    res.json(server);
  } catch (error) {
    console.error('Sunucu detaylarını getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/servers/:id
// @desc    Sunucu bilgilerini güncelleme
// @access  Private
router.put(
  '/:id',
  protect,
  [
    body('name').optional().isLength({ min: 2, max: 50 }).trim(),
    body('description').optional().isLength({ max: 200 }).trim(),
    body('icon').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const server = await Server.findById(req.params.id);
      
      if (!server) {
        return res.status(404).json({ message: 'Sunucu bulunamadı' });
      }
      
      // Kullanıcının sunucu sahibi olup olmadığını kontrol et
      if (!server.isOwner(req.user._id)) {
        return res.status(403).json({ message: 'Sunucu ayarlarını değiştirmek için sunucu sahibi olmalısınız' });
      }
      
      const { name, description, icon } = req.body;
      
      if (name) server.name = name;
      if (description !== undefined) server.description = description;
      if (icon !== undefined) server.icon = icon;
      
      const updatedServer = await server.save();
      
      res.json(updatedServer);
    } catch (error) {
      console.error('Sunucu güncelleme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
);

// @route   DELETE /api/servers/:id
// @desc    Sunucu silme
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcının sunucu sahibi olup olmadığını kontrol et
    if (!server.isOwner(req.user._id)) {
      return res.status(403).json({ message: 'Sunucuyu silmek için sunucu sahibi olmalısınız' });
    }
    
    // Sunucunun odalarını sil
    await Room.deleteMany({ server: server._id });
    
    // Sunucunun rollerini sil
    await Role.deleteMany({ server: server._id });
    
    // Kullanıcıların sunucu listesinden sunucuyu sil
    await User.updateMany(
      { servers: server._id },
      { $pull: { servers: server._id } }
    );
    
    // Sunucuyu sil
    await server.deleteOne();
    
    res.json({ message: 'Sunucu başarıyla silindi' });
  } catch (error) {
    console.error('Sunucu silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/servers/join/:inviteCode
// @desc    Davet kodu ile sunucuya katılma
// @access  Private
router.post('/join/:inviteCode', protect, async (req, res) => {
  try {
    const server = await Server.findOne({ inviteCode: req.params.inviteCode });
    
    if (!server) {
      return res.status(404).json({ message: 'Geçersiz davet kodu' });
    }
    
    // Kullanıcı zaten sunucuda mı kontrol et
    if (server.hasMember(req.user._id)) {
      return res.status(400).json({ message: 'Zaten bu sunucunun üyesisiniz' });
    }
    
    // Kullanıcıyı sunucuya ekle
    const everyoneRole = await Role.findOne({
      server: server._id,
      isDefault: true
    });
    
    server.members.push({
      user: req.user._id,
      roles: [everyoneRole._id]
    });
    
    await server.save();
    
    // Kullanıcının sunucu listesini güncelle
    const user = await User.findById(req.user._id);
    user.servers.push(server._id);
    await user.save();
    
    res.status(200).json({
      message: 'Sunucuya başarıyla katıldınız',
      server: {
        _id: server._id,
        name: server.name,
        icon: server.icon
      }
    });
  } catch (error) {
    console.error('Sunucuya katılma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/servers/:id/refresh-invite
// @desc    Davet kodunu yenileme
// @access  Private
router.post('/:id/refresh-invite', protect, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcının sunucu sahibi olup olmadığını kontrol et
    if (!server.isOwner(req.user._id)) {
      return res.status(403).json({ message: 'Davet kodunu yenilemek için sunucu sahibi olmalısınız' });
    }
    
    // Davet kodunu yenile
    await server.refreshInviteCode();
    
    res.json({ inviteCode: server.inviteCode });
  } catch (error) {
    console.error('Davet kodu yenileme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/servers/:id/leave
// @desc    Sunucudan ayrılma
// @access  Private
router.delete('/:id/leave', protect, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcı sunucu sahibi mi kontrol et
    if (server.isOwner(req.user._id)) {
      return res.status(400).json({ message: 'Sunucu sahibi sunucudan ayrılamaz. Sunucuyu silmek veya başka bir kullanıcıya devretmek gerekiyor.' });
    }
    
    // Kullanıcının sunucunun üyesi olup olmadığını kontrol et
    if (!server.hasMember(req.user._id)) {
      return res.status(400).json({ message: 'Bu sunucunun üyesi değilsiniz' });
    }
    
    // Kullanıcıyı sunucudan çıkar
    server.members = server.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );
    
    await server.save();
    
    // Kullanıcının sunucu listesinden sunucuyu çıkar
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { servers: server._id } }
    );
    
    res.json({ message: 'Sunucudan başarıyla ayrıldınız' });
  } catch (error) {
    console.error('Sunucudan ayrılma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
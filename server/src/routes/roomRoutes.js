const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const Server = require('../models/Server');
const { protect, checkRole } = require('../utils/auth');

const router = express.Router();

// @route   POST /api/rooms
// @desc    Yeni oda oluşturma
// @access  Private
router.post(
  '/',
  protect,
  [
    body('name').isLength({ min: 2, max: 30 }).trim(),
    body('type').isIn(['voice', 'video', 'text']),
    body('serverId').isMongoId(),
    body('category').optional().trim(),
    body('description').optional().isLength({ max: 100 }).trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, type, serverId, category, description } = req.body;

      // Sunucuyu bul
      const server = await Server.findById(serverId);
      
      if (!server) {
        return res.status(404).json({ message: 'Sunucu bulunamadı' });
      }
      
      // Kullanıcının yetki kontrolü
      const isOwner = server.owner.toString() === req.user._id.toString();
      const isMember = server.members.some(member => 
        member.user.toString() === req.user._id.toString()
      );
      
      if (!isOwner && !isMember) {
        return res.status(403).json({ message: 'Bu sunucuda oda oluşturma yetkiniz yok' });
      }
      
      // Kullanıcı sunucu sahibi değilse, yetki kontrolü
      if (!isOwner) {
        return checkRole(serverId, ['manageChannels'])(req, res, async () => {
          // Odanın pozisyonunu belirle
          const roomCount = await Room.countDocuments({ 
            server: serverId,
            type
          });
          
          // Yeni oda oluştur
          const room = await Room.create({
            name,
            type,
            server: serverId,
            category: category || getDefaultCategory(type),
            description: description || '',
            position: roomCount
          });
          
          // Sunucu bilgisini güncelle
          server.rooms.push(room._id);
          await server.save();
          
          res.status(201).json(room);
        });
      } else {
        // Odanın pozisyonunu belirle
        const roomCount = await Room.countDocuments({ 
          server: serverId,
          type
        });
        
        // Yeni oda oluştur
        const room = await Room.create({
          name,
          type,
          server: serverId,
          category: category || getDefaultCategory(type),
          description: description || '',
          position: roomCount
        });
        
        // Sunucu bilgisini güncelle
        server.rooms.push(room._id);
        await server.save();
        
        res.status(201).json(room);
      }
    } catch (error) {
      console.error('Oda oluşturma hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
);

// Oda tipi için varsayılan kategori belirleme
function getDefaultCategory(type) {
  switch (type) {
    case 'voice':
      return 'Sesli Kanallar';
    case 'video':
      return 'Görüntülü Kanallar';
    case 'text':
      return 'Metin Kanalları';
    default:
      return 'Genel';
  }
}

// @route   GET /api/rooms/server/:serverId
// @desc    Sunucudaki tüm odaları getirme
// @access  Private
router.get('/server/:serverId', protect, async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcının sunucu üyesi olup olmadığını kontrol et
    const isMember = server.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Bu sunucuya erişim izniniz yok' });
    }
    
    // Sunucudaki odaları getir
    const rooms = await Room.find({ server: req.params.serverId })
      .populate('currentUsers', 'username displayName avatar status')
      .sort({ category: 1, position: 1 });
    
    res.json(rooms);
  } catch (error) {
    console.error('Odaları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/rooms/:id
// @desc    Belirli bir odanın detaylarını getirme
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('currentUsers', 'username displayName avatar status');
    
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }
    
    // Sunucuyu bul
    const server = await Server.findById(room.server);
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcının sunucu üyesi olup olmadığını kontrol et
    const isMember = server.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Bu odaya erişim izniniz yok' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Oda detaylarını getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Oda bilgilerini güncelleme
// @access  Private
router.put(
  '/:id',
  protect,
  [
    body('name').optional().isLength({ min: 2, max: 30 }).trim(),
    body('category').optional().trim(),
    body('description').optional().isLength({ max: 100 }).trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const room = await Room.findById(req.params.id);
      
      if (!room) {
        return res.status(404).json({ message: 'Oda bulunamadı' });
      }
      
      // Sunucuyu bul
      const server = await Server.findById(room.server);
      
      if (!server) {
        return res.status(404).json({ message: 'Sunucu bulunamadı' });
      }
      
      // Kullanıcının yetkisini kontrol et
      const isOwner = server.owner.toString() === req.user._id.toString();
      
      if (!isOwner) {
        return checkRole(server._id, ['manageChannels'])(req, res, async () => {
          const { name, category, description } = req.body;
          
          if (name) room.name = name;
          if (category) room.category = category;
          if (description !== undefined) room.description = description;
          
          const updatedRoom = await room.save();
          
          res.json(updatedRoom);
        });
      } else {
        const { name, category, description } = req.body;
        
        if (name) room.name = name;
        if (category) room.category = category;
        if (description !== undefined) room.description = description;
        
        const updatedRoom = await room.save();
        
        res.json(updatedRoom);
      }
    } catch (error) {
      console.error('Oda güncelleme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
);

// @route   DELETE /api/rooms/:id
// @desc    Oda silme
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }
    
    // Sunucuyu bul
    const server = await Server.findById(room.server);
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcının yetkisini kontrol et
    const isOwner = server.owner.toString() === req.user._id.toString();
    
    if (!isOwner) {
      return checkRole(server._id, ['manageChannels'])(req, res, async () => {
        // Odayı sil
        await room.deleteOne();
        
        // Sunucu bilgisini güncelle
        server.rooms = server.rooms.filter(r => r.toString() !== req.params.id);
        await server.save();
        
        res.json({ message: 'Oda başarıyla silindi' });
      });
    } else {
      // Odayı sil
      await room.deleteOne();
      
      // Sunucu bilgisini güncelle
      server.rooms = server.rooms.filter(r => r.toString() !== req.params.id);
      await server.save();
      
      res.json({ message: 'Oda başarıyla silindi' });
    }
  } catch (error) {
    console.error('Oda silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/rooms/:id/join
// @desc    Odaya katılma
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }
    
    // Sunucuyu bul
    const server = await Server.findById(room.server);
    
    if (!server) {
      return res.status(404).json({ message: 'Sunucu bulunamadı' });
    }
    
    // Kullanıcının sunucu üyesi olup olmadığını kontrol et
    const isMember = server.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Bu odaya katılma izniniz yok' });
    }
    
    // Odaya katıl
    await room.userJoin(req.user._id);
    
    res.json({ message: 'Odaya başarıyla katıldınız' });
  } catch (error) {
    console.error('Odaya katılma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/rooms/:id/leave
// @desc    Odadan ayrılma
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }
    
    // Odadan ayrıl
    await room.userLeave(req.user._id);
    
    res.json({ message: 'Odadan başarıyla ayrıldınız' });
  } catch (error) {
    console.error('Odadan ayrılma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
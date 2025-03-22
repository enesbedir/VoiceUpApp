const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, protect } = require('../utils/auth');

const router = express.Router();

// @route   POST /api/users/register
// @desc    Kullanıcı kaydı
// @access  Public
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 30 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Validasyon kontrolleri
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Kullanıcı zaten kayıtlı mı kontrol et
      const userExists = await User.findOne({ 
        $or: [
          { email },
          { username }
        ]
      });

      if (userExists) {
        if (userExists.email === email) {
          return res.status(400).json({ message: 'Bu e-posta zaten kullanılıyor' });
        }
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
      }

      // Yeni kullanıcı oluştur
      const user = await User.create({
        username,
        email,
        password,
        displayName: username
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          token: generateToken(user)
        });
      } else {
        res.status(400).json({ message: 'Geçersiz kullanıcı bilgileri' });
      }
    } catch (error) {
      console.error('Kullanıcı kaydı hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
);

// @route   POST /api/users/login
// @desc    Kullanıcı girişi ve token alma
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kullanıcıyı e-postaya göre bul
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Şifreleri karşılaştır
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Kullanıcı durumunu güncelle
    user.status = 'online';
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      status: user.status,
      token: generateToken(user)
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/users/profile
// @desc    Kullanıcı profilini getirme
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('friends', 'username displayName avatar status');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/profile
// @desc    Kullanıcı profilini güncelleme
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('displayName').optional().isLength({ min: 3, max: 30 }).trim(),
    body('avatar').optional().isURL(),
    body('status').optional().isIn(['online', 'idle', 'doNotDisturb', 'offline'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { displayName, avatar, status } = req.body;
      
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
      
      if (displayName) user.displayName = displayName;
      if (avatar) user.avatar = avatar;
      if (status) user.status = status;
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
        status: updatedUser.status
      });
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
);

// @route   POST /api/users/friends/request/:id
// @desc    Arkadaşlık isteği gönderme
// @access  Private
router.post('/friends/request/:id', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendinize arkadaşlık isteği gönderemezsiniz' });
    }
    
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // İsteğin zaten gönderilmiş olup olmadığını kontrol et
    const alreadySent = targetUser.friendRequests.some(
      fr => fr.from.toString() === req.user._id.toString()
    );
    
    if (alreadySent) {
      return res.status(400).json({ message: 'Bu kullanıcıya zaten istek gönderdiniz' });
    }
    
    // Zaten arkadaş olup olmadıklarını kontrol et
    const alreadyFriends = targetUser.friends.includes(req.user._id);
    
    if (alreadyFriends) {
      return res.status(400).json({ message: 'Bu kullanıcı zaten arkadaşınız' });
    }
    
    // Arkadaşlık isteği gönder
    targetUser.friendRequests.push({
      from: req.user._id,
      status: 'pending'
    });
    
    await targetUser.save();
    
    res.status(201).json({ message: 'Arkadaşlık isteği gönderildi' });
  } catch (error) {
    console.error('Arkadaşlık isteği gönderme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/friends/respond/:id
// @desc    Arkadaşlık isteğine yanıt verme
// @access  Private
router.put('/friends/respond/:id', protect, async (req, res) => {
  try {
    const { response } = req.body;
    
    if (response !== 'accepted' && response !== 'rejected') {
      return res.status(400).json({ message: 'Geçersiz yanıt' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // İsteği bul
    const requestIndex = user.friendRequests.findIndex(
      fr => fr.from.toString() === req.params.id
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Arkadaşlık isteği bulunamadı' });
    }
    
    const request = user.friendRequests[requestIndex];
    
    if (response === 'accepted') {
      // Arkadaşlık isteğini kabul et
      user.friends.push(request.from);
      
      // Diğer kullanıcının arkadaş listesine de ekle
      const otherUser = await User.findById(req.params.id);
      otherUser.friends.push(user._id);
      await otherUser.save();
    }
    
    // İsteği listeden kaldır
    user.friendRequests.splice(requestIndex, 1);
    await user.save();
    
    res.json({ message: `Arkadaşlık isteği ${response === 'accepted' ? 'kabul edildi' : 'reddedildi'}` });
  } catch (error) {
    console.error('Arkadaşlık isteği yanıtlama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/users/friends/:id
// @desc    Arkadaşlıktan çıkarma
// @access  Private
router.delete('/friends/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otherUser = await User.findById(req.params.id);
    
    if (!user || !otherUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcının arkadaş listesinden çıkar
    user.friends = user.friends.filter(
      friend => friend.toString() !== req.params.id
    );
    
    // Diğer kullanıcının arkadaş listesinden de çıkar
    otherUser.friends = otherUser.friends.filter(
      friend => friend.toString() !== req.user._id.toString()
    );
    
    await user.save();
    await otherUser.save();
    
    res.json({ message: 'Arkadaşlıktan çıkarıldı' });
  } catch (error) {
    console.error('Arkadaşlıktan çıkarma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token oluşturma
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: '30d' }
  );
};

// Kimlik doğrulama middleware
const protect = async (req, res, next) => {
  let token;

  // Token'ı headers'tan alma
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Token doğrulama
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_jwt_secret'
      );

      // Kullanıcıyı bulma ve req.user'a atama (şifre hariç)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('JWT doğrulama hatası:', error);
      res.status(401).json({ message: 'Yetkiniz yok, token geçersiz' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Yetkiniz yok, token bulunamadı' });
  }
};

// Rol kontrol middleware
const checkRole = (serverId, requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Kullanıcının sunucudaki üyeliğini bulma
      const server = await Server.findById(serverId);
      
      if (!server) {
        return res.status(404).json({ message: 'Sunucu bulunamadı' });
      }
      
      // Kullanıcının sunucunun sahibi olup olmadığını kontrol etme
      if (server.owner.toString() === req.user._id.toString()) {
        // Sunucu sahibi ise tüm izinlere sahip
        return next();
      }
      
      // Kullanıcının sunucudaki üyeliğini bulma
      const memberIndex = server.members.findIndex(
        member => member.user.toString() === req.user._id.toString()
      );
      
      if (memberIndex === -1) {
        return res.status(403).json({ message: 'Bu sunucuya erişim izniniz yok' });
      }
      
      // Kullanıcının rollerini bulma
      const memberRoles = server.members[memberIndex].roles;
      
      // Eğer gerekli izin yoksa direkt geçiş izni ver
      if (requiredPermissions.length === 0) {
        return next();
      }
      
      // Kullanıcının izinlerini kontrol etme
      const roles = await Role.find({
        _id: { $in: memberRoles }
      });
      
      // İzinleri kontrol etme
      const hasPermission = requiredPermissions.every(permission => 
        roles.some(role => role.permissions[permission])
      );
      
      if (hasPermission) {
        return next();
      }
      
      res.status(403).json({ message: 'Bu işlem için gerekli izinleriniz yok' });
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  };
};

module.exports = { generateToken, protect, checkRole };
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const Server = require('../models/Server');

// Kullanıcı - soket ilişkisi
const userSockets = new Map();
// Oda - kullanıcılar ilişkisi
const roomUsers = new Map();

// JWT token'ından kullanıcı kimliğini çıkaran yardımcı fonksiyon
const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_jwt_secret'
    );
    return await User.findById(decoded.id).select('-password');
  } catch (error) {
    console.error('Socket kimlik doğrulama hatası:', error);
    return null;
  }
};

// Ana socket bağlantı yöneticisi
const handleSocketConnection = (io, socket) => {
  console.log('Yeni istemci bağlandı:', socket.id);

  // Kimlik doğrulama
  socket.on('authenticate', async ({ token }) => {
    try {
      const user = await getUserFromToken(token);
      
      if (!user) {
        socket.emit('auth_error', { message: 'Kimlik doğrulama başarısız' });
        return;
      }
      
      console.log(`Kullanıcı ${user.username} bağlandı`);
      
      // Kullanıcı kimliğini soket ile ilişkilendir
      socket.userId = user._id;
      socket.username = user.username;
      
      // Soket ve kullanıcı ilişkisini kaydet
      if (!userSockets.has(user._id.toString())) {
        userSockets.set(user._id.toString(), new Set());
      }
      userSockets.get(user._id.toString()).add(socket.id);
      
      // Kullanıcı durumunu güncelle
      user.status = 'online';
      await user.save();
      
      // Kullanıcıya özel bir oda oluştur
      socket.join(`user:${user._id}`);
      
      // Arkadaşlara çevrimiçi durumunu bildir
      if (user.friends && user.friends.length > 0) {
        user.friends.forEach(friendId => {
          io.to(`user:${friendId}`).emit('friend_status_change', {
            userId: user._id,
            status: 'online'
          });
        });
      }
      
      // Kimlik doğrulama başarılı bildirimi
      socket.emit('authenticated', { userId: user._id });
      
      // Kullanıcının odalarını ve sunucularını otomatik olarak yükle
      const userServers = await Server.find({
        'members.user': user._id
      }).select('_id');
      
      // Sunucu odalarına katıl
      userServers.forEach(server => {
        socket.join(`server:${server._id}`);
      });
    } catch (error) {
      console.error('Kimlik doğrulama hatası:', error);
      socket.emit('auth_error', { message: 'Kimlik doğrulama hatası' });
    }
  });

  // Oda katılımı
  socket.on('join_room', async ({ roomId }) => {
    try {
      // Kullanıcı kimliği kontrolü
      if (!socket.userId) {
        socket.emit('error', { message: 'Kimlik doğrulama gerekiyor' });
        return;
      }
      
      const room = await Room.findById(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Oda bulunamadı' });
        return;
      }
      
      // Sunucuyu kontrol et
      const server = await Server.findById(room.server);
      
      if (!server) {
        socket.emit('error', { message: 'Sunucu bulunamadı' });
        return;
      }
      
      // Kullanıcının sunucu üyesi olup olmadığını kontrol et
      const isMember = server.members.some(member => 
        member.user.toString() === socket.userId.toString()
      );
      
      if (!isMember) {
        socket.emit('error', { message: 'Bu odaya katılma izniniz yok' });
        return;
      }
      
      // Odaya katıl
      await room.userJoin(socket.userId);
      socket.join(`room:${roomId}`);
      
      // Oda kullanıcılarını güncelle
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(socket.userId.toString());
      
      // Oda üyelerine katılımı bildir
      io.to(`room:${roomId}`).emit('user_joined_room', {
        roomId,
        user: {
          _id: socket.userId,
          username: socket.username
        }
      });
      
      // Kullanıcı bilgisini diğer kullanıcılara gönder
      const currentUsers = await User.find({
        _id: { $in: Array.from(roomUsers.get(roomId)) }
      }).select('_id username displayName avatar status');
      
      socket.emit('room_users', {
        roomId,
        users: currentUsers
      });
      
      console.log(`Kullanıcı ${socket.username} ${roomId} odasına katıldı`);
    } catch (error) {
      console.error('Odaya katılma hatası:', error);
      socket.emit('error', { message: 'Odaya katılma hatası' });
    }
  });

  // Odadan ayrılma
  socket.on('leave_room', async ({ roomId }) => {
    try {
      // Kullanıcı kimliği kontrolü
      if (!socket.userId) {
        socket.emit('error', { message: 'Kimlik doğrulama gerekiyor' });
        return;
      }
      
      const room = await Room.findById(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Oda bulunamadı' });
        return;
      }
      
      // Odadan ayrıl
      await room.userLeave(socket.userId);
      socket.leave(`room:${roomId}`);
      
      // Oda kullanıcılarını güncelle
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.userId.toString());
        
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
        }
      }
      
      // Oda üyelerine ayrılışı bildir
      io.to(`room:${roomId}`).emit('user_left_room', {
        roomId,
        userId: socket.userId
      });
      
      console.log(`Kullanıcı ${socket.username} ${roomId} odasından ayrıldı`);
    } catch (error) {
      console.error('Odadan ayrılma hatası:', error);
      socket.emit('error', { message: 'Odadan ayrılma hatası' });
    }
  });

  // WebRTC sinyal iletimi
  socket.on('send_signal', ({ roomId, userId, signal }) => {
    try {
      // Alıcı kullanıcıya sinyal iletimi
      io.to(`user:${userId}`).emit('receive_signal', {
        roomId,
        userId: socket.userId,
        signal
      });
    } catch (error) {
      console.error('Sinyal iletimi hatası:', error);
      socket.emit('error', { message: 'Sinyal iletimi hatası' });
    }
  });

  // Medya durum değişikliği (kamera, mikrofon)
  socket.on('media_state_change', ({ roomId, video, audio }) => {
    try {
      io.to(`room:${roomId}`).emit('user_media_state', {
        roomId,
        userId: socket.userId,
        video,
        audio
      });
    } catch (error) {
      console.error('Medya durum değişikliği hatası:', error);
      socket.emit('error', { message: 'Medya durum değişikliği hatası' });
    }
  });

  // Ekran paylaşımı
  socket.on('screen_share_state', ({ roomId, sharing }) => {
    try {
      io.to(`room:${roomId}`).emit('user_screen_share', {
        roomId,
        userId: socket.userId,
        sharing
      });
    } catch (error) {
      console.error('Ekran paylaşımı durum değişikliği hatası:', error);
      socket.emit('error', { message: 'Ekran paylaşımı durum değişikliği hatası' });
    }
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', async () => {
    try {
      console.log('İstemci bağlantısı koptu:', socket.id);
      
      if (socket.userId) {
        // Kullanıcı - soket ilişkisini güncelle
        if (userSockets.has(socket.userId.toString())) {
          userSockets.get(socket.userId.toString()).delete(socket.id);
          
          // Kullanıcının tüm soketleri kapatıldıysa
          if (userSockets.get(socket.userId.toString()).size === 0) {
            userSockets.delete(socket.userId.toString());
            
            // Kullanıcı durumunu güncelle
            const user = await User.findById(socket.userId);
            if (user) {
              user.status = 'offline';
              await user.save();
              
              // Arkadaşlara çevrimdışı durumunu bildir
              if (user.friends && user.friends.length > 0) {
                user.friends.forEach(friendId => {
                  io.to(`user:${friendId}`).emit('friend_status_change', {
                    userId: user._id,
                    status: 'offline'
                  });
                });
              }
            }
            
            // Kullanıcının bulunduğu tüm odalardan çıkar
            const rooms = await Room.find({
              currentUsers: socket.userId
            });
            
            for (const room of rooms) {
              await room.userLeave(socket.userId);
              
              // Oda kullanıcılarını güncelle
              if (roomUsers.has(room._id.toString())) {
                roomUsers.get(room._id.toString()).delete(socket.userId.toString());
                
                if (roomUsers.get(room._id.toString()).size === 0) {
                  roomUsers.delete(room._id.toString());
                }
              }
              
              // Oda üyelerine ayrılışı bildir
              io.to(`room:${room._id}`).emit('user_left_room', {
                roomId: room._id,
                userId: socket.userId
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Bağlantı kesme hatası:', error);
    }
  });
};

module.exports = { handleSocketConnection };
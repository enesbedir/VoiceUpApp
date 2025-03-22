import { io } from 'socket.io-client';
import { setConnected, setAuthenticated } from './socketSlice';
import { addActiveRoomUser, removeActiveRoomUser, setUserMediaState } from '../rooms/roomSlice';

class SocketManager {
  constructor() {
    this.socket = null;
    this.store = null;
  }

  // Redux store'u ayarlama
  setStore(store) {
    this.store = store;
  }

  // Socket bağlantısını başlatma
  connect(token) {
    if (this.socket) {
      // Eğer zaten bir socket varsa, yeniden bağlanmadan önce mevcut bağlantıyı kapat
      this.disconnect();
    }

    // Soket bağlantısını oluştur
    this.socket = io(process.env.REACT_APP_SOCKET_URL || '', {
      auth: {
        token,
      },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    
    return this.socket;
  }

  // Socket bağlantısını sonlandırma
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;

      if (this.store) {
        this.store.dispatch(setConnected(false));
        this.store.dispatch(setAuthenticated(false));
      }
    }
  }

  // Socket olay dinleyicilerini kurma
  setupEventListeners() {
    if (!this.socket || !this.store) {
      return;
    }

    // Bağlantı başarılı
    this.socket.on('connect', () => {
      this.store.dispatch(setConnected(true));
    });

    // Bağlantı kesildi
    this.socket.on('disconnect', () => {
      this.store.dispatch(setConnected(false));
      this.store.dispatch(setAuthenticated(false));
    });

    // Kimlik doğrulama başarılı
    this.socket.on('authenticated', () => {
      this.store.dispatch(setAuthenticated(true));
    });

    // Kimlik doğrulama hatası
    this.socket.on('unauthorized', () => {
      this.store.dispatch(setAuthenticated(false));
      this.disconnect();
    });

    // Kullanıcı odaya katıldı
    this.socket.on('userJoinedRoom', (user) => {
      this.store.dispatch(addActiveRoomUser(user));
    });

    // Kullanıcı odadan ayrıldı
    this.socket.on('userLeftRoom', (userId) => {
      this.store.dispatch(removeActiveRoomUser(userId));
    });

    // Kullanıcı medya durumu güncellendi
    this.socket.on('userMediaUpdate', ({ userId, mediaState }) => {
      this.store.dispatch(setUserMediaState({ userId, mediaState }));
    });
  }

  // Soket üzerinden odaya katılma
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomId });
    }
  }

  // Soket üzerinden odadan ayrılma
  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId });
    }
  }

  // Kullanıcı medya durumunu güncelleme
  updateMediaState(mediaState) {
    if (this.socket) {
      this.socket.emit('updateMediaState', mediaState);
    }
  }

  // Sinyal verilerini iletme
  sendSignal(userId, signal) {
    if (this.socket) {
      this.socket.emit('signal', { userId, signal });
    }
  }

  // Sinyal verilerini dinleme
  onSignal(callback) {
    if (this.socket) {
      this.socket.on('signal', callback);
    }
  }

  // Özel olayları dinleme için genel metot
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Özel olayları tetikleme için genel metot
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Singleton örnek oluştur
const socketManager = new SocketManager();

export default socketManager;
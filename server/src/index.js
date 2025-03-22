require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const serverRoutes = require('./routes/serverRoutes');
const roomRoutes = require('./routes/roomRoutes');
const { handleSocketConnection } = require('./socket/socketManager');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/rooms', roomRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
  handleSocketConnection(io, socket);
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voiceup')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    
    // Start Server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
    });
  })
  .catch((error) => {
    console.error('MongoDB bağlantı hatası:', error);
  });

// Hata yakalama
process.on('unhandledRejection', (error) => {
  console.error('İşlenmeyen Promise Reddi:', error);
});
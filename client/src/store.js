import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import serverReducer from './features/servers/serverSlice';
import roomReducer from './features/rooms/roomSlice';
import uiReducer from './features/ui/uiSlice';
import socketReducer from './features/socket/socketSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    servers: serverReducer,
    rooms: roomReducer,
    ui: uiReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // SimplePeer ve Socket.io nesneleri serileştirilemez
        ignoredActions: [
          'socket/setSocket', 
          'rooms/setActivePeer', 
          'rooms/addPeer', 
          'rooms/removePeer'
        ],
        ignoredPaths: [
          'socket.socket', 
          'rooms.activePeers',
          'rooms.localStream'
        ],
      },
    }),
});

export default store;
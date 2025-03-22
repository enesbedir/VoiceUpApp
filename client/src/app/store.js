import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import serverReducer from '../features/servers/serverSlice';
import roomReducer from '../features/rooms/roomSlice';
import socketReducer from '../features/socket/socketSlice';
import settingsReducer from '../features/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    servers: serverReducer,
    rooms: roomReducer,
    socket: socketReducer,
    settings: settingsReducer,
  },
});
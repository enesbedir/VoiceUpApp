import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import serverReducer from '../features/servers/serverSlice';
import roomReducer from '../features/rooms/roomSlice';
import socketReducer from '../features/socket/socketSlice';
import settingsReducer from '../features/settings/settingsSlice';
import friendReducer from '../features/friends/friendSlice';
import messageReducer from '../features/messages/messageSlice';
import channelReducer from '../features/channels/channelSlice';
import roleReducer from '../features/roles/roleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    servers: serverReducer,
    rooms: roomReducer,
    socket: socketReducer,
    settings: settingsReducer,
    friends: friendReducer,
    messages: messageReducer,
    channels: channelReducer,
    roles: roleReducer,
  },
});
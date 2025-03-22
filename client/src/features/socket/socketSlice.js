import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socket: null,
  isConnected: false,
  isAuthenticated: false,
};

export const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setSocketAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    resetSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      state.socket = null;
      state.isConnected = false;
      state.isAuthenticated = false;
    },
  },
});

export const { 
  setSocket, 
  setSocketConnected, 
  setSocketAuthenticated, 
  resetSocket 
} = socketSlice.actions;
export default socketSlice.reducer;
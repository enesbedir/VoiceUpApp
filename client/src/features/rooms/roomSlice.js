import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomService from './roomService';

const initialState = {
  rooms: [],
  activeRoom: null,
  activeRoomUsers: [],
  localStream: null,
  screenStream: null,
  activePeers: {},
  mediaState: {
    audio: true,
    video: false,
    screenShare: false,
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Sunucudaki odaları getirme
export const getServerRooms = createAsyncThunk(
  'rooms/getServerRooms',
  async (serverId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.getServerRooms(serverId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Oda detaylarını getirme
export const getRoomDetails = createAsyncThunk(
  'rooms/getRoomDetails',
  async (roomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.getRoomDetails(roomId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Yeni oda oluşturma
export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.createRoom(roomData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Oda güncelleme
export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ roomId, roomData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.updateRoom(roomId, roomData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Oda silme
export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (roomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.deleteRoom(roomId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Odaya katılma
export const joinRoom = createAsyncThunk(
  'rooms/joinRoom',
  async (roomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.joinRoom(roomId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Odadan ayrılma
export const leaveRoom = createAsyncThunk(
  'rooms/leaveRoom',
  async (roomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.leaveRoom(roomId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    resetActiveRoom: (state) => {
      state.activeRoom = null;
      state.activeRoomUsers = [];
    },
    setActiveRoomUsers: (state, action) => {
      state.activeRoomUsers = action.payload;
    },
    addActiveRoomUser: (state, action) => {
      if (!state.activeRoomUsers.some(user => user._id === action.payload._id)) {
        state.activeRoomUsers.push(action.payload);
      }
    },
    removeActiveRoomUser: (state, action) => {
      state.activeRoomUsers = state.activeRoomUsers.filter(
        user => user._id !== action.payload
      );
    },
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setScreenStream: (state, action) => {
      state.screenStream = action.payload;
    },
    setMediaState: (state, action) => {
      state.mediaState = { ...state.mediaState, ...action.payload };
    },
    addPeer: (state, action) => {
      const { userId, peer } = action.payload;
      state.activePeers[userId] = peer;
    },
    removePeer: (state, action) => {
      const userId = action.payload;
      
      if (state.activePeers[userId]) {
        delete state.activePeers[userId];
      }
    },
    setUserMediaState: (state, action) => {
      const { userId, mediaState } = action.payload;
      const userIndex = state.activeRoomUsers.findIndex(user => user._id === userId);
      
      if (userIndex !== -1) {
        state.activeRoomUsers[userIndex].mediaState = { 
          ...state.activeRoomUsers[userIndex].mediaState,
          ...mediaState 
        };
      }
    },
    resetRoomState: (state) => {
      // Temizleme işlemleri
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      
      if (state.screenStream) {
        state.screenStream.getTracks().forEach(track => track.stop());
      }
      
      Object.values(state.activePeers).forEach(peer => {
        if (peer && peer.destroy) {
          peer.destroy();
        }
      });
      
      state.activeRoom = null;
      state.activeRoomUsers = [];
      state.localStream = null;
      state.screenStream = null;
      state.activePeers = {};
      state.mediaState = {
        audio: true,
        video: false,
        screenShare: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Sunucudaki odaları getirme
      .addCase(getServerRooms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServerRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms = action.payload;
      })
      .addCase(getServerRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Oda detaylarını getirme
      .addCase(getRoomDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoomDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeRoom = action.payload;
        state.activeRoomUsers = action.payload.currentUsers || [];
      })
      .addCase(getRoomDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Yeni oda oluşturma
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Oda güncelleme
      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Oda listesini güncelle
        const index = state.rooms.findIndex(
          (room) => room._id === action.payload._id
        );
        
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        
        // Aktif oda ise onu da güncelle
        if (state.activeRoom && state.activeRoom._id === action.payload._id) {
          state.activeRoom = {
            ...state.activeRoom,
            ...action.payload
          };
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Oda silme
      .addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms = state.rooms.filter(
          (room) => room._id !== action.meta.arg
        );
        if (state.activeRoom && state.activeRoom._id === action.meta.arg) {
          state.activeRoom = null;
          state.activeRoomUsers = [];
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Odaya katılma
      .addCase(joinRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(joinRoom.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Odadan ayrılma
      .addCase(leaveRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(leaveRoom.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(leaveRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { 
  reset,
  setActiveRoom,
  resetActiveRoom,
  setActiveRoomUsers,
  addActiveRoomUser,
  removeActiveRoomUser,
  setLocalStream,
  setScreenStream,
  setMediaState,
  addPeer,
  removePeer,
  setUserMediaState,
  resetRoomState
} = roomSlice.actions;
export default roomSlice.reducer;
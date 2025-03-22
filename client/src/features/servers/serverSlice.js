import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import serverService from './serverService';

const initialState = {
  servers: [],
  activeServer: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Kullanıcının sunucularını getirme
export const getUserServers = createAsyncThunk(
  'servers/getUserServers',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.getUserServers(token);
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

// Sunucu detaylarını getirme
export const getServerDetails = createAsyncThunk(
  'servers/getServerDetails',
  async (serverId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.getServerDetails(serverId, token);
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

// Yeni sunucu oluşturma
export const createServer = createAsyncThunk(
  'servers/createServer',
  async (serverData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.createServer(serverData, token);
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

// Sunucuya katılma
export const joinServer = createAsyncThunk(
  'servers/joinServer',
  async (inviteCode, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.joinServer(inviteCode, token);
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

// Sunucudan ayrılma
export const leaveServer = createAsyncThunk(
  'servers/leaveServer',
  async (serverId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.leaveServer(serverId, token);
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

// Sunucu güncelleme
export const updateServer = createAsyncThunk(
  'servers/updateServer',
  async ({ serverId, serverData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.updateServer(serverId, serverData, token);
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

// Sunucu silme
export const deleteServer = createAsyncThunk(
  'servers/deleteServer',
  async (serverId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.deleteServer(serverId, token);
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

// Davet kodunu yenileme
export const refreshInviteCode = createAsyncThunk(
  'servers/refreshInviteCode',
  async (serverId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serverService.refreshInviteCode(serverId, token);
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

export const serverSlice = createSlice({
  name: 'servers',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setActiveServer: (state, action) => {
      state.activeServer = action.payload;
    },
    resetActiveServer: (state) => {
      state.activeServer = null;
    },
    updateServerMemberStatus: (state, action) => {
      const { userId, status } = action.payload;
      
      if (state.activeServer) {
        const memberIndex = state.activeServer.members.findIndex(
          (member) => member.user._id === userId
        );
        
        if (memberIndex !== -1) {
          state.activeServer.members[memberIndex].user.status = status;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Kullanıcının sunucularını getirme
      .addCase(getUserServers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserServers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.servers = action.payload;
      })
      .addCase(getUserServers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Sunucu detaylarını getirme
      .addCase(getServerDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServerDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeServer = action.payload;
      })
      .addCase(getServerDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Yeni sunucu oluşturma
      .addCase(createServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.servers.push(action.payload.server);
      })
      .addCase(createServer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Sunucuya katılma
      .addCase(joinServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(joinServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.servers.push(action.payload.server);
      })
      .addCase(joinServer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Sunucudan ayrılma
      .addCase(leaveServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(leaveServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.servers = state.servers.filter(
          (server) => server._id !== action.meta.arg
        );
        if (state.activeServer && state.activeServer._id === action.meta.arg) {
          state.activeServer = null;
        }
      })
      .addCase(leaveServer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Sunucu güncelleme
      .addCase(updateServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Sunucu listesini güncelle
        const index = state.servers.findIndex(
          (server) => server._id === action.payload._id
        );
        
        if (index !== -1) {
          state.servers[index] = action.payload;
        }
        
        // Aktif sunucu ise onu da güncelle
        if (state.activeServer && state.activeServer._id === action.payload._id) {
          state.activeServer = {
            ...state.activeServer,
            ...action.payload
          };
        }
      })
      .addCase(updateServer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Sunucu silme
      .addCase(deleteServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.servers = state.servers.filter(
          (server) => server._id !== action.meta.arg
        );
        if (state.activeServer && state.activeServer._id === action.meta.arg) {
          state.activeServer = null;
        }
      })
      .addCase(deleteServer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Davet kodunu yenileme
      .addCase(refreshInviteCode.fulfilled, (state, action) => {
        if (state.activeServer) {
          state.activeServer.inviteCode = action.payload.inviteCode;
        }
      });
  },
});

export const { 
  reset, 
  setActiveServer, 
  resetActiveServer,
  updateServerMemberStatus
} = serverSlice.actions;
export default serverSlice.reducer;
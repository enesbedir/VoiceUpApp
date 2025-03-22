import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import friendService from './friendService';

const initialState = {
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  onlineFriends: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Arkadaşları getir
export const getFriends = createAsyncThunk(
  'friends/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.getFriends(token);
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

// Bekleyen arkadaşlık isteklerini getir
export const getPendingRequests = createAsyncThunk(
  'friends/getPending',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.getPendingRequests(token);
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

// Gönderilen arkadaşlık isteklerini getir
export const getSentRequests = createAsyncThunk(
  'friends/getSent',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.getSentRequests(token);
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

// Arkadaşlık isteği gönder
export const sendFriendRequest = createAsyncThunk(
  'friends/sendRequest',
  async (friendId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.sendFriendRequest(friendId, token);
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

// Arkadaşlık isteğini kabul et
export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptRequest',
  async (requestId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.acceptFriendRequest(requestId, token);
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

// Arkadaşlık isteğini reddet
export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectRequest',
  async (requestId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.rejectFriendRequest(requestId, token);
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

// Arkadaşlık isteğini iptal et
export const cancelFriendRequest = createAsyncThunk(
  'friends/cancelRequest',
  async (requestId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.cancelFriendRequest(requestId, token);
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

// Arkadaşı sil
export const removeFriend = createAsyncThunk(
  'friends/remove',
  async (friendId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.removeFriend(friendId, token);
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

// Arkadaş durumunu güncelle (çevrimiçi/çevrimdışı)
export const updateFriendStatus = createAsyncThunk(
  'friends/updateStatus',
  async ({ friendId, status }, thunkAPI) => {
    try {
      return { friendId, status };
    } catch (error) {
      const message = error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Arkadaş ara
export const searchUsers = createAsyncThunk(
  'friends/searchUsers',
  async (searchTerm, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await friendService.searchUsers(searchTerm, token);
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

export const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    resetFriends: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setOnlineFriends: (state, action) => {
      state.onlineFriends = action.payload;
    },
    updateFriendPresence: (state, action) => {
      const { userId, status } = action.payload;
      // Arkadaş listesinde durumu güncelle
      const friendIndex = state.friends.findIndex(friend => friend.id === userId);
      if (friendIndex !== -1) {
        state.friends[friendIndex].status = status;
      }
      
      // Çevrimiçi arkadaşlar listesini güncelle
      if (status === 'online') {
        if (!state.onlineFriends.includes(userId)) {
          state.onlineFriends.push(userId);
        }
      } else {
        state.onlineFriends = state.onlineFriends.filter(id => id !== userId);
      }
    },
    addIncomingFriendRequest: (state, action) => {
      state.pendingRequests.push(action.payload);
    },
    removePendingRequest: (state, action) => {
      state.pendingRequests = state.pendingRequests.filter(
        request => request.id !== action.payload
      );
    },
    removeSentRequest: (state, action) => {
      state.sentRequests = state.sentRequests.filter(
        request => request.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFriends.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friends = action.payload;
      })
      .addCase(getFriends.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPendingRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pendingRequests = action.payload;
      })
      .addCase(getPendingRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSentRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.sentRequests = action.payload;
      })
      .addCase(getSentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.sentRequests.push(action.payload);
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(acceptFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friends.push(action.payload.friend);
        state.pendingRequests = state.pendingRequests.filter(
          request => request.id !== action.payload.requestId
        );
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(rejectFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pendingRequests = state.pendingRequests.filter(
          request => request.id !== action.payload
        );
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(cancelFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.sentRequests = state.sentRequests.filter(
          request => request.id !== action.payload
        );
      })
      .addCase(cancelFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(removeFriend.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friends = state.friends.filter(
          friend => friend.id !== action.payload
        );
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateFriendStatus.fulfilled, (state, action) => {
        const { friendId, status } = action.payload;
        const friendIndex = state.friends.findIndex(friend => friend.id === friendId);
        if (friendIndex !== -1) {
          state.friends[friendIndex].status = status;
        }
      })
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Arama sonuçları bir alt bileşende kullanılacak, burada saklanmıyor
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { 
  resetFriends, 
  setOnlineFriends, 
  updateFriendPresence,
  addIncomingFriendRequest,
  removePendingRequest,
  removeSentRequest
} = friendSlice.actions;
export default friendSlice.reducer;
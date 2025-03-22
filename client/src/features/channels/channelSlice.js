import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import channelService from './channelService';

const initialState = {
  channels: [],
  currentChannel: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Sunucuya ait kanalları getir
export const getChannels = createAsyncThunk(
  'channels/getAll',
  async (serverId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.getChannels(serverId, token);
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

// Kanal oluştur
export const createChannel = createAsyncThunk(
  'channels/create',
  async (channelData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.createChannel(channelData, token);
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

// Kanal güncelle
export const updateChannel = createAsyncThunk(
  'channels/update',
  async ({ channelId, channelData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.updateChannel(channelId, channelData, token);
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

// Kanal sil
export const deleteChannel = createAsyncThunk(
  'channels/delete',
  async (channelId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.deleteChannel(channelId, token);
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

// Kanal kategorisi oluştur
export const createCategory = createAsyncThunk(
  'channels/createCategory',
  async ({ serverId, name }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.createCategory(serverId, name, token);
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

// Kanal kategorisini güncelle
export const updateCategory = createAsyncThunk(
  'channels/updateCategory',
  async ({ categoryId, name }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.updateCategory(categoryId, name, token);
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

// Kanal kategorisini sil
export const deleteCategory = createAsyncThunk(
  'channels/deleteCategory',
  async (categoryId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.deleteCategory(categoryId, token);
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

// Kanal sırasını güncelle
export const updateChannelOrder = createAsyncThunk(
  'channels/updateOrder',
  async ({ serverId, orderedChannels }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.updateChannelOrder(serverId, orderedChannels, token);
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

// Kanalı oku
export const markChannelAsRead = createAsyncThunk(
  'channels/markAsRead',
  async (channelId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await channelService.markChannelAsRead(channelId, token);
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

export const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    resetChannels: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload;
    },
    clearCurrentChannel: (state) => {
      state.currentChannel = null;
    },
    updateUnreadStatus: (state, action) => {
      const { channelId, hasUnread } = action.payload;
      const channelIndex = state.channels.findIndex(
        (channel) => channel.id === channelId
      );
      if (channelIndex !== -1) {
        state.channels[channelIndex].hasUnread = hasUnread;
      }
    },
    addNewChannelLocally: (state, action) => {
      state.channels.push(action.payload);
    },
    updateChannelLocally: (state, action) => {
      const updatedChannel = action.payload;
      const channelIndex = state.channels.findIndex(
        (channel) => channel.id === updatedChannel.id
      );
      if (channelIndex !== -1) {
        state.channels[channelIndex] = {
          ...state.channels[channelIndex],
          ...updatedChannel,
        };
      }
    },
    deleteChannelLocally: (state, action) => {
      const channelId = action.payload;
      state.channels = state.channels.filter((channel) => channel.id !== channelId);
      
      // Eğer aktif kanal silindiyse, aktif kanalı sıfırla
      if (state.currentChannel && state.currentChannel.id === channelId) {
        state.currentChannel = null;
      }
    },
    addNewCategoryLocally: (state, action) => {
      const newCategory = action.payload;
      
      // Kategorileri içeren kanalları güncelle
      state.channels = state.channels.map(channel => {
        if (channel.type === 'category') {
          return [...channel, newCategory];
        }
        return channel;
      });
    },
    updateCategoryLocally: (state, action) => {
      const updatedCategory = action.payload;
      
      // Kategorileri içeren kanalları güncelle
      state.channels = state.channels.map(channel => {
        if (channel.type === 'category' && channel.id === updatedCategory.id) {
          return {
            ...channel,
            ...updatedCategory,
          };
        }
        return channel;
      });
    },
    deleteCategoryLocally: (state, action) => {
      const categoryId = action.payload;
      
      // Kategorileri içeren kanalları güncelle
      state.channels = state.channels.filter(channel => {
        if (channel.type === 'category') {
          return channel.id !== categoryId;
        }
        // Silinen kategoriye ait kanalları 'Kategorisiz' olarak işaretle veya kaldır
        if (channel.categoryId === categoryId) {
          return {
            ...channel,
            categoryId: null,
          };
        }
        return true;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChannels.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChannels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.channels = action.payload;
      })
      .addCase(getChannels.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createChannel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.channels.push(action.payload);
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateChannel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateChannel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.channels.findIndex(
          (channel) => channel.id === action.payload.id
        );
        if (index !== -1) {
          state.channels[index] = action.payload;
        }
      })
      .addCase(updateChannel.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteChannel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteChannel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.channels = state.channels.filter(
          (channel) => channel.id !== action.payload.id
        );
        if (state.currentChannel && state.currentChannel.id === action.payload.id) {
          state.currentChannel = null;
        }
      })
      .addCase(deleteChannel.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.channels.push({
          ...action.payload,
          type: 'category',
        });
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.channels.findIndex(
          (channel) => channel.id === action.payload.id && channel.type === 'category'
        );
        if (index !== -1) {
          state.channels[index] = {
            ...state.channels[index],
            ...action.payload,
          };
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Kategoriyi kaldır
        state.channels = state.channels.filter(
          (channel) => !(channel.id === action.payload.id && channel.type === 'category')
        );
        
        // Bu kategorideki kanalları güncelle
        state.channels = state.channels.map((channel) => {
          if (channel.categoryId === action.payload.id) {
            return {
              ...channel,
              categoryId: null,
            };
          }
          return channel;
        });
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateChannelOrder.fulfilled, (state, action) => {
        state.isSuccess = true;
        // Sunucudan dönen sıralanmış kanallar listesini kullan
        state.channels = action.payload;
      })
      .addCase(markChannelAsRead.fulfilled, (state, action) => {
        const channelId = action.payload.channelId;
        const index = state.channels.findIndex(
          (channel) => channel.id === channelId
        );
        if (index !== -1) {
          state.channels[index].hasUnread = false;
        }
      });
  },
});

export const {
  resetChannels,
  setCurrentChannel,
  clearCurrentChannel,
  updateUnreadStatus,
  addNewChannelLocally,
  updateChannelLocally,
  deleteChannelLocally,
  addNewCategoryLocally,
  updateCategoryLocally,
  deleteCategoryLocally,
} = channelSlice.actions;
export default channelSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from './messageService';

const initialState = {
  directMessages: {}, // Kullanıcılar arası özel mesajları saklayacak object: { userId: [messages] }
  channelMessages: {}, // Kanal mesajlarını saklayacak object: { channelId: [messages] }
  activeConversations: [], // Aktif konuşmaları saklayacak array
  unreadCounts: {}, // userId/channelId bazında okunmamış mesaj sayıları
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Direkt mesajları getir
export const getDirectMessages = createAsyncThunk(
  'messages/getDirectMessages',
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await messageService.getDirectMessages(userId, token);
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

// Kanal mesajlarını getir
export const getChannelMessages = createAsyncThunk(
  'messages/getChannelMessages',
  async (channelId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await messageService.getChannelMessages(channelId, token);
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

// Özel mesaj gönder
export const sendDirectMessage = createAsyncThunk(
  'messages/sendDirectMessage',
  async ({ recipientId, content, attachments = [] }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const user = thunkAPI.getState().auth.user;
      const message = await messageService.sendDirectMessage(
        recipientId,
        content,
        attachments,
        token
      );
      // Socket aracılığıyla mesajı gönder
      const socketManager = require('../../features/socket/socketService').default;
      socketManager.emitEvent('direct_message', {
        message,
        recipientId,
        senderId: user.id,
      });
      return { message, recipientId };
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

// Kanal mesajı gönder
export const sendChannelMessage = createAsyncThunk(
  'messages/sendChannelMessage',
  async ({ channelId, content, attachments = [] }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const user = thunkAPI.getState().auth.user;
      const message = await messageService.sendChannelMessage(
        channelId,
        content,
        attachments,
        token
      );
      // Socket aracılığıyla mesajı gönder
      const socketManager = require('../../features/socket/socketService').default;
      socketManager.emitEvent('channel_message', {
        message,
        channelId,
        senderId: user.id,
      });
      return { message, channelId };
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

// Mesajı sil
export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async ({ messageId, isDirectMessage, targetId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await messageService.deleteMessage(messageId, token);
      // Socket aracılığıyla mesaj silme bilgisini gönder
      const socketManager = require('../../features/socket/socketService').default;
      socketManager.emitEvent('delete_message', {
        messageId,
        isDirectMessage,
        targetId,
      });
      return { messageId, isDirectMessage, targetId };
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

// Mesajı düzenle
export const editMessage = createAsyncThunk(
  'messages/editMessage',
  async ({ messageId, content, isDirectMessage, targetId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const editedMessage = await messageService.editMessage(
        messageId,
        content,
        token
      );
      // Socket aracılığıyla mesaj düzenleme bilgisini gönder
      const socketManager = require('../../features/socket/socketService').default;
      socketManager.emitEvent('edit_message', {
        message: editedMessage,
        isDirectMessage,
        targetId,
      });
      return { message: editedMessage, isDirectMessage, targetId };
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

// Mesajları okundu olarak işaretle
export const markMessagesAsRead = createAsyncThunk(
  'messages/markAsRead',
  async ({ isDirectMessage, targetId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await messageService.markMessagesAsRead(
        isDirectMessage,
        targetId,
        token
      );
      return { isDirectMessage, targetId };
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

// Mesaj geçmişini getir (sonsuz kaydırma için)
export const loadMoreMessages = createAsyncThunk(
  'messages/loadMore',
  async ({ isDirectMessage, targetId, lastMessageId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      let messages;
      if (isDirectMessage) {
        messages = await messageService.getMoreDirectMessages(
          targetId,
          lastMessageId,
          token
        );
        return { messages, isDirectMessage, targetId };
      } else {
        messages = await messageService.getMoreChannelMessages(
          targetId,
          lastMessageId,
          token
        );
        return { messages, isDirectMessage, targetId };
      }
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

export const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    resetMessages: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearAllMessages: (state) => {
      state.directMessages = {};
      state.channelMessages = {};
      state.activeConversations = [];
      state.unreadCounts = {};
    },
    addDirectMessage: (state, action) => {
      const { message, senderId, recipientId } = action.payload;
      // Mesajı ilgili konuşmaya ekle (gönderen veya alıcı perspektifinden)
      const currentUserId = action.payload.currentUserId; // Mevcut kullanıcı ID'si
      const conversationId = senderId === currentUserId ? recipientId : senderId;
      
      if (!state.directMessages[conversationId]) {
        state.directMessages[conversationId] = [];
      }
      state.directMessages[conversationId].push(message);
      
      // Aktif konuşmalar listesini güncelle
      if (!state.activeConversations.includes(`direct-${conversationId}`)) {
        state.activeConversations.push(`direct-${conversationId}`);
      }
      
      // Okunmamış mesaj sayacını güncelle (mesajın alıcısı için)
      if (recipientId === currentUserId && !message.read) {
        if (!state.unreadCounts[`direct-${senderId}`]) {
          state.unreadCounts[`direct-${senderId}`] = 0;
        }
        state.unreadCounts[`direct-${senderId}`]++;
      }
    },
    addChannelMessage: (state, action) => {
      const { message, channelId } = action.payload;
      
      if (!state.channelMessages[channelId]) {
        state.channelMessages[channelId] = [];
      }
      state.channelMessages[channelId].push(message);
      
      // Aktif konuşmalar listesini güncelle
      if (!state.activeConversations.includes(`channel-${channelId}`)) {
        state.activeConversations.push(`channel-${channelId}`);
      }
      
      // Okunmamış mesaj sayacını güncelle (mevcut kullanıcı message.authorId değilse)
      const currentUserId = action.payload.currentUserId;
      if (message.authorId !== currentUserId && !message.read) {
        if (!state.unreadCounts[`channel-${channelId}`]) {
          state.unreadCounts[`channel-${channelId}`] = 0;
        }
        state.unreadCounts[`channel-${channelId}`]++;
      }
    },
    updateMessageEdit: (state, action) => {
      const { message, isDirectMessage, targetId } = action.payload;
      
      if (isDirectMessage) {
        const messageIndex = state.directMessages[targetId]?.findIndex(
          (m) => m.id === message.id
        );
        if (messageIndex !== -1 && state.directMessages[targetId]) {
          state.directMessages[targetId][messageIndex] = {
            ...state.directMessages[targetId][messageIndex],
            content: message.content,
            edited: true,
            updatedAt: message.updatedAt,
          };
        }
      } else {
        const messageIndex = state.channelMessages[targetId]?.findIndex(
          (m) => m.id === message.id
        );
        if (messageIndex !== -1 && state.channelMessages[targetId]) {
          state.channelMessages[targetId][messageIndex] = {
            ...state.channelMessages[targetId][messageIndex],
            content: message.content,
            edited: true,
            updatedAt: message.updatedAt,
          };
        }
      }
    },
    removeMessage: (state, action) => {
      const { messageId, isDirectMessage, targetId } = action.payload;
      
      if (isDirectMessage && state.directMessages[targetId]) {
        state.directMessages[targetId] = state.directMessages[targetId].filter(
          (message) => message.id !== messageId
        );
      } else if (!isDirectMessage && state.channelMessages[targetId]) {
        state.channelMessages[targetId] = state.channelMessages[targetId].filter(
          (message) => message.id !== messageId
        );
      }
    },
    resetUnreadCount: (state, action) => {
      const { isDirectMessage, targetId } = action.payload;
      const key = isDirectMessage ? `direct-${targetId}` : `channel-${targetId}`;
      state.unreadCounts[key] = 0;
    },
    markAllAsRead: (state, action) => {
      const { isDirectMessage, targetId } = action.payload;
      
      if (isDirectMessage && state.directMessages[targetId]) {
        state.directMessages[targetId] = state.directMessages[targetId].map(
          (message) => ({ ...message, read: true })
        );
        state.unreadCounts[`direct-${targetId}`] = 0;
      } else if (!isDirectMessage && state.channelMessages[targetId]) {
        state.channelMessages[targetId] = state.channelMessages[targetId].map(
          (message) => ({ ...message, read: true })
        );
        state.unreadCounts[`channel-${targetId}`] = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDirectMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDirectMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Mesajları ilgili kullanıcı ID'si altında sakla
        state.directMessages[action.meta.arg] = action.payload;
        
        // Aktif konuşmalar listesini güncelle
        if (!state.activeConversations.includes(`direct-${action.meta.arg}`)) {
          state.activeConversations.push(`direct-${action.meta.arg}`);
        }
      })
      .addCase(getDirectMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getChannelMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChannelMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Mesajları ilgili kanal ID'si altında sakla
        state.channelMessages[action.meta.arg] = action.payload;
        
        // Aktif konuşmalar listesini güncelle
        if (!state.activeConversations.includes(`channel-${action.meta.arg}`)) {
          state.activeConversations.push(`channel-${action.meta.arg}`);
        }
      })
      .addCase(getChannelMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendDirectMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendDirectMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { message, recipientId } = action.payload;
        
        // Mesajı ilgili konuşmaya ekle
        if (!state.directMessages[recipientId]) {
          state.directMessages[recipientId] = [];
        }
        state.directMessages[recipientId].push(message);
        
        // Aktif konuşmalar listesini güncelle
        if (!state.activeConversations.includes(`direct-${recipientId}`)) {
          state.activeConversations.push(`direct-${recipientId}`);
        }
      })
      .addCase(sendDirectMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendChannelMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendChannelMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { message, channelId } = action.payload;
        
        // Mesajı ilgili kanala ekle
        if (!state.channelMessages[channelId]) {
          state.channelMessages[channelId] = [];
        }
        state.channelMessages[channelId].push(message);
      })
      .addCase(sendChannelMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { messageId, isDirectMessage, targetId } = action.payload;
        
        // Mesajı ilgili konuşmadan veya kanaldan kaldır
        if (isDirectMessage && state.directMessages[targetId]) {
          state.directMessages[targetId] = state.directMessages[targetId].filter(
            (message) => message.id !== messageId
          );
        } else if (!isDirectMessage && state.channelMessages[targetId]) {
          state.channelMessages[targetId] = state.channelMessages[targetId].filter(
            (message) => message.id !== messageId
          );
        }
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(editMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { message, isDirectMessage, targetId } = action.payload;
        
        // Mesajı ilgili konuşmada veya kanalda güncelle
        if (isDirectMessage && state.directMessages[targetId]) {
          const messageIndex = state.directMessages[targetId].findIndex(
            (m) => m.id === message.id
          );
          if (messageIndex !== -1) {
            state.directMessages[targetId][messageIndex] = {
              ...state.directMessages[targetId][messageIndex],
              content: message.content,
              edited: true,
              updatedAt: message.updatedAt,
            };
          }
        } else if (!isDirectMessage && state.channelMessages[targetId]) {
          const messageIndex = state.channelMessages[targetId].findIndex(
            (m) => m.id === message.id
          );
          if (messageIndex !== -1) {
            state.channelMessages[targetId][messageIndex] = {
              ...state.channelMessages[targetId][messageIndex],
              content: message.content,
              edited: true,
              updatedAt: message.updatedAt,
            };
          }
        }
      })
      .addCase(editMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { isDirectMessage, targetId } = action.payload;
        
        // Tüm mesajları okundu olarak işaretle
        if (isDirectMessage && state.directMessages[targetId]) {
          state.directMessages[targetId] = state.directMessages[targetId].map(
            (message) => ({ ...message, read: true })
          );
          state.unreadCounts[`direct-${targetId}`] = 0;
        } else if (!isDirectMessage && state.channelMessages[targetId]) {
          state.channelMessages[targetId] = state.channelMessages[targetId].map(
            (message) => ({ ...message, read: true })
          );
          state.unreadCounts[`channel-${targetId}`] = 0;
        }
      })
      .addCase(loadMoreMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMoreMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { messages, isDirectMessage, targetId } = action.payload;
        
        // Daha eski mesajları ön tarafa ekle
        if (isDirectMessage && state.directMessages[targetId]) {
          state.directMessages[targetId] = [...messages, ...state.directMessages[targetId]];
        } else if (!isDirectMessage && state.channelMessages[targetId]) {
          state.channelMessages[targetId] = [...messages, ...state.channelMessages[targetId]];
        }
      })
      .addCase(loadMoreMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  resetMessages,
  clearAllMessages,
  addDirectMessage,
  addChannelMessage,
  updateMessageEdit,
  removeMessage,
  resetUnreadCount,
  markAllAsRead,
} = messageSlice.actions;
export default messageSlice.reducer;
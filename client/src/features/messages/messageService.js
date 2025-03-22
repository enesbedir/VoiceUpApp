import axios from 'axios';

const API_URL = '/api/messages/';

// Direkt mesajları getir
const getDirectMessages = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + `direct/${userId}`, config);

  return response.data;
};

// Kanal mesajlarını getir
const getChannelMessages = async (channelId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + `channel/${channelId}`, config);

  return response.data;
};

// Özel mesaj gönder
const sendDirectMessage = async (recipientId, content, attachments, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const messageData = {
    recipientId,
    content,
    attachments,
  };

  const response = await axios.post(API_URL + 'direct', messageData, config);

  return response.data;
};

// Kanal mesajı gönder
const sendChannelMessage = async (channelId, content, attachments, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const messageData = {
    channelId,
    content,
    attachments,
  };

  const response = await axios.post(API_URL + 'channel', messageData, config);

  return response.data;
};

// Mesaj sil
const deleteMessage = async (messageId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + messageId, config);

  return response.data;
};

// Mesaj düzenle
const editMessage = async (messageId, content, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const messageData = {
    content,
  };

  const response = await axios.put(API_URL + messageId, messageData, config);

  return response.data;
};

// Mesajları okundu olarak işaretle
const markMessagesAsRead = async (isDirectMessage, targetId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const data = {
    isDirectMessage,
    targetId,
  };

  const response = await axios.put(API_URL + 'read', data, config);

  return response.data;
};

// Daha fazla direkt mesaj yükle (sonsuz kaydırma için)
const getMoreDirectMessages = async (userId, lastMessageId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(
    API_URL + `direct/${userId}?before=${lastMessageId}`,
    config
  );

  return response.data;
};

// Daha fazla kanal mesajı yükle (sonsuz kaydırma için)
const getMoreChannelMessages = async (channelId, lastMessageId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(
    API_URL + `channel/${channelId}?before=${lastMessageId}`,
    config
  );

  return response.data;
};

// Dosya yükle
const uploadAttachment = async (file, token) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };

  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/upload', formData, config);

  return response.data;
};

// Reaksiyon ekle
const addReaction = async (messageId, reactionType, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const data = {
    reactionType,
  };

  const response = await axios.post(
    API_URL + `${messageId}/reactions`,
    data,
    config
  );

  return response.data;
};

// Reaksiyon kaldır
const removeReaction = async (messageId, reactionId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(
    API_URL + `${messageId}/reactions/${reactionId}`,
    config
  );

  return response.data;
};

const messageService = {
  getDirectMessages,
  getChannelMessages,
  sendDirectMessage,
  sendChannelMessage,
  deleteMessage,
  editMessage,
  markMessagesAsRead,
  getMoreDirectMessages,
  getMoreChannelMessages,
  uploadAttachment,
  addReaction,
  removeReaction,
};

export default messageService;
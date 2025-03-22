import axios from 'axios';

const API_URL = '/api/channels/';

// Sunucuya ait kanalları getir
const getChannels = async (serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`/api/servers/${serverId}/channels`, config);

  return response.data;
};

// Kanal oluştur
const createChannel = async (channelData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, channelData, config);

  return response.data;
};

// Kanal güncelle
const updateChannel = async (channelId, channelData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + channelId, channelData, config);

  return response.data;
};

// Kanal sil
const deleteChannel = async (channelId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + channelId, config);

  return response.data;
};

// Kanal kategorisi oluştur
const createCategory = async (serverId, name, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    `/api/servers/${serverId}/categories`,
    { name },
    config
  );

  return response.data;
};

// Kanal kategorisini güncelle
const updateCategory = async (categoryId, name, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    `/api/categories/${categoryId}`,
    { name },
    config
  );

  return response.data;
};

// Kanal kategorisini sil
const deleteCategory = async (categoryId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`/api/categories/${categoryId}`, config);

  return response.data;
};

// Kanal sıralamasını güncelle
const updateChannelOrder = async (serverId, orderedChannels, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    `/api/servers/${serverId}/channels/order`,
    { channels: orderedChannels },
    config
  );

  return response.data;
};

// Kanalı okundu olarak işaretle
const markChannelAsRead = async (channelId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    API_URL + `${channelId}/read`,
    {},
    config
  );

  return response.data;
};

// Kanalın izinlerini güncelle
const updateChannelPermissions = async (channelId, permissionsData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    API_URL + `${channelId}/permissions`,
    permissionsData,
    config
  );

  return response.data;
};

const channelService = {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  createCategory,
  updateCategory,
  deleteCategory,
  updateChannelOrder,
  markChannelAsRead,
  updateChannelPermissions,
};

export default channelService;
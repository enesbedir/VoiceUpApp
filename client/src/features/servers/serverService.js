import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/servers/';

// Kullanıcının sunucularını getirme
const getUserServers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Sunucu detaylarını getirme
const getServerDetails = async (serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.get(API_URL + serverId, config);
  return response.data;
};

// Yeni sunucu oluşturma
const createServer = async (serverData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.post(API_URL, serverData, config);
  return response.data;
};

// Sunucuya katılma
const joinServer = async (inviteCode, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.post(
    API_URL + 'join/' + inviteCode,
    {},
    config
  );
  
  return response.data;
};

// Sunucudan ayrılma
const leaveServer = async (serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.delete(
    API_URL + serverId + '/leave',
    config
  );
  
  return response.data;
};

// Sunucu güncelleme
const updateServer = async (serverId, serverData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.put(
    API_URL + serverId,
    serverData,
    config
  );
  
  return response.data;
};

// Sunucu silme
const deleteServer = async (serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.delete(
    API_URL + serverId,
    config
  );
  
  return response.data;
};

// Davet kodunu yenileme
const refreshInviteCode = async (serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.post(
    API_URL + serverId + '/refresh-invite',
    {},
    config
  );
  
  return response.data;
};

const serverService = {
  getUserServers,
  getServerDetails,
  createServer,
  joinServer,
  leaveServer,
  updateServer,
  deleteServer,
  refreshInviteCode
};

export default serverService;
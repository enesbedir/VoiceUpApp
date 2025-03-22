import axios from 'axios';

const API_URL = '/api/friends/';

// Arkadaşları getir
const getFriends = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);

  return response.data;
};

// Bekleyen arkadaşlık isteklerini getir
const getPendingRequests = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'pending', config);

  return response.data;
};

// Gönderilen arkadaşlık isteklerini getir
const getSentRequests = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'sent', config);

  return response.data;
};

// Arkadaşlık isteği gönder
const sendFriendRequest = async (friendId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + 'request', { friendId }, config);

  return response.data;
};

// Arkadaşlık isteğini kabul et
const acceptFriendRequest = async (requestId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + `accept/${requestId}`, {}, config);

  return response.data;
};

// Arkadaşlık isteğini reddet
const rejectFriendRequest = async (requestId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + `reject/${requestId}`, {}, config);

  return response.data;
};

// Arkadaşlık isteğini iptal et
const cancelFriendRequest = async (requestId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + `cancel/${requestId}`, config);

  return response.data;
};

// Arkadaşı sil
const removeFriend = async (friendId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + friendId, config);

  return response.data;
};

// Kullanıcı ara
const searchUsers = async (searchTerm, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`/api/users/search?term=${searchTerm}`, config);

  return response.data;
};

const friendService = {
  getFriends,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  searchUsers,
};

export default friendService;
import axios from 'axios';

const API_URL = '/api/rooms/';

// Sunucudaki tüm odaları getirme
const getServerRooms = async (serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`/api/servers/${serverId}/rooms`, config);

  return response.data;
};

// Oda detayını getirme
const getRoomDetails = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + roomId, config);

  return response.data;
};

// Yeni oda oluşturma
const createRoom = async (roomData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, roomData, config);

  return response.data;
};

// Oda güncelleme
const updateRoom = async (roomId, roomData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + roomId, roomData, config);

  return response.data;
};

// Oda silme
const deleteRoom = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + roomId, config);

  return response.data;
};

// Odaya katılma
const joinRoom = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + roomId + '/join', {}, config);

  return response.data;
};

// Odadan ayrılma
const leaveRoom = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + roomId + '/leave', {}, config);

  return response.data;
};

const roomService = {
  getServerRooms,
  getRoomDetails,
  createRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
};

export default roomService;
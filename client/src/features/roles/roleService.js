import axios from 'axios';

const API_URL = '/api/roles/';

// Sunucu rollerini getir
const getServerRoles = async (serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`/api/servers/${serverId}/roles`, config);

  return response.data;
};

// Rol oluştur
const createRole = async (roleData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, roleData, config);

  return response.data;
};

// Rol güncelle
const updateRole = async (roleId, roleData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + roleId, roleData, config);

  return response.data;
};

// Rol sil
const deleteRole = async (roleId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + roleId, config);

  return response.data;
};

// Kullanıcıya rol ata
const assignRoleToUser = async (roleId, userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    API_URL + `${roleId}/members`,
    { userId },
    config
  );

  return response.data;
};

// Kullanıcıdan rol kaldır
const removeRoleFromUser = async (roleId, userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(
    API_URL + `${roleId}/members/${userId}`,
    config
  );

  return response.data;
};

// Rol izinlerini güncelle
const updateRolePermissions = async (roleId, permissions, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    API_URL + `${roleId}/permissions`,
    { permissions },
    config
  );

  return response.data;
};

// Rol sıralamasını güncelle
const updateRoleOrder = async (serverId, roleOrder, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    `/api/servers/${serverId}/roles/order`,
    { roles: roleOrder },
    config
  );

  return response.data;
};

// Kullanıcının rollerini getir
const getUserRoles = async (userId, serverId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(
    `/api/users/${userId}/roles?serverId=${serverId}`,
    config
  );

  return response.data;
};

// Rol detaylarını getir
const getRoleDetails = async (roleId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + roleId, config);

  return response.data;
};

const roleService = {
  getServerRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  updateRolePermissions,
  updateRoleOrder,
  getUserRoles,
  getRoleDetails,
};

export default roleService;
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/users/';

// Kullanıcı kaydı
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Kullanıcı girişi
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Kimlik kontrolü
const checkAuth = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.token) {
    return null;
  }
  
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    };
    
    const response = await axios.get(API_URL + 'profile', config);
    
    // Token geçerli, kullanıcı bilgilerini güncelle
    const updatedUser = { ...user, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    // Token geçersiz, kullanıcıyı çıkış yap
    localStorage.removeItem('user');
    return null;
  }
};

// Kullanıcı çıkışı
const logout = () => {
  localStorage.removeItem('user');
  return null;
};

// Kullanıcı profilini güncelleme
const updateProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
  const response = await axios.put(API_URL + 'profile', userData, config);
  
  // Yerel depolamadaki kullanıcı bilgilerini güncelle
  if (response.data) {
    const user = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...user, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  checkAuth,
  updateProfile
};

export default authService;
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAuth } from './features/auth/authSlice';
import socketManager from './features/socket/socketService';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Header from './components/layout/Header';
import PrivateRoute from './components/PrivateRoute';
import SettingsPage from './components/settings/SettingsPage';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);
  
  // Kullanıcı oturumunu kontrol et
  useEffect(() => {
    if (user) {
      dispatch(checkAuth());
    }
  }, [user, dispatch]);
  
  // Socket bağlantısını kur
  useEffect(() => {
    if (user) {
      socketManager.setStore(require('./app/store').store);
      socketManager.connect(user.token);
      
      return () => {
        socketManager.disconnect();
      };
    }
  }, [user]);
  
  // Tema ve dil ayarlarını uygula
  useEffect(() => {
    if (settings) {
      // Tema ayarını uygula
      document.documentElement.setAttribute('data-theme', settings.theme);
      
      // Dil ayarını uygula
      document.documentElement.setAttribute('lang', settings.language);
    }
  }, [settings]);
  
  return (
    <>
      <Router>
        <div className="container">
          <Header />
          <Routes>
            <Route path="/" element={<PrivateRoute component={Dashboard} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/settings" element={<PrivateRoute component={SettingsPage} />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
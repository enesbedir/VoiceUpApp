import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { checkAuth } from './features/auth/authSlice';

// Sayfa Bileşenleri
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ServerView from './pages/ServerView';
import NotFound from './pages/NotFound';

// Ortak Bileşenler
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layouts/AppLayout';

const App = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <img 
          src="/logo192.png" 
          alt="VoiceUp Logo" 
          style={{ 
            width: 120, 
            height: 120, 
            animation: 'pulse 1.5s infinite ease-in-out'
          }} 
        />
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.6; transform: scale(0.98); }
              50% { opacity: 1; transform: scale(1); }
              100% { opacity: 0.6; transform: scale(0.98); }
            }
          `}
        </style>
      </Box>
    );
  }

  return (
    <Routes>
      {/* Kimlik Doğrulama Rotaları */}
      <Route
        path="/login"
        element={user ? <Navigate to="/app" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/app" replace /> : <Register />}
      />

      {/* Uygulama Rotaları */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="servers/:serverId" element={<ServerView />} />
        <Route path="servers/:serverId/rooms/:roomId" element={<ServerView />} />
      </Route>

      {/* Ana Sayfa Yönlendirmesi */}
      <Route path="/" element={<Navigate to={user ? "/app" : "/login"} replace />} />

      {/* 404 Sayfası */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
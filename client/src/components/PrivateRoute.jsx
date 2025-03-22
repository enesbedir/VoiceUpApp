import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Özel rota bileşeni - Kullanıcı oturumu yoksa giriş sayfasına yönlendirir
const PrivateRoute = ({ component: Component }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return <Component />;
};

export default PrivateRoute;
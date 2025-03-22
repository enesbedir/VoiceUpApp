import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className={`header ${settings?.theme || 'dark'}`}>
      <div className="logo">
        <Link to="/">VoiceUp</Link>
      </div>
      <ul>
        {user ? (
          <>
            <li className="user-info">
              <FaUser className="icon" />
              <span>{user.username}</span>
            </li>
            <li>
              <Link to="/settings">
                <FaCog className="icon" />
                <span>Ayarlar</span>
              </Link>
            </li>
            <li>
              <button className="btn-logout" onClick={onLogout}>
                <FaSignOutAlt className="icon" />
                <span>Çıkış</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Giriş</Link>
            </li>
            <li>
              <Link to="/register">Kayıt</Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
}

export default Header;
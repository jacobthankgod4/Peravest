import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/i/logo_a.png" alt="PeraVest" style={{ height: '40px' }} />
        </Link>
        
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
          <Link to="/listings" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>Listings</Link>
          <Link to="/refer" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>Refer & Earn</Link>
          <Link to="/profile" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>Profile</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
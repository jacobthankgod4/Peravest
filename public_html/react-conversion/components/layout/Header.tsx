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
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          PropertyInvest
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link to="/properties" className="text-gray-700 hover:text-blue-600">Properties</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">Admin</Link>
              )}
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
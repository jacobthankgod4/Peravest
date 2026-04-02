import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../header-fix.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md" style={{ position: 'relative', zIndex: 100 }}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          PropertyInvest
        </Link>
        
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden"
          style={{
            border: 'none',
            background: 'transparent',
            padding: '8px',
            cursor: 'pointer',
            zIndex: 1001
          }}
          aria-label="Toggle menu"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '24px', color: '#0e2e50' }}></i>
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={closeMobileMenu}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease'
            }}
          />
        )}
        
        {/* Navigation */}
        <nav 
          className={`mobile-menu-container ${isMobileMenuOpen ? 'show' : ''}`}
          style={{
            position: isMobileMenuOpen ? 'fixed' : 'static',
            top: isMobileMenuOpen ? 0 : 'auto',
            right: isMobileMenuOpen ? (isMobileMenuOpen ? 0 : '-100%') : 'auto',
            width: isMobileMenuOpen ? '280px' : 'auto',
            height: isMobileMenuOpen ? '100vh' : 'auto',
            background: '#fff',
            zIndex: 1000,
            transition: 'right 0.3s ease-in-out',
            overflowY: isMobileMenuOpen ? 'auto' : 'visible',
            padding: isMobileMenuOpen ? '80px 0 20px 0' : '0'
          }}
        >
          <div className="flex items-center space-x-6" style={{ flexDirection: isMobileMenuOpen ? 'column' : 'row', alignItems: isMobileMenuOpen ? 'stretch' : 'center', gap: isMobileMenuOpen ? '0' : '1.5rem' }}>
            <Link 
              to="/properties" 
              className="text-gray-700 hover:text-blue-600"
              onClick={closeMobileMenu}
              style={{
                padding: isMobileMenuOpen ? '15px 25px' : '0',
                borderBottom: isMobileMenuOpen ? '1px solid #f0f0f0' : 'none',
                width: isMobileMenuOpen ? '100%' : 'auto',
                display: 'block'
              }}
            >
              Properties
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4" style={{ flexDirection: isMobileMenuOpen ? 'column' : 'row', alignItems: isMobileMenuOpen ? 'stretch' : 'center', gap: isMobileMenuOpen ? '0' : '1rem', width: isMobileMenuOpen ? '100%' : 'auto' }}>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-600"
                  onClick={closeMobileMenu}
                  style={{
                    padding: isMobileMenuOpen ? '15px 25px' : '0',
                    borderBottom: isMobileMenuOpen ? '1px solid #f0f0f0' : 'none',
                    width: isMobileMenuOpen ? '100%' : 'auto',
                    display: 'block'
                  }}
                >
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-blue-600"
                    onClick={closeMobileMenu}
                    style={{
                      padding: isMobileMenuOpen ? '15px 25px' : '0',
                      borderBottom: isMobileMenuOpen ? '1px solid #f0f0f0' : 'none',
                      width: isMobileMenuOpen ? '100%' : 'auto',
                      display: 'block'
                    }}
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={() => { handleLogout(); closeMobileMenu(); }} 
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  style={{
                    width: isMobileMenuOpen ? 'calc(100% - 50px)' : 'auto',
                    margin: isMobileMenuOpen ? '15px 25px' : '0'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4" style={{ display: 'flex', flexDirection: isMobileMenuOpen ? 'column' : 'row', gap: isMobileMenuOpen ? '0' : '1rem', width: isMobileMenuOpen ? '100%' : 'auto' }}>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600"
                  onClick={closeMobileMenu}
                  style={{
                    padding: isMobileMenuOpen ? '15px 25px' : '0',
                    borderBottom: isMobileMenuOpen ? '1px solid #f0f0f0' : 'none',
                    width: isMobileMenuOpen ? '100%' : 'auto',
                    display: 'block'
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={closeMobileMenu}
                  style={{
                    width: isMobileMenuOpen ? 'calc(100% - 50px)' : 'auto',
                    margin: isMobileMenuOpen ? '15px 25px' : '0',
                    textAlign: 'center',
                    display: 'block'
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
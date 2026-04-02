import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../header-fix.css';

const Header: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 991);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const handleResize = () => {
      if (mounted) {
        setIsMobile(window.innerWidth < 991);
        if (window.innerWidth >= 991) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      {/* Simplified Header for Admins */}
      {isAdmin ? (
        <div className="main-navigation">
          <nav className="navbar navbar-expand-lg">
            <div className="container">
              {/* Logo */}
              <Link className="navbar-brand" to="/">
                <img 
                  src="/assets/img/logo/logo_a.png" 
                  className="img-f" 
                  alt="Peravest Logo" 
                  width="10" 
                  height="10" 
                />
              </Link>

              {/* Admin Navigation */}
              <div className="navbar-nav ms-auto">
                <ul className="navbar-nav align-items-center">
                  <li className="nav-item">
                    <Link className="nav-link switch" to="/listings">Listings</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link switch" to="/admin/dashboard">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <div className="dropdown">
                      <div className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                        Profile
                      </div>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li><Link className="dropdown-item" to="/admin/dashboard"><i className="far fa-tachometer-alt"></i> Admin Dashboard</Link></li>
                        <li><Link className="dropdown-item" to="/admin/properties"><i className="far fa-building"></i> Properties</Link></li>
                        <li><Link className="dropdown-item" to="/admin/users"><i className="far fa-users"></i> Users</Link></li>
                        <li><button className="dropdown-item" onClick={handleLogout}><i className="far fa-sign-out"></i> Logout</button></li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      ) : (
        /* Full Header for Non-Admins */
        <>
          {/* Header Top */}
          <div className="header-top">
            <div className="container">
              <div className="header-top-wrapper">
                <div className="header-top-left">
                  <div className="header-top-contact">
                    <ul>
                      <li>
                        <div className="header-top-contact-info">
                          <a href="#">
                            <i className="far fa-map-marker-alt"></i> 
                            16,Afolabi Aina street, Off Allen Road Ikeja Lagos
                          </a>
                        </div>
                      </li>
                      <li>
                        <div className="header-top-contact-info">
                          <a href="tel:+2348109344800">
                            <i className="far fa-phone-arrow-down-left"></i> 
                            (+234) 810 934 4800
                          </a>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="header-top-right">
                  {/* Authentication Links */}
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="header-top-link">
                      <i className="far fa-arrow-right-to-bracket"></i> Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="header-top-link">
                        <i className="far fa-arrow-right-to-bracket"></i> Login
                      </Link>
                      <Link to="/register" className="header-top-link">
                        <i className="far fa-user-tie"></i> Register
                      </Link>
                    </>
                  )}

                  {/* Social Media Links */}
                  <div className="header-top-social">
                    <a href="https://facebook.com/Perazim Proptee limited">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://www.instagram.com/Perazim_proptee">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="main-navigation">
            <nav className="navbar navbar-expand-lg">
              <div className="container">
                {/* Logo */}
                <Link className="navbar-brand" to="/">
                  <img 
                    src="/assets/img/logo/logo_a.png" 
                    className="img-f" 
                    alt="Peravest Logo" 
                    width="10" 
                    height="10" 
                  />
                </Link>

                {/* Mobile Menu Right - ALWAYS RENDER */}
                <div 
                  className="mobile-menu-right" 
                  style={{ 
                    display: isMobile ? 'flex' : 'none',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1001
                  }}
                >
                  <button 
                    className="navbar-toggler" 
                    type="button"
                    onClick={toggleMobileMenu}
                    aria-expanded={isMobileMenuOpen}
                    aria-label="Toggle navigation"
                    style={{
                      display: 'block',
                      border: 'none',
                      background: 'transparent',
                      padding: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="navbar-toggler-btn-icon">
                      <i className={`far ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '24px', color: '#0e2e50' }}></i>
                    </span>
                  </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                  <div 
                    className="mobile-menu-overlay"
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

                {/* Desktop Menu - ALWAYS RENDER */}
                <div 
                  className={`collapse navbar-collapse mobile-menu-container ${isMobileMenuOpen ? 'show' : ''}`} 
                  id="main_nav"
                  style={{
                    display: isMobile && !isMobileMenuOpen ? 'none' : undefined
                  }}
                >
                  <ul className="navbar-nav" onClick={(e) => {
                    if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).tagName === 'BUTTON') {
                      closeMobileMenu();
                    }
                  }}>
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link switch" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link switch" to="/about">About</Link>
                        </li>
                      </>
                    )}
                    
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/listings">Listings</Link>
                    </li>
                    
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link switch" to="/faq">FAQ</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link switch" to="/contact">Contact</Link>
                        </li>
                      </>
                    )}

                    {/* User-specific Navigation */}
                    {isAuthenticated && (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link switch" to="/dashboard">Dashboard</Link>
                        </li>
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                            Account
                          </a>
                          <ul className="dropdown-menu fade-down">
                            <li><Link className="dropdown-item" to="/dashboard"><i className="far fa-chart-line"></i> Dashboard</Link></li>
                            <li><Link className="dropdown-item" to="/profile"><i className="far fa-user"></i> Profile</Link></li>
                            <li><button className="dropdown-item" onClick={handleLogout}><i className="far fa-sign-out"></i> Logout</button></li>
                          </ul>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link switch" to="/contact">Contact</Link>
                        </li>
                        <li className="nav-item scratch">
                          <button className="nav-link switch" onClick={handleLogout}>Logout</button>
                        </li>
                      </>
                    )}

                    {/* Guest Navigation */}
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item scratch">
                          <Link className="nav-link switch" to="/login">Login</Link>
                        </li>
                        <li className="nav-item scratch">
                          <Link className="nav-link switch" to="/register">Sign Up</Link>
                        </li>
                      </>
                    )}
                  </ul>

                  {/* Header Nav Right */}
                  <div className="header-nav-right">
                    <div className="header-account">
                      <div className="header-btn">
                        <Link to="/listings" className="theme-btn mt-2">
                          <span className="far fa-plus-circle"></span>
                          Invest Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
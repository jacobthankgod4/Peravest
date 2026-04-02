import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../header-fix.css';

const Header: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 992);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      {isAdmin ? (
        <div className="main-navigation">
          <nav className="navbar navbar-expand-lg">
            <div className="container" style={{ position: 'relative' }}>
              <Link className="navbar-brand" to="/">
                <img src="/assets/img/logo/logo_a.png" className="img-f" alt="Peravest Logo" style={{ maxHeight: '50px', width: 'auto' }} />
              </Link>

              {/* ADMIN HAMBURGER */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                style={{
                  display: isMobile ? 'block' : 'none',
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  padding: '10px',
                  cursor: 'pointer',
                  zIndex: 1002
                }}
              >
                <i className={`far ${menuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '24px', color: '#0e2e50' }}></i>
              </button>

              {menuOpen && isMobile && (
                <div 
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 1000
                  }}
                />
              )}

              <div 
                style={{
                  position: isMobile ? 'fixed' : 'static',
                  top: 0,
                  right: isMobile ? (menuOpen ? 0 : '-280px') : 'auto',
                  width: isMobile ? '280px' : 'auto',
                  height: isMobile ? '100vh' : 'auto',
                  background: '#fff',
                  zIndex: 1001,
                  transition: 'right 0.3s ease',
                  overflowY: isMobile ? 'auto' : 'visible',
                  paddingTop: isMobile ? '80px' : '0',
                  boxShadow: isMobile ? '-5px 0 15px rgba(0,0,0,0.1)' : 'none',
                  display: isMobile ? 'block' : 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  marginLeft: 'auto'
                }}
                className="navbar-nav ms-auto"
              >
                {isMobile && (
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '24px',
                      color: '#0e2e50',
                      cursor: 'pointer',
                      padding: '5px'
                    }}
                  >
                    <i className="far fa-times"></i>
                  </button>
                )}
                <ul className="navbar-nav align-items-center" style={{ flexDirection: isMobile ? 'column' : 'row', width: '100%', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '0' : '4px' }}>
                  <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none', width: isMobile ? '100%' : 'auto' }}>
                    <Link className="nav-link switch" to="/listings" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '0 15px', display: 'block', color: '#0e2e50', textDecoration: 'none' }}>Listings</Link>
                  </li>
                  <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none', width: isMobile ? '100%' : 'auto' }}>
                    <Link className="nav-link switch" to="/admin/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '0 15px', display: 'block', color: '#0e2e50', textDecoration: 'none' }}>Dashboard</Link>
                  </li>
                  <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none', width: isMobile ? '100%' : 'auto' }}>
                    <Link className="nav-link switch" to="/admin/properties" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '0 15px', display: 'block', color: '#0e2e50', textDecoration: 'none' }}><i className="far fa-building"></i> Properties</Link>
                  </li>
                  <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none', width: isMobile ? '100%' : 'auto' }}>
                    <Link className="nav-link switch" to="/admin/users" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '0 15px', display: 'block', color: '#0e2e50', textDecoration: 'none' }}><i className="far fa-users"></i> Users</Link>
                  </li>
                  <li className="nav-item" style={{ width: isMobile ? '100%' : 'auto' }}>
                    <button className="nav-link switch" onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ padding: isMobile ? '15px 25px' : '0 15px', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#0e2e50' }}><i className="far fa-sign-out"></i> Logout</button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      ) : (
        <>
          <div className="header-top" style={{ display: isMobile ? 'none' : 'block' }}>
            <div className="container">
              <div className="header-top-wrapper">
                <div className="header-top-left">
                  <div className="header-top-contact">
                    <ul>
                      <li><div className="header-top-contact-info"><a href="#"><i className="far fa-map-marker-alt"></i> 16,Afolabi Aina street, Off Allen Road Ikeja Lagos</a></div></li>
                      <li><div className="header-top-contact-info"><a href="tel:+2348109344800"><i className="far fa-phone-arrow-down-left"></i> (+234) 810 934 4800</a></div></li>
                    </ul>
                  </div>
                </div>
                <div className="header-top-right">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="header-top-link"><i className="far fa-arrow-right-to-bracket"></i> Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/login" className="header-top-link"><i className="far fa-arrow-right-to-bracket"></i> Login</Link>
                      <Link to="/register" className="header-top-link"><i className="far fa-user-tie"></i> Register</Link>
                    </>
                  )}
                  <div className="header-top-social">
                    <a href="https://facebook.com/Perazim Proptee limited"><i className="fab fa-facebook-f"></i></a>
                    <a href="https://www.instagram.com/Perazim_proptee"><i className="fab fa-instagram"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="main-navigation">
            <nav className="navbar navbar-expand-lg">
              <div className="container" style={{ position: 'relative' }}>
                <Link className="navbar-brand" to="/">
                  <img src="/assets/img/logo/logo_a.png" className="img-f" alt="Peravest Logo" style={{ maxHeight: '50px', width: 'auto' }} />
                </Link>

                {/* HAMBURGER BUTTON - MOBILE ONLY */}
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={menuOpen}
                  style={{
                    display: isMobile ? 'block' : 'none',
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    padding: '10px',
                    cursor: 'pointer',
                    zIndex: 1002,
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <i className={`far ${menuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '24px', color: '#0e2e50' }}></i>
                </button>

                {/* OVERLAY */}
                {menuOpen && isMobile && (
                  <div 
                    onClick={() => setMenuOpen(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      zIndex: 1000
                    }}
                  />
                )}

                {/* MENU */}
                <div 
                  style={{
                    position: isMobile ? 'fixed' : 'static',
                    top: 0,
                    right: isMobile ? (menuOpen ? 0 : '-280px') : 'auto',
                    width: isMobile ? '280px' : 'auto',
                    height: isMobile ? '100vh' : 'auto',
                    background: '#fff',
                    zIndex: 1001,
                    transition: 'right 0.3s ease',
                    overflowY: isMobile ? 'auto' : 'visible',
                    paddingTop: isMobile ? '80px' : '0',
                    paddingBottom: isMobile ? '20px' : '0',
                    boxShadow: isMobile ? '-5px 0 15px rgba(0,0,0,0.1)' : 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                  className="navbar-collapse"
                >
                  {isMobile && (
                    <button
                      onClick={() => setMenuOpen(false)}
                      aria-label="Close menu"
                      style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        color: '#0e2e50',
                        cursor: 'pointer',
                        padding: '5px',
                        zIndex: 10
                      }}
                    >
                      <i className="far fa-times"></i>
                    </button>
                  )}
                  <ul className="navbar-nav" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>Home</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/about" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>About</Link>
                        </li>
                      </>
                    )}
                    <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                      <Link className="nav-link switch" to="/listings" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>Listings</Link>
                    </li>
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/faq" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>FAQ</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/contact" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>Contact</Link>
                        </li>
                      </>
                    )}
                    {isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>Dashboard</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/profile" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>Profile</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <button className="nav-link switch" onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>Logout</button>
                        </li>
                      </>
                    )}
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/login" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>Login</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: isMobile ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/register" onClick={() => setMenuOpen(false)} style={{ padding: isMobile ? '15px 25px' : '30px 0', marginRight: isMobile ? '0' : '22px' }}>Sign Up</Link>
                        </li>
                      </>
                    )}
                  </ul>
                  <div className="header-nav-right" style={{ width: isMobile ? '100%' : 'auto', padding: isMobile ? '20px 25px' : '0', borderTop: isMobile ? '2px solid #f0f0f0' : 'none', marginTop: isMobile ? '10px' : '0' }}>
                    <div className="header-account">
                      <div className="header-btn">
                        <Link to="/listings" className="theme-btn" onClick={() => setMenuOpen(false)} style={{ marginTop: isMobile ? '0' : '8px', width: isMobile ? '100%' : 'auto', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <span className="far fa-plus-circle"></span> Invest Now
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

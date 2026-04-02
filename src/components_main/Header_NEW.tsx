import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../header-fix.css';

const Header: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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
            <div className="container">
              <Link className="navbar-brand" to="/">
                <img src="/assets/img/logo/logo_a.png" className="img-f" alt="Peravest Logo" width="10" height="10" />
              </Link>
              <div className="navbar-nav ms-auto">
                <ul className="navbar-nav align-items-center">
                  <li className="nav-item"><Link className="nav-link switch" to="/listings">Listings</Link></li>
                  <li className="nav-item"><Link className="nav-link switch" to="/admin/dashboard">Dashboard</Link></li>
                  <li className="nav-item">
                    <div className="dropdown">
                      <div className="nav-link dropdown-toggle" data-bs-toggle="dropdown" style={{ cursor: 'pointer' }}>Profile</div>
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
        <>
          <div className="header-top" style={{ display: window.innerWidth < 992 ? 'none' : 'block' }}>
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
                  <img src="/assets/img/logo/logo_a.png" className="img-f" alt="Peravest Logo" width="10" height="10" />
                </Link>

                {/* HAMBURGER BUTTON - MOBILE ONLY */}
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'block',
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
                  className="d-lg-none"
                >
                  <i className={`far ${menuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '24px', color: '#0e2e50' }}></i>
                </button>

                {/* OVERLAY */}
                {menuOpen && (
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
                    className="d-lg-none"
                  />
                )}

                {/* MENU */}
                <div 
                  style={{
                    position: window.innerWidth < 992 ? 'fixed' : 'static',
                    top: 0,
                    right: window.innerWidth < 992 ? (menuOpen ? 0 : '-280px') : 'auto',
                    width: window.innerWidth < 992 ? '280px' : 'auto',
                    height: window.innerWidth < 992 ? '100vh' : 'auto',
                    background: '#fff',
                    zIndex: 1001,
                    transition: 'right 0.3s ease',
                    overflowY: window.innerWidth < 992 ? 'auto' : 'visible',
                    paddingTop: window.innerWidth < 992 ? '80px' : '0',
                    boxShadow: window.innerWidth < 992 ? '-5px 0 15px rgba(0,0,0,0.1)' : 'none'
                  }}
                  className="navbar-collapse"
                >
                  <ul className="navbar-nav" style={{ flexDirection: window.innerWidth < 992 ? 'column' : 'row' }}>
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>Home</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/about" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>About</Link>
                        </li>
                      </>
                    )}
                    <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                      <Link className="nav-link switch" to="/listings" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>Listings</Link>
                    </li>
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/faq" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>FAQ</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/contact" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>Contact</Link>
                        </li>
                      </>
                    )}
                    {isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>Dashboard</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/profile" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>Profile</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <button className="nav-link switch" onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>Logout</button>
                        </li>
                      </>
                    )}
                    {!isAuthenticated && (
                      <>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/login" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>Login</Link>
                        </li>
                        <li className="nav-item" style={{ borderBottom: window.innerWidth < 992 ? '1px solid #f0f0f0' : 'none' }}>
                          <Link className="nav-link switch" to="/register" onClick={() => setMenuOpen(false)} style={{ padding: window.innerWidth < 992 ? '15px 25px' : '30px 0', marginRight: window.innerWidth < 992 ? '0' : '22px' }}>Sign Up</Link>
                        </li>
                      </>
                    )}
                  </ul>
                  {window.innerWidth >= 992 && (
                    <div className="header-nav-right">
                      <div className="header-account">
                        <div className="header-btn">
                          <Link to="/listings" className="theme-btn mt-2">
                            <span className="far fa-plus-circle"></span> Invest Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
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

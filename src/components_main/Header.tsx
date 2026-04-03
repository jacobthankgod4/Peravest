import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../header-fix.css';

const Header: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const close = () => setMenuOpen(false);

  return (
    <header className="header">
      {/* ── HEADER TOP BAR (desktop only, non-admin) ── */}
      {!isAdmin && (
        <div className="header-top">
          <div className="container">
            <div className="header-top-wrapper">
              <div className="header-top-left">
                <div className="header-top-contact">
                  <ul>
                    <li>
                      <div className="header-top-contact-info">
                        <a href="https://maps.google.com/?q=16+Afolabi+Aina+street+Ikeja+Lagos" target="_blank" rel="noreferrer"><i className="far fa-map-marker-alt"></i> 16, Afolabi Aina street, Off Allen Road Ikeja Lagos</a>
                      </div>
                    </li>
                    <li>
                      <div className="header-top-contact-info">
                        <a href="tel:+2348109344800"><i className="far fa-phone-arrow-down-left"></i> (+234) 810 934 4800</a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="header-top-right">
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
                <div className="header-top-social">
                  <a href="https://facebook.com/Perazim-Proptee-limited" target="_blank" rel="noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://www.instagram.com/Perazim_proptee" target="_blank" rel="noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN NAVIGATION ── */}
      <div className="main-navigation">
        <nav className="navbar navbar-expand-lg">
          <div className="container">

            {/* Logo */}
            <Link className="navbar-brand" to="/">
              <img
                src="/assets/img/logo/logo_a.png"
                alt="Peravest Logo"
                style={{ height: '50px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
              />
            </Link>

            {/* Mobile right: Invest Now + hamburger */}
            <div className="mobile-menu-right">
              <div className="header-account">
                <Link to="/listings" className="theme-btn" onClick={close}>
                  <span className="far fa-plus-circle"></span> Invest Now
                </Link>
              </div>
              <button
                className="navbar-toggler"
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle navigation"
                aria-expanded={menuOpen}
              >
                <span className="navbar-toggler-btn-icon">
                  <i className={`far ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </span>
              </button>
            </div>

            {/* Overlay */}
            {menuOpen && (
              <div
                onClick={close}
                style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.5)', zIndex: 1000
                }}
              />
            )}

            {/* Nav menu */}
            <div className={`navbar-collapse${menuOpen ? ' menu-open' : ''}`} id="main_nav">
              {/* Close button inside drawer */}
              <button className="menu-close-btn" onClick={close} aria-label="Close menu">
                <i className="far fa-times"></i>
              </button>

              <ul className="navbar-nav">
                {isAdmin ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/listings" onClick={close}>Listings</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/admin/dashboard" onClick={close}>Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/admin/properties" onClick={close}>
                        <i className="far fa-building"></i> Properties
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/admin/users" onClick={close}>
                        <i className="far fa-users"></i> Users
                      </Link>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link switch btn-nav" onClick={handleLogout}>
                        <i className="far fa-sign-out"></i> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/" onClick={close}>Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/about" onClick={close}>About</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/listings" onClick={close}>Listings</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/faq" onClick={close}>Faq</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link switch" to="/contact" onClick={close}>Contact</Link>
                    </li>

                    {isAuthenticated && (
                      <>
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" href="/dashboard" data-bs-toggle="dropdown">Dashboard</a>
                          <ul className="dropdown-menu fade-down">
                            <li><Link className="dropdown-item" to="/my-investments" onClick={close}><i className="far fa-chart-line"></i> My Investments</Link></li>
                            <li><Link className="dropdown-item" to="/profile" onClick={close}><i className="far fa-user"></i> Profile</Link></li>
                            <li><Link className="dropdown-item" to="/edit-password" onClick={close}><i className="far fa-lock"></i> Edit Password</Link></li>
                            <li><button className="dropdown-item" onClick={handleLogout}><i className="far fa-sign-out"></i> Logout</button></li>
                          </ul>
                        </li>
                        <li className="nav-item scratch">
                          <button className="nav-link switch btn-nav" onClick={handleLogout}>Logout</button>
                        </li>
                      </>
                    )}

                    {!isAuthenticated && (
                      <>
                        <li className="nav-item scratch">
                          <Link className="nav-link switch" to="/login" onClick={close}>Login</Link>
                        </li>
                        <li className="nav-item scratch">
                          <Link className="nav-link switch" to="/register" onClick={close}>Sign Up</Link>
                        </li>
                      </>
                    )}
                  </>
                )}
              </ul>

              {/* Desktop: Invest Now button */}
              <div className="header-nav-right">
                <div className="header-account">
                  <div className="header-btn">
                    <Link to="/listings" className="theme-btn mt-2" onClick={close}>
                      <span className="far fa-plus-circle"></span> Invest Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

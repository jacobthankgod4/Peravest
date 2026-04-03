import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
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
              {isAdmin ? (
                <Link to="/app-users" className="header-top-link">
                  <i className="far fa-arrow-right-to-bracket"></i> App Users
                </Link>
              ) : isAuthenticated ? (
                <Link to="/my-investments" className="header-top-link">
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

            {/* Mobile Menu Right */}
            <div className="mobile-menu-right">
              {isAdmin ? (
                <AdminMobileMenu user={user} onLogout={handleLogout} />
              ) : (
                <div className="header-account">
                  <div>
                    <Link to="/listings" className="theme-btn mt-2">
                      <span className="far fa-plus-circle"></span>
                      Invest Now
                    </Link>
                  </div>
                </div>
              )}
              
              <button 
                className="navbar-toggler" 
                type="button" 
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-btn-icon">
                  <i className="far fa-bars"></i>
                </span>
              </button>
            </div>

            {/* Main Navigation Menu */}
            <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="main_nav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link switch" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link switch" to="/about">About</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link switch" to="/listings">Listings</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link switch" to="/faq">FAQ</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link switch" to="/contact">Contact</Link>
                </li>

                {/* User-specific Navigation */}
                {isAuthenticated && !isAdmin && (
                  <>
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                        Dashboard
                      </a>
                      <ul className="dropdown-menu fade-down">
                        <li><Link className="dropdown-item" to="/my-investments">My Investments</Link></li>
                        <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                        <li><Link className="dropdown-item" to="/edit-password">Edit Password</Link></li>
                        <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                      </ul>
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
              {isAdmin ? (
                <AdminDesktopMenu user={user} onLogout={handleLogout} />
              ) : (
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
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

// Admin Mobile Menu Component
const AdminMobileMenu: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="header-account">
    <div className="dropdown">
      <div data-bs-toggle="dropdown" aria-expanded="false">
        <img src="/assets/img/profile.webp" alt="Profile" />
        <i className="fa fa-caret-down" aria-hidden="true"></i>
      </div>
      <ul className="dropdown-menu dropdown-menu-end">
        <li><Link className="dropdown-item" to="/app-users"><i className="far fa-user"></i> App Users</Link></li>
        {user?.email === "jacobthankgod4@gmail.com" && (
          <li><Link className="dropdown-item" to="/maintenance-fee"><i className="far fa-dollar"></i> Maintenance Fee</Link></li>
        )}
        <li><Link className="dropdown-item" to="/property"><i className="far fa-plus-circle"></i> Property</Link></li>
        <li><Link className="dropdown-item" to="#"><i className="far fa-plus-circle"></i> Blog</Link></li>
        <li><Link className="dropdown-item" to="/subscribers"><i className="far fa-thumbs-up"></i> Subscribers <span className="badge bg-danger">02</span></Link></li>
        <li><Link className="dropdown-item" to="#"><i className="far fa-bookmark"></i> Messages</Link></li>
        <li><button className="dropdown-item" onClick={onLogout}><i className="far fa-sign-out"></i> Log Out</button></li>
      </ul>
    </div>
  </div>
);

// Admin Desktop Menu Component
const AdminDesktopMenu: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="header-nav-right">
    <div className="header-account">
      <div className="dropdown">
        <div data-bs-toggle="dropdown" aria-expanded="false">
          <img src="/assets/img/profile.webp" alt="Profile" />
          <i className="fa fa-caret-down" aria-hidden="true"></i>
        </div>
        <ul className="dropdown-menu dropdown-menu-end">
          <li><Link className="dropdown-item" to="/app-users"><i className="far fa-user"></i> App Users</Link></li>
          {user?.email === "jacobthankgod4@gmail.com" && (
            <li><Link className="dropdown-item" to="/maintenance-fee"><i className="far fa-dollar"></i> Maintenance Fee</Link></li>
          )}
          <li><Link className="dropdown-item" to="/property"><i className="far fa-plus-circle"></i> Property</Link></li>
          <li><Link className="dropdown-item" to="#"><i className="far fa-heart"></i> Blog</Link></li>
          <li><Link className="dropdown-item" to="/subscribers"><i className="far fa-thumbs-up"></i> Subscribers</Link></li>
          <li><Link className="dropdown-item" to="#"><i className="far fa-envelope"></i> Messages</Link></li>
          <li><button className="dropdown-item" onClick={onLogout}><i className="far fa-sign-out"></i> Log Out</button></li>
        </ul>
      </div>
    </div>
  </div>
);

export default Header;
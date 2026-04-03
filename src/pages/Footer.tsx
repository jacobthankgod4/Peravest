import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer-area">
      <div className="footer-widget">
        <div className="container">
          <div className="row footer-widget-wrapper pt-100 pb-70">
            <div className="col-md-6 col-lg-4">
              <div className="footer-widget-box about-us">
                <Link to="/" className="footer-logo">
                  <img src="/i/logo_a.png" alt="" />
                </Link>
                <p className="mb-3">Peravest unlocks professional real estate investments for everyone.</p>
                <ul className="footer-contact">
                  <li><i className="far fa-map-marker-alt"></i>Lagos, Nigeria</li>
                  <li><a href="mailto:info@peravest.com"><i className="far fa-envelope"></i>info@peravest.com</a></li>
                </ul>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="footer-widget-box list">
                <h4 className="footer-widget-title" style={{ color: '#fff', fontWeight: 900 }}>Quick Links</h4>
                <ul className="footer-list">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/listings">Properties</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="footer-widget-box">
                <h4 className="footer-widget-title" style={{ color: '#fff', fontWeight: 900 }}>Newsletter</h4>
                <div className="footer-newsletter">
                  <input type="email" className="form-control" placeholder="Email" />
                  <button className="theme-btn">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p>&copy; {new Date().getFullYear()} Peravest. All Rights Reserved.</p>
            </div>
            <div className="col-md-6">
              <ul className="footer-social">
                <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                <li><a href="#"><i className="fab fa-twitter"></i></a></li>
                <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
                <li><a href="#"><i className="fab fa-instagram"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

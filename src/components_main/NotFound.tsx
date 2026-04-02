import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="error-area py-120">
      <div className="container">
        <div className="error-wrapper text-center">
          <h1 className="error-code">404</h1>
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-text">The page you are looking for does not exist.</p>
          <Link to="/" className="theme-btn mt-4">
            Go Back Home <i className="far fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

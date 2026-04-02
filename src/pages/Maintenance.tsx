import React from 'react';

const Maintenance: React.FC = () => {
  return (
    <div className="maintenance-page">
      <div className="container">
        <div className="maintenance-content">
          <h1>🔧 Under Maintenance</h1>
          <p>We're currently performing scheduled maintenance to improve your experience.</p>
          <p>We'll be back shortly. Thank you for your patience!</p>
          <div className="contact-info">
            <p>For urgent matters, contact us at:</p>
            <p><strong>support@example.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

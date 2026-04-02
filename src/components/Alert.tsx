import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const alertClasses = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  };

  return (
    <div className={`alert ${alertClasses[type]} alert-dismissible fade show`} role="alert">
      {message}
      {onClose && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
      )}
    </div>
  );
};

export default Alert;

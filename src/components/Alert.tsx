import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, children, onClose, className }) => {
  const alertClasses = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  };

  return (
    <div className={`alert ${alertClasses[type]} alert-dismissible fade show ${className || ''}`} role="alert">
      {children || message}
      {onClose && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
      )}
    </div>
  );
};

export default Alert;

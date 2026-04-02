import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  loading = false, 
  variant = 'primary', 
  children, 
  disabled,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'theme-btn',
    secondary: 'theme-btn-outline',
    danger: 'theme-btn-danger'
  };

  return (
    <button
      className={`${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;

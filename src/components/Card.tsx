import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h4>{title}</h4>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;

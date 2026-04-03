import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbProps {
  title: string;
  currentPage: string;
  backgroundImage?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  title, 
  currentPage,
  backgroundImage = '/assets/img/breadcrumb/01.jpg'
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="site-breadcrumb"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="container">
        <h2 className="breadcrumb-title">{title}</h2>
        <ul className="breadcrumb-menu">
          <li>
            <button 
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              Home
            </button>
          </li>
          <li className="active">{currentPage}</li>
        </ul>
      </div>
    </div>
  );
};

export default Breadcrumb;

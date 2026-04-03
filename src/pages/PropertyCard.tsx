import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import '../styles/property-card-autoscroll.css';

interface Property {
  id: string;
  title: string;
  address: string;
  image: string;
  shareCost: number;
  interest: number;
  percent: number;
  investors: number;
  raised: number;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const interestRate = useMemo(() => property.interest, [property.interest]);
  
  const images = useMemo(() => {
    const imgs = property.image ? property.image.split(',').filter(img => img.trim()) : [];
    return imgs.length > 0 ? imgs : ['/assets/img/property/default.jpg'];
  }, [property.image]);

  useEffect(() => {
    console.log('[PropertyCard] Images for', property.title, ':', images);
    if (images.length > 1) {
      console.log('[PropertyCard] Starting auto-scroll for', property.title, 'with', images.length, 'images');
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const next = (prev + 1) % images.length;
          console.log('[PropertyCard] Switching to image', next, 'for', property.title);
          return next;
        });
      }, 3000);
      return () => {
        console.log('[PropertyCard] Cleanup interval for', property.title);
        clearInterval(interval);
      };
    }
  }, [images, property.title]);
  const handleViewDetails = () => {
    navigate(`/listings/${property.id}`);
  };

  return (
    <div className="listing-item">
      <span className="listing-badge">{interestRate}% p.a</span>
      <div className="listing-img" style={{ position: 'relative', overflow: 'hidden', height: '250px' }}>
        {images.map((img, index) => (
          <img 
            key={`${property.id}-${index}`}
            className="img_list" 
            src={img.trim()}
            alt={`${property.title} - ${index + 1}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: index === currentImageIndex ? 1 : 0
            }}
            onError={(e) => {
              console.error('[PropertyCard] Image failed to load:', img);
              e.currentTarget.src = '/assets/img/property/default.jpg';
            }}
          />
        ))}
      </div>
      <div className="listing-content">
        <h4 className="listing-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ cursor: 'pointer' }} onClick={handleViewDetails}>{property.title}</span>
        </h4>
        <p className="listing-sub-title">
          <i className="far fa-location-dot"></i>{property.address}
        </p>
        <div className="listing-price">
          <div className="listing-price-info">
            <h6 className="listing-price-amount">₦{property.shareCost.toLocaleString()}</h6>
            <span className="listing-price-title">Participation Unit Cost</span>
          </div>
          <div>
            <button 
              onClick={handleViewDetails}
              className="listing-btn"
            >
              View Details
            </button>
          </div>
        </div>
        <div className="listing-feature"></div>
        <hr />
        <div>
          <div className="progressbar-item">
            <ProgressBar percentage={property.percent} />
          </div>
          <div className="d-flexa">
            <div>
              <h5>{property.investors.toLocaleString()} Members</h5>
            </div>
            <div>
              <h4>₦{property.raised.toLocaleString()} Raised</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

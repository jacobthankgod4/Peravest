import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

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

  const handleInvest = () => {
    navigate(`/packages?property=${property.id}`);
  };

  return (
    <div className="listing-item">
      <span className="listing-badge">{property.interest}% p.a</span>
      <div className="listing-img">
        <img 
          className="img_list" 
          src={`/assets/img/property/${property.image}`}
          alt={property.title}
        />
      </div>
      <div className="listing-content">
        <h4 className="listing-title">
          <a href="#" onClick={(e) => { e.preventDefault(); }}>{property.title}</a>
        </h4>
        <p className="listing-sub-title">
          <i className="far fa-location-dot"></i>{property.address}
        </p>
        <div className="listing-price">
          <div className="listing-price-info">
            <h6 className="listing-price-amount">₦{property.shareCost.toLocaleString()}</h6>
            <span className="listing-price-title">Cost of Share</span>
          </div>
          <div>
            <button 
              onClick={handleInvest}
              className="listing-btn"
            >
              Invest Now
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
              <h5>{property.investors.toLocaleString()} Investors</h5>
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

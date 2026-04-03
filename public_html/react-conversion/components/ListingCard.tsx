import React from 'react';

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

interface ListingCardProps {
  property: Property;
  onInvest: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ property, onInvest }) => {
  return (
    <div className="listing-item">
      <div className="listing-img">
        <img 
          className="img_list" 
          src={`/assets/img/property/${property.image}`}
          alt={property.title}
        />
      </div>
      <div className="listing-content">
        <h4 className="listing-title">
          <a href="#">{property.title}</a>
        </h4>
        <p className="listing-sub-title">
          <i className="far fa-location-dot"></i>{property.address}
        </p>
        <div className="listing-price">
          <div className="listing-price-info">
            <a href="#" className="text-success">
              <u>about this opportunity</u> <i className="far fa-arrow-right"></i>
            </a>
          </div>
        </div>
        <div className="listing-feature"></div>
        <hr />
        <div className="d-flexa">
          <div className="listing-author">
            <button 
              onClick={onInvest}
              className="listing-btn"
            >
              See Investment Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;

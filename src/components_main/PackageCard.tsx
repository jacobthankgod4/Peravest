import React from 'react';
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

interface InvestmentPeriod {
  months: number;
  label: string;
  roi: number;
}

interface PackageCardProps {
  property: Property;
  selectedPeriod: number;
  roi: number;
  onInvest: () => void;
  investmentPeriods: InvestmentPeriod[];
  onPeriodChange: (period: number) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ 
  property, 
  selectedPeriod, 
  roi, 
  onInvest, 
  investmentPeriods, 
  onPeriodChange 
}) => {
  const calculateReturns = (amount: number, period: number) => {
    const periodData = investmentPeriods.find(p => p.months === period);
    const roiPercent = periodData ? periodData.roi : 9.25;
    return amount + (amount * roiPercent / 100);
  };

  return (
    <div className="listing-item package-card">
      <span className="listing-badge">{property.interest}% p.a</span>
      <div className="row">
        <div className="col-md-4">
          <div className="listing-img">
            <img 
              className="img_list" 
              src={`/assets/img/property/${property.image}`}
              alt={property.title}
            />
          </div>
        </div>
        <div className="col-md-8">
          <div className="listing-content">
            <h4 className="listing-title">
              <a href="#" onClick={(e) => { e.preventDefault(); }}>{property.title}</a>
            </h4>
            <p className="listing-sub-title">
              <i className="far fa-location-dot"></i>{property.address}
            </p>
            
            <div className="package-details">
              <div className="row">
                <div className="col-md-6">
                  <div className="package-info">
                    <h6>Investment Period</h6>
                    <select 
                      className="form-select"
                      value={selectedPeriod}
                      onChange={(e) => onPeriodChange(Number(e.target.value))}
                    >
                      {investmentPeriods.map(period => (
                        <option key={period.months} value={period.months}>
                          {period.label} - {period.roi}% ROI
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="package-info">
                    <h6>Share Cost</h6>
                    <h4>₦{property.shareCost.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
              
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="package-info">
                    <h6>Expected Returns</h6>
                    <h4 className="text-success">₦{calculateReturns(property.shareCost, selectedPeriod).toLocaleString()}</h4>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="package-info">
                    <h6>ROI</h6>
                    <h4 className="text-primary">{roi}%</h4>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="listing-feature mt-3">
              <div className="progressbar-item">
                <ProgressBar percentage={property.percent} />
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>{property.investors.toLocaleString()} Investors</h6>
                </div>
                <div>
                  <h6>₦{property.raised.toLocaleString()} Raised</h6>
                </div>
              </div>
            </div>
            
            <div className="listing-price mt-3">
              <button 
                onClick={onInvest}
                className="btn btn-primary listing-btn"
              >
                Invest Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;

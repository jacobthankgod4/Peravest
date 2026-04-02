import React from 'react';
import ProgressBar from './ProgressBar';
import styles from './PackageCard.module.css';

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
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const images = property.image.split(',');

  React.useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const calculateReturns = (amount: number, period: number) => {
    const periodData = investmentPeriods.find(p => p.months === period);
    const roiPercent = periodData ? periodData.roi : 9.25;
    return amount + (amount * roiPercent / 100);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardInner}>
        <div className={styles.imageWrapper}>
          <span className={styles.badge}>{property.interest}% p.a</span>
          <img 
            className={styles.image}
            src={images[currentImageIndex]}
            alt={property.title}
            onError={(e) => {
              e.currentTarget.src = '/assets/img/property/default.jpg';
            }}
          />
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{property.title}</h3>
          <p className={styles.location}>
            <i className="far fa-location-dot"></i>
            {property.address}
          </p>
          
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <h6>Investment Period</h6>
              <select 
                className={styles.select}
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
            
            <div className={styles.detailItem}>
              <h6>Share Cost</h6>
              <h4>₦{property.shareCost.toLocaleString()}</h4>
            </div>
            
            <div className={styles.detailItem}>
              <h6>Expected Returns</h6>
              <h4 className={styles.success}>₦{calculateReturns(property.shareCost, selectedPeriod).toLocaleString()}</h4>
            </div>
            
            <div className={styles.detailItem}>
              <h6>ROI</h6>
              <h4 className={styles.accent}>{roi}%</h4>
            </div>
          </div>
          
          <div className={styles.progress}>
            <ProgressBar percentage={property.percent} />
          </div>
          
          <div className={styles.stats}>
            <span className={styles.statItem}>{property.investors.toLocaleString()} Investors</span>
            <span className={styles.statItem}>₦{property.raised.toLocaleString()} Raised</span>
          </div>
          
          <button onClick={onInvest} className={styles.investBtn}>
            Invest Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;

import React, { useState, useEffect } from 'react';
import { packageService } from '../services/packageService';
import { InvestmentPackage } from '../types/package.types';
import styles from './InvestmentPackageSelector.module.css';

interface InvestmentPackageSelectorProps {
  propertyId: number;
  onInvest: (packageId: number, packageData: InvestmentPackage) => void;
}

const INVESTMENT_AMOUNTS = [5000, 10000, 30000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 50000000];
const POPULAR_AMOUNTS = [50000, 100000, 500000];

const InvestmentPackageSelector: React.FC<InvestmentPackageSelectorProps> = ({
  propertyId,
  onInvest
}) => {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [propertyId]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await packageService.getPackagesByProperty(propertyId);
      setPackages(data);
    } catch (err) {
      console.error('[InvestmentPackageSelector] Error fetching packages:', err);
      setError('Failed to load investment packages');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `₦${amount / 1000000}M`;
    if (amount >= 1000) return `₦${amount / 1000}K`;
    return `₦${amount}`;
  };

  const getPackagesForAmount = (amount: number) => {
    return packages.filter(p => p.investment_amount === amount).sort((a, b) => a.duration_months - b.duration_months);
  };

  const calculateReturns = (amount: number, roi: number) => {
    return amount + (amount * roi / 100);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setStep(2);
  };

  const handleDurationSelect = (pkg: InvestmentPackage) => {
    setSelectedPackage(pkg);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedPackage(null);
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loading}>Loading packages...</div>
      </div>
    );
  }

  if (error || packages.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.error}>{error || 'No packages available'}</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {step === 1 ? (
        <>
          <h4 className={styles.title}>Choose Investment Amount</h4>
          <p className={styles.subtitle}>Select how much you want to invest</p>
          
          <div className={styles.amountGrid}>
            {INVESTMENT_AMOUNTS.map(amount => {
              const isPopular = POPULAR_AMOUNTS.includes(amount);
              return (
                <button
                  key={amount}
                  className={`${styles.amountCard} ${isPopular ? styles.popular : ''}`}
                  onClick={() => handleAmountSelect(amount)}
                >
                  {isPopular && <span className={styles.badge}>⭐ Popular</span>}
                  <div className={styles.amountValue}>{formatAmount(amount)}</div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <button className={styles.backBtn} onClick={handleBack}>
            <i className="far fa-arrow-left"></i> Back
          </button>
          
          <h4 className={styles.title}>Select Investment Period</h4>
          <p className={styles.subtitle}>For {formatAmount(selectedAmount!)}</p>
          
          <div className={styles.durationGrid}>
            {getPackagesForAmount(selectedAmount!).map(pkg => (
              <button
                key={pkg.id}
                className={`${styles.durationCard} ${selectedPackage?.id === pkg.id ? styles.selected : ''}`}
                onClick={() => handleDurationSelect(pkg)}
              >
                <div className={styles.durationLabel}>{pkg.duration_months} Months</div>
                <div className={styles.roiBadge}>{pkg.roi_percentage}% ROI</div>
                <div className={styles.returnsLabel}>You Get</div>
                <div className={styles.returnsValue}>
                  ₦{calculateReturns(pkg.investment_amount, pkg.roi_percentage).toLocaleString()}
                </div>
                <div className={styles.profitLabel}>
                  +₦{(pkg.investment_amount * pkg.roi_percentage / 100).toLocaleString()} profit
                </div>
              </button>
            ))}
          </div>

          {selectedPackage && (
            <button 
              className={styles.investBtn}
              onClick={() => onInvest(selectedPackage.id, selectedPackage)}
            >
              Invest ₦{selectedPackage.investment_amount.toLocaleString()} <i className="far fa-arrow-right"></i>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default InvestmentPackageSelector;

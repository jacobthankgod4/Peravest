import React, { useState, useEffect } from 'react';
import { packageService } from '../services/packageService';
import { InvestmentPackage, CreatePackageDTO } from '../types/package.types';
import styles from './PackageManager.module.css';

interface PackageManagerProps {
  propertyId: number;
  onUpdate?: () => void;
}

const PackageManager: React.FC<PackageManagerProps> = ({ propertyId, onUpdate }) => {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePackageDTO>>({
    property_id: propertyId,
    package_name: '',
    min_investment: 5000,
    max_investment: 50000,
    duration_months: 6,
    interest_rate: 10,
    roi_percentage: 18.5,
    max_investors: 100,
    display_order: 1
  });

  useEffect(() => {
    fetchPackages();
  }, [propertyId]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackagesByProperty(propertyId);
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const validation = packageService.validatePackage(formData);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
      }
      await packageService.createPackage(formData as CreatePackageDTO);
      setShowAddForm(false);
      resetForm();
      fetchPackages();
      onUpdate?.();
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await packageService.deletePackage(id);
      fetchPackages();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const resetForm = () => {
    setFormData({
      property_id: propertyId,
      package_name: '',
      min_investment: 5000,
      max_investment: 50000,
      duration_months: 6,
      interest_rate: 10,
      roi_percentage: 18.5,
      max_investors: 100,
      display_order: packages.length + 1
    });
  };

  if (loading) return <div className={styles.loading}>Loading packages...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Investment Packages</h3>
        <button className={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Package'}
        </button>
      </div>

      {showAddForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Package Name</label>
              <input
                type="text"
                value={formData.package_name}
                onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                placeholder="e.g., Premium - 12 Months"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Duration (Months)</label>
              <input
                type="number"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: Number(e.target.value) })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Min Investment (₦)</label>
              <input
                type="number"
                value={formData.min_investment}
                onChange={(e) => setFormData({ ...formData, min_investment: Number(e.target.value) })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Max Investment (₦)</label>
              <input
                type="number"
                value={formData.max_investment}
                onChange={(e) => setFormData({ ...formData, max_investment: Number(e.target.value) })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: Number(e.target.value) })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>ROI Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.roi_percentage}
                onChange={(e) => setFormData({ ...formData, roi_percentage: Number(e.target.value) })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Max Investors</label>
              <input
                type="number"
                value={formData.max_investors}
                onChange={(e) => setFormData({ ...formData, max_investors: Number(e.target.value) })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
              />
            </div>
          </div>
          <button className={styles.saveBtn} onClick={handleAdd}>Save Package</button>
        </div>
      )}

      <div className={styles.packageList}>
        {packages.length === 0 ? (
          <div className={styles.empty}>No packages yet. Add your first package above.</div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className={styles.packageCard}>
              <div className={styles.packageHeader}>
                <h4>{pkg.package_name}</h4>
                <button className={styles.deleteBtn} onClick={() => handleDelete(pkg.id)}>
                  Delete
                </button>
              </div>
              <div className={styles.packageDetails}>
                <div className={styles.detail}>
                  <span>Duration:</span>
                  <strong>{pkg.duration_months} months</strong>
                </div>
                <div className={styles.detail}>
                  <span>Investment Amount:</span>
                  <strong>₦{pkg.investment_amount?.toLocaleString() || pkg.min_investment.toLocaleString()}</strong>
                </div>
                <div className={styles.detail}>
                  <span>ROI:</span>
                  <strong>{pkg.roi_percentage}%</strong>
                </div>
                <div className={styles.detail}>
                  <span>Max Investors:</span>
                  <strong>{pkg.max_investors}</strong>
                </div>
                <div className={styles.detail}>
                  <span>Current Investors:</span>
                  <strong>{pkg.current_investors}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PackageManager;

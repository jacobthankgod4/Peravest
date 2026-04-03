import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import Swal from 'sweetalert2';

interface PropertyPackage {
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
}

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: ''
  });
  
  const [packages, setPackages] = useState<PropertyPackage[]>([
    { shareCost: 0, interestRate: 0, periodMonths: 6, maxInvestors: 100 }
  ]);
  
  const [images, setImages] = useState<File[]>([]);
  
  const addPackage = () => {
    setPackages([...packages, { shareCost: 0, interestRate: 0, periodMonths: 6, maxInvestors: 100 }]);
  };
  
  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };
  
  const updatePackage = (index: number, field: keyof PropertyPackage, value: number) => {
    const updated = packages.map((pkg, i) => 
      i === index ? { ...pkg, [field]: value } : pkg
    );
    setPackages(updated);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const propertyData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        propertyData.append(key, value);
      });
      
      propertyData.append('packages', JSON.stringify(packages));
      
      images.forEach((image) => {
        propertyData.append(`images`, image);
      });
      
      const response = await propertyService.create(propertyData);
      
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Property created successfully'
        });
        navigate('/admin/properties');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create property'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-property-container">
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4>Add New Property</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Property Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Price (₦)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">State</label>
                        <select
                          className="form-select"
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          required
                        >
                          <option value="">Select State</option>
                          <option value="Lagos">Lagos</option>
                          <option value="Abuja">Abuja</option>
                          <option value="Rivers">Rivers</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Area (sqm)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Bedrooms</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Bathrooms</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Property Images</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Investment Packages</h5>
                      <button type="button" className="btn btn-outline-primary" onClick={addPackage}>
                        Add Package
                      </button>
                    </div>
                    {packages.map((pkg, index) => (
                      <div key={index} className="card mb-3">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3">
                              <label className="form-label">Share Cost (₦)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={pkg.shareCost}
                                onChange={(e) => updatePackage(index, 'shareCost', Number(e.target.value))}
                                required
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Interest Rate (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={pkg.interestRate}
                                onChange={(e) => updatePackage(index, 'interestRate', Number(e.target.value))}
                                required
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Period (Months)</label>
                              <select
                                className="form-select"
                                value={pkg.periodMonths}
                                onChange={(e) => updatePackage(index, 'periodMonths', Number(e.target.value))}
                              >
                                <option value={6}>6 Months</option>
                                <option value={12}>12 Months</option>
                                <option value={18}>18 Months</option>
                                <option value={24}>24 Months</option>
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Max Investors</label>
                              <input
                                type="number"
                                className="form-control"
                                value={pkg.maxInvestors}
                                onChange={(e) => updatePackage(index, 'maxInvestors', Number(e.target.value))}
                                required
                              />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                              {packages.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => removePackage(index)}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Property'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/properties')}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
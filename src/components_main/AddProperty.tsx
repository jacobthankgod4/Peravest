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
        propertyData.append('images', image);
      });
      
      const response = await propertyService.create(propertyData);
      
      Swal.fire('Success!', 'Property created successfully', 'success');
      navigate('/admin/properties');
    } catch (error) {
      Swal.fire('Error!', 'Failed to create property', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-4">
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
              <div className="col-md-6">
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
              <div className="col-md-6">
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
              <h5>Investment Packages</h5>
              {packages.map((pkg, index) => (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <label className="form-label">Share Cost (₦)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={pkg.shareCost || ''}
                          onChange={(e) => updatePackage(index, 'shareCost', e.target.value ? Number(e.target.value) : 0)}
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Interest Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          value={pkg.interestRate}
                          onChange={(e) => updatePackage(index, 'interestRate', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Period (Months)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={pkg.periodMonths}
                          onChange={(e) => updatePackage(index, 'periodMonths', Number(e.target.value))}
                          required
                        />
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
                      <div className="col-md-1">
                        <label className="form-label">&nbsp;</label>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm d-block"
                          onClick={() => removePackage(index)}
                          disabled={packages.length === 1}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addPackage}
              >
                Add Package
              </button>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/properties')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;

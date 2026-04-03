import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface InvestmentPackage {
  id?: number;
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
}

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    totalValue: 0,
    description: '',
    images: [] as string[],
    status: 'active'
  });
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`/api/admin/properties/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const property = response.data.property;
      setFormData({
        title: property.title,
        location: property.location,
        totalValue: property.totalValue,
        description: property.description,
        images: property.images,
        status: property.status
      });
      setPackages(property.investmentPackages || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch property');
      navigate('/admin/properties');
    }
  };

  const updatePackage = (index: number, field: keyof InvestmentPackage, value: number) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const addPackage = () => {
    setPackages([...packages, {
      shareCost: 50000,
      interestRate: 15,
      periodMonths: 12,
      maxInvestors: 10
    }]);
  };

  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/admin/properties/${id}`, {
        ...formData,
        investmentPackages: packages
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      navigate('/admin/properties');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3>Edit Property</h3>
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
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Total Value (₦)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.totalValue}
                        onChange={(e) => setFormData({...formData, totalValue: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="sold">Sold</option>
                      </select>
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
                              <option value={24}>24 Months</option>
                              <option value={60}>60 Months</option>
                            </select>
                          </div>
                          <div className="col-md-2">
                            <label className="form-label">Max Investors</label>
                            <input
                              type="number"
                              className="form-control"
                              value={pkg.maxInvestors}
                              onChange={(e) => updatePackage(index, 'maxInvestors', Number(e.target.value))}
                            />
                          </div>
                          <div className="col-md-1 d-flex align-items-end">
                            {packages.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
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
                  
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addPackage}
                  >
                    Add Package
                  </button>
                </div>
                
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Property'}
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
      </div>
    </div>
  );
};

export default EditProperty;
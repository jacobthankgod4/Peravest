import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface InvestmentPackage {
  id?: number;
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
}

interface PropertyData {
  title: string;
  description: string;
  location: string;
  totalValue: number;
  images: string[];
  packages: InvestmentPackage[];
  status: 'active' | 'completed' | 'draft';
}

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState<PropertyData>({
    title: '',
    description: '',
    location: '',
    totalValue: 0,
    images: [''],
    packages: [{
      shareCost: 5000,
      interestRate: 15,
      periodMonths: 12,
      maxInvestors: 100
    }],
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/admin/properties/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProperty(data.property);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(property)
      });

      const data = await response.json();
      if (data.success) {
        navigate('/admin/properties');
      } else {
        alert(data.message || 'Error updating property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error updating property');
    } finally {
      setLoading(false);
    }
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...property.images];
    newImages[index] = value;
    setProperty({ ...property, images: newImages });
  };

  const addImage = () => {
    setProperty({ ...property, images: [...property.images, ''] });
  };

  const removeImage = (index: number) => {
    const newImages = property.images.filter((_, i) => i !== index);
    setProperty({ ...property, images: newImages });
  };

  const updatePackage = (index: number, field: keyof InvestmentPackage, value: number) => {
    const newPackages = [...property.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setProperty({ ...property, packages: newPackages });
  };

  const addPackage = () => {
    setProperty({
      ...property,
      packages: [...property.packages, {
        shareCost: 5000,
        interestRate: 15,
        periodMonths: 12,
        maxInvestors: 100
      }]
    });
  };

  const removePackage = (index: number) => {
    const newPackages = property.packages.filter((_, i) => i !== index);
    setProperty({ ...property, packages: newPackages });
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4>Edit Property</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Property Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={property.title}
                      onChange={(e) => setProperty({ ...property, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={property.location}
                      onChange={(e) => setProperty({ ...property, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Total Value (₦)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={property.totalValue}
                      onChange={(e) => setProperty({ ...property, totalValue: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={property.status}
                      onChange={(e) => setProperty({ ...property, status: e.target.value as 'active' | 'completed' | 'draft' })}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={property.description}
                    onChange={(e) => setProperty({ ...property, description: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <h5>Property Images</h5>
                  {property.images.map((image, index) => (
                    <div key={index} className="row mb-2">
                      <div className="col-md-10">
                        <input
                          type="url"
                          className="form-control"
                          placeholder="Image URL"
                          value={image}
                          onChange={(e) => updateImage(index, e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        {property.images.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeImage(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addImage}
                  >
                    Add Image
                  </button>
                </div>

                <div className="mb-4">
                  <h5>Investment Packages</h5>
                  {property.packages.map((pkg, index) => (
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
                            {property.packages.length > 1 && (
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
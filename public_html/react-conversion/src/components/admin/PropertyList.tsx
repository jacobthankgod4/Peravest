import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface InvestmentPackage {
  id: number;
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
  currentInvestors: number;
}

interface Property {
  id: number;
  title: string;
  location: string;
  totalValue: number;
  description: string;
  images: string[];
  status: string;
  createdAt: string;
  investmentPackages: InvestmentPackage[];
}

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/admin/properties', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProperties(response.data.properties);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await axios.delete(`/api/admin/properties/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProperties(properties.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete property');
    }
  };

  if (loading) return <div className="text-center p-4">Loading properties...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Property Management</h2>
            <Link to="/admin/properties/add" className="btn btn-primary">
              Add New Property
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="text-center p-4">
              <p>No properties found.</p>
              <Link to="/admin/properties/add" className="btn btn-primary">
                Add First Property
              </Link>
            </div>
          ) : (
            <div className="row">
              {properties.map(property => (
                <div key={property.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    {property.images.length > 0 && (
                      <img 
                        src={property.images[0]} 
                        className="card-img-top" 
                        alt={property.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{property.title}</h5>
                      <p className="card-text text-muted">{property.location}</p>
                      <p className="card-text">
                        <strong>Total Value:</strong> ₦{property.totalValue.toLocaleString()}
                      </p>
                      <p className="card-text">
                        <span className={`badge ${property.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                          {property.status}
                        </span>
                      </p>
                      
                      <div className="mb-3">
                        <h6>Investment Packages:</h6>
                        {property.investmentPackages.map(pkg => (
                          <div key={pkg.id} className="small text-muted">
                            ₦{pkg.shareCost.toLocaleString()} - {pkg.interestRate}% ({pkg.periodMonths}m)
                            - {pkg.currentInvestors}/{pkg.maxInvestors} investors
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-auto">
                        <div className="btn-group w-100">
                          <Link 
                            to={`/admin/properties/edit/${property.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => deleteProperty(property.id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyList;
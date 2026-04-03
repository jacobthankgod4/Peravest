import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Property {
  id: number;
  title: string;
  location: string;
  totalValue: number;
  totalInvested: number;
  investorCount: number;
  status: 'active' | 'completed' | 'draft';
  createdAt: string;
}

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/admin/properties', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setProperties(properties.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-success',
      completed: 'bg-primary',
      draft: 'bg-secondary'
    };
    return `badge ${badges[status as keyof typeof badges] || 'bg-secondary'}`;
  };

  if (loading) {
    return <div className="text-center py-4">Loading properties...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Property Management</h2>
            <Link to="/admin/properties/add" className="btn btn-primary">
              Add New Property
            </Link>
          </div>

          <div className="card">
            <div className="card-body">
              {properties.length === 0 ? (
                <div className="text-center py-4">
                  <p>No properties found.</p>
                  <Link to="/admin/properties/add" className="btn btn-primary">
                    Add First Property
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Location</th>
                        <th>Total Value</th>
                        <th>Invested</th>
                        <th>Investors</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property) => (
                        <tr key={property.id}>
                          <td>
                            <strong>{property.title}</strong>
                          </td>
                          <td>{property.location}</td>
                          <td>₦{property.totalValue.toLocaleString()}</td>
                          <td>₦{property.totalInvested.toLocaleString()}</td>
                          <td>{property.investorCount}</td>
                          <td>
                            <span className={getStatusBadge(property.status)}>
                              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </span>
                          </td>
                          <td>{new Date(property.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link 
                                to={`/admin/properties/${property.id}`}
                                className="btn btn-outline-primary"
                              >
                                View
                              </Link>
                              <Link 
                                to={`/admin/properties/${property.id}/edit`}
                                className="btn btn-outline-secondary"
                              >
                                Edit
                              </Link>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => deleteProperty(property.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyList;
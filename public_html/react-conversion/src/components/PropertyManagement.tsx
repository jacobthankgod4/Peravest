import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import Swal from 'sweetalert2';

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  status: string;
  created_at: string;
  images: string[];
}

const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertyService.getAll();
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await propertyService.delete(id);
        setProperties(properties.filter(p => p.id !== id));
        Swal.fire('Deleted!', 'Property has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete property.', 'error');
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await propertyService.updateStatus(id, newStatus);
      setProperties(properties.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
      Swal.fire('Success!', 'Property status updated.', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Failed to update status.', 'error');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="property-management">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Property Management</h2>
          <Link to="/admin/properties/add" className="btn btn-primary">
            Add New Property
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-4">
                <p>No properties found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property) => (
                      <tr key={property.id}>
                        <td>
                          <img
                            src={property.images[0] || '/placeholder.jpg'}
                            alt={property.title}
                            style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </td>
                        <td>
                          <strong>{property.title}</strong>
                        </td>
                        <td>{property.city}, {property.state}</td>
                        <td>₦{property.price.toLocaleString()}</td>
                        <td>
                          <select
                            className={`form-select form-select-sm ${
                              property.status === 'active' ? 'text-success' :
                              property.status === 'pending' ? 'text-warning' :
                              property.status === 'sold' ? 'text-info' : 'text-danger'
                            }`}
                            value={property.status}
                            onChange={(e) => handleStatusChange(property.id, e.target.value)}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td>{new Date(property.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/admin/properties/edit/${property.id}`}
                              className="btn btn-outline-primary"
                            >
                              Edit
                            </Link>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(property.id)}
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
  );
};

export default PropertyManagement;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { propertyAdminService } from '../services/propertyAdminService';
import { useAuth } from '../contexts/AuthContext';
import { PropertyWithInvestment } from '../types/property';
import PropertyActions from './admin/PropertyActions';
import Swal from 'sweetalert2';

const PropertyManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyWithInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertyService.getAll();
      setProperties(response);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (property: PropertyWithInvestment) => {
    try {
      await propertyAdminService.deleteProperty(property.id, user?.email!);
      setProperties(properties.filter(p => p.id !== property.id));
      Swal.fire('Deleted!', 'Property has been deleted.', 'success');
      fetchProperties();
    } catch (error) {
      Swal.fire('Error!', 'Failed to delete property.', 'error');
    }
  };

  const handleTogglePublish = async (property: PropertyWithInvestment) => {
    const newStatus = property.status === 'active' ? 'inactive' : 'active';
    try {
      await propertyAdminService.togglePublish(property.id, newStatus, user?.email!);
      Swal.fire('Success!', `Property ${newStatus === 'active' ? 'published' : 'unpublished'}.`, 'success');
      fetchProperties();
    } catch (error) {
      Swal.fire('Error!', 'Failed to update status.', 'error');
    }
  };

  const handleArchive = async (property: PropertyWithInvestment) => {
    try {
      await propertyAdminService.archiveProperty(property.id, user?.email!);
      Swal.fire('Success!', 'Property archived.', 'success');
      fetchProperties();
    } catch (error) {
      Swal.fire('Error!', 'Failed to archive property.', 'error');
    }
  };

  const handleDuplicate = async (property: PropertyWithInvestment) => {
    try {
      const newProperty = await propertyAdminService.duplicateProperty(property.id, user?.email!);
      Swal.fire('Success!', 'Property duplicated successfully.', 'success');
      fetchProperties();
    } catch (error) {
      Swal.fire('Error!', 'Failed to duplicate property.', 'error');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await propertyAdminService.updateStatus(id, newStatus, user?.email!);
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
                        <td>{property.builtYear || 'N/A'}</td>
                        <td>
                          <PropertyActions
                            property={property}
                            onDelete={() => handleDelete(property)}
                            onTogglePublish={() => handleTogglePublish(property)}
                            onArchive={() => handleArchive(property)}
                            onDuplicate={() => handleDuplicate(property)}
                            onEdit={() => navigate(`/admin/properties/edit/${property.id}`)}
                          />
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
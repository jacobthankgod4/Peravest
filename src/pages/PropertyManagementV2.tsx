import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyServiceV2, Property } from '../services/propertyServiceV2';
import Swal from 'sweetalert2';

const PropertyManagementV2: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyServiceV2.getAll();
      setProperties(data);
    } catch (error) {
      Swal.fire('Error!', 'Failed to load properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Property?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    });

    if (result.isConfirmed) {
      try {
        await propertyServiceV2.delete(id);
        setProperties(properties.filter(p => p.Id !== id));
        Swal.fire('Deleted!', 'Property deleted successfully', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete property', 'error');
      }
    }
  };

  const filteredProperties = properties.filter(p =>
    p.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.City.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Property Management</h2>
        <Link to="/admin/properties/add-v2" className="btn btn-primary">
          Add New Property
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            className="form-control"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                    <th>Title</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Beds/Baths</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.Id}>
                      <td>
                        <strong>{property.Title}</strong>
                      </td>
                      <td>
                        {property.City}, {property.State}
                      </td>
                      <td>₦{property.Price.toLocaleString()}</td>
                      <td>
                        {property.Bedroom}/{property.Bathroom}
                      </td>
                      <td>
                        <span className={`badge bg-${property.Status === 'active' ? 'success' : 'danger'}`}>
                          {property.Status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => navigate(`/admin/properties/edit-v2/${property.Id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(property.Id!)}
                        >
                          Delete
                        </button>
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
  );
};

export default PropertyManagementV2;

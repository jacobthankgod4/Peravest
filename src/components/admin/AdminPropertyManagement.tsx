import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardService } from '../../services/adminDashboardService';
import { propertyService } from '../../services/propertyService';
import Swal from 'sweetalert2';

interface Property {
  Id: number;
  Title: string;
  Type: string;
  Status: string;
  Address: string;
  City: string;
  State: string;
  Price: number;
  Images: string;
  created_at: string;
  Asset_Type?: string;
}

const AdminPropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await adminDashboardService.getPropertiesList();
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Delete Property?',
      text: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setDeleting(id);
      try {
        await propertyService.delete(id);
        setProperties(properties.filter(p => p.Id !== id));
        Swal.fire('Deleted!', 'Property has been deleted.', 'success');
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire('Error!', 'Failed to delete property.', 'error');
      } finally {
        setDeleting(null);
      }
    }
  };

  const filteredProperties = properties.filter(prop =>
    prop.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.Address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading properties...</div>;
  }

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>Investment Management</h2>
            <p style={{ color: '#757f95', margin: '0.5rem 0 0 0' }}>
              {properties.filter(p => p.Asset_Type === 'Real Estate').length} Real Estate • {properties.filter(p => p.Asset_Type === 'Agriculture').length} Agriculture
            </p>
          </div>
          <Link to="/admin/properties/add" className="theme-btn">
            <i className="fas fa-plus"></i> Add Investment
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        {/* Properties Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredProperties.map(property => {
            const imageUrl = property.Images || '';

            return (
              <div
                key={property.Id}
                style={{
                  background: '#fff',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={property.Title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('[AdminPropertyManagement] Image failed to load:', imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{property.Title}</h4>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: property.Asset_Type === 'Agriculture' ? '#2d5016' : '#0e2e50',
                        color: '#fff'
                      }}>
                        {property.Asset_Type || 'Real Estate'}
                      </span>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: property.Status === 'active' ? '#28a745' : '#6c757d',
                      color: '#fff'
                    }}>
                      {property.Status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '1rem' }}>
                    <div><i className="fas fa-map-marker-alt"></i> {property.Address}</div>
                    <div><i className="fas fa-city"></i> {property.City}, {property.State}</div>
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#09c398', marginBottom: '1rem' }}>
                    ₦{property.Price?.toLocaleString()}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/admin/properties/edit/${property.Id}`}
                      className="theme-btn"
                      style={{ flex: 1, textAlign: 'center', padding: '0.5rem' }}
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/listings/${property.Id}`}
                      className="theme-btn"
                      style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#0d6efd' }}
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(property.Id, property.Title)}
                      disabled={deleting === property.Id}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: deleting === property.Id ? 'not-allowed' : 'pointer',
                        opacity: deleting === property.Id ? 0.6 : 1
                      }}
                    >
                      {deleting === property.Id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProperties.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '15px' }}>
            <i className="fas fa-building" style={{ fontSize: '3rem', color: '#09c398', marginBottom: '1rem' }}></i>
            <p>{searchTerm ? 'No properties match your search' : 'No properties found'}</p>
          </div>
        )}
    </div>
  );
};

export default AdminPropertyManagement;

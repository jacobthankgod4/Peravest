import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyServiceV2, Property } from '../services/propertyServiceV2';
import Swal from 'sweetalert2';
import AmenityIconLibrary from '../components/AmenityIconLibrary';

const EditPropertyV2: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amenities, setAmenities] = useState<Array<{ name: string; icon: string }>>([]);
  const [formData, setFormData] = useState<Partial<Property>>({});

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const data = await propertyServiceV2.getById(parseInt(id!));
      setFormData(data);
      
      if (data.Ammenities) {
        const parsedAmenities = data.Ammenities.split(',').map(a => {
          const [name, icon] = a.includes(':') ? a.split(':') : [a, 'fa-check-circle'];
          return { name: name.trim(), icon: icon.trim() };
        });
        setAmenities(parsedAmenities);
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to load property', 'error');
      navigate('/admin/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Price' || name === 'Bedroom' || name === 'Bathroom' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const amenitiesString = amenities.map(a => `${a.name}:${a.icon}`).join(',');
      const propertyData = { ...formData, Ammenities: amenitiesString };
      
      await propertyServiceV2.update(parseInt(id!), propertyData);
      Swal.fire('Success!', 'Property updated successfully', 'success');
      navigate('/admin/properties');
    } catch (error) {
      Swal.fire('Error!', error instanceof Error ? error.message : 'Failed to update property', 'error');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="card">
        <div className="card-header">
          <h4>Edit Property</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Title"
                    value={formData.Title || ''}
                    onChange={handleInputChange}
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
                    name="Price"
                    value={formData.Price || 0}
                    onChange={handleInputChange}
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
                name="Address"
                value={formData.Address || ''}
                onChange={handleInputChange}
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
                    name="City"
                    value={formData.City || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">State</label>
                  <select
                    className="form-select"
                    name="State"
                    value={formData.State || ''}
                    onChange={handleInputChange}
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

            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Bedrooms</label>
                  <input
                    type="number"
                    className="form-control"
                    name="Bedroom"
                    value={formData.Bedroom || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Bathrooms</label>
                  <input
                    type="number"
                    className="form-control"
                    name="Bathroom"
                    value={formData.Bathroom || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Area</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Area"
                    value={formData.Area || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="Description"
                rows={4}
                value={formData.Description || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <AmenityIconLibrary
                selectedAmenities={amenities}
                onAmenitiesChange={setAmenities}
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/properties')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyV2;

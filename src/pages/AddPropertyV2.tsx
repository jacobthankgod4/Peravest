import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyServiceV2, Property } from '../services/propertyServiceV2';
import Swal from 'sweetalert2';
import AmenityIconLibrary from '../components/AmenityIconLibrary';

const AddPropertyV2: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [amenities, setAmenities] = useState<Array<{ name: string; icon: string }>>([]);
  const [formData, setFormData] = useState<Partial<Property>>({
    Title: '',
    Address: '',
    City: '',
    State: '',
    Price: 0,
    Area: '',
    Bedroom: 0,
    Bathroom: 0,
    Description: '',
    Type: 'Residential',
    Zip_Code: '',
    Video: '',
    Ammenities: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Price' || name === 'Bedroom' || name === 'Bathroom' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.Title || !formData.Address || !formData.City || !formData.State) {
        throw new Error('Please fill in all required fields');
      }

      const amenitiesString = amenities.map(a => `${a.name}:${a.icon}`).join(',');
      const propertyData = { ...formData, Ammenities: amenitiesString };

      await propertyServiceV2.create(propertyData, imageFile || undefined);
      
      Swal.fire('Success!', 'Property created successfully', 'success');
      navigate('/admin/properties');
    } catch (error) {
      Swal.fire('Error!', error instanceof Error ? error.message : 'Failed to create property', 'error');
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
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Title"
                    value={formData.Title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Price (₦) *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="Price"
                    value={formData.Price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Address *</label>
              <input
                type="text"
                className="form-control"
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="City"
                    value={formData.City}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">State *</label>
                  <select
                    className="form-select"
                    name="State"
                    value={formData.State}
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
                    value={formData.Bedroom}
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
                    value={formData.Bathroom}
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
                    value={formData.Area}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                name="Description"
                rows={4}
                value={formData.Description}
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

            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imageFile && <small className="text-success">✓ {imageFile.name}</small>}
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Property'}
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

export default AddPropertyV2;

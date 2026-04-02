import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

interface PropertyPackage {
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
}

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    status: 'active',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    builtYear: '',
    amenities: '',
    description: '',
    video: ''
  });
  
  const [packages, setPackages] = useState<PropertyPackage[]>([
    { shareCost: '', interestRate: '', periodMonths: 6, maxInvestors: '' } as any
  ]);
  
  const [images, setImages] = useState<File[]>([]);
  
  const addPackage = () => {
    setPackages([...packages, { shareCost: '', interestRate: '', periodMonths: 6, maxInvestors: '' } as any]);
  };
  
  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };
  
  const updatePackage = (index: number, field: keyof PropertyPackage, value: any) => {
    const updated = packages.map((pkg, i) => 
      i === index ? { ...pkg, [field]: value } : pkg
    );
    setPackages(updated);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.address || !formData.city || !formData.state || !formData.price) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please fill in all required fields'
        });
        setLoading(false);
        return;
      }

      let imageUrls: string[] = [];
      
      // Upload images
      if (images.length > 0) {
        for (const image of images) {
          const fileName = `${Date.now()}-${image.name}`;
          const { data, error } = await supabase.storage
            .from('property-images')
            .upload(`properties/${fileName}`, image);
          
          if (error) throw error;
          
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(`properties/${fileName}`);
          
          imageUrls.push(urlData.publicUrl);
        }
      }
      
      const propertyData = {
        title: formData.title.trim(),
        type: formData.type || 'Residential',
        status: formData.status || 'active',
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        price: Number(formData.price),
        area: formData.area.trim(),
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        builtYear: formData.builtYear ? Number(formData.builtYear) : new Date().getFullYear(),
        amenities: formData.amenities.trim(),
        description: formData.description.trim(),
        video: formData.video.trim(),
        images: imageUrls,
        packages: packages
      };
      
      console.log('Submitting property data:', propertyData);
      await propertyService.create(propertyData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Property created successfully'
      });
      navigate('/admin/properties');
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to create property'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-property-container">
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4>Add New Property</h4>
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
                        <label className="form-label">Price (₦)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Property Type</label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          required
                        >
                          <option value="">Select Type</option>
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Mixed-Use">Mixed-Use</option>
                        </select>
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
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">State</label>
                        <select
                          className="form-select"
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          required
                        >
                          <option value="">Select State</option>
                          <option value="Lagos">Lagos</option>
                          <option value="Abuja">Abuja</option>
                          <option value="Rivers">Rivers</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Zip Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Area (sqm)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Bedrooms</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Bathrooms</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Built Year</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.builtYear}
                          onChange={(e) => setFormData({...formData, builtYear: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Amenities</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.amenities}
                      onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                      placeholder="e.g., Swimming pool, Gym, Security, Parking"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Video URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.video}
                      onChange={(e) => setFormData({...formData, video: e.target.value})}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Property Images</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Investment Packages</h5>
                      <button type="button" className="btn btn-outline-primary" onClick={addPackage}>
                        Add Package
                      </button>
                    </div>
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
                                onChange={(e) => updatePackage(index, 'shareCost', e.target.value)}
                                min="0"
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
                                onChange={(e) => updatePackage(index, 'interestRate', e.target.value)}
                                min="0"
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
                                <option value={18}>18 Months</option>
                                <option value={24}>24 Months</option>
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Max Investors</label>
                              <input
                                type="number"
                                className="form-control"
                                value={pkg.maxInvestors}
                                onChange={(e) => updatePackage(index, 'maxInvestors', e.target.value)}
                                min="0"
                                required
                              />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                              {packages.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
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
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
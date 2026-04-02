import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService, Property } from '../services/propertyService';
import { createDefaultPackages } from '../utils/defaultPackages';
import PackageManager from '../components/PackageManager';
import Swal from 'sweetalert2';
import AmenityIconLibrary from '../components/AmenityIconLibrary';
import { NIGERIAN_STATES } from '../data/nigerianStatesLGAs';
import InvestmentTypeSelector from '../components/InvestmentTypeSelector';
import AgricultureFields from '../components/AgricultureFields';

interface InvestmentPackage {
  share_cost: number;
  interest_rate: number;
  period_months: number;
  max_investors: number;
}

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [amenities, setAmenities] = useState<Array<{ name: string; icon: string }>>([]);
  
  const [formData, setFormData] = useState<Partial<Property>>({
    Title: '',
    Type: 'Residential',
    Address: '',
    City: '',
    State: '',
    LGA: '',
    Zip_Code: '',
    Price: 0,
    Area: 0,
    Bedroom: 0,
    Bathroom: 0,
    Built_Year: new Date().getFullYear(),
    Description: '',
    Amenities: '',
    Video: '',
    Asset_Type: 'Real Estate'
  });

  const [investmentPackage, setInvestmentPackage] = useState<InvestmentPackage>({
    share_cost: 0,
    interest_rate: 0,
    period_months: 6,
    max_investors: 100
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'State') {
      setFormData(prev => ({ ...prev, State: value, LGA: '' }));
    } else if (name === 'Price' || name === 'Bedroom' || name === 'Bathroom' || name === 'Built_Year') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvestmentPackage(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles([...imageFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFiles([...videoFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const images = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      setImageFiles([...imageFiles, ...images]);
    }
  };

  const handleVideoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);
    if (e.dataTransfer.files) {
      const videos = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
      setVideoFiles([...videoFiles, ...videos]);
    }
  };

  const removeImage = (idx: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== idx));
  };

  const removeVideo = (idx: number) => {
    setVideoFiles(videoFiles.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setFormData({
      Title: '',
      Type: 'Residential',
      Address: '',
      City: '',
      State: '',
      Zip_Code: '',
      Price: 0,
      Area: 0,
      Bedroom: 0,
      Bathroom: 0,
      Built_Year: new Date().getFullYear(),
      Description: '',
      Amenities: '',
      Video: ''
    });
    setImageFiles([]);
    setVideoFiles([]);
    setAmenities([]);
    setInvestmentPackage({ share_cost: 0, interest_rate: 0, period_months: 6, max_investors: 100 });
  };

  const handleSubmit = async (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.Title || !formData.Address || !formData.City || !formData.State) {
        throw new Error('Please fill in all required fields');
      }
      if (imageFiles.length === 0) {
        throw new Error('Please add at least one image');
      }

      const submitData = { 
        ...formData, 
        Amenities: formData.Asset_Type === 'Real Estate' ? amenities.map(a => `${a.name}:${a.icon}`).join(',') : ''
      };
      const result = await propertyService.create(submitData, imageFiles);
      const propertyId = (result as any).id;
      
      // Auto-create default packages
      await createDefaultPackages(propertyId);
      
      setCreatedPropertyId(propertyId);
      
      Swal.fire('Success!', 'Property created with 10 default investment packages.', 'success');
      if (addAnother) resetForm();
      else navigate('/admin/properties');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create property';
      Swal.fire('Error!', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header">
          <h4>Add New Investment</h4>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            
            {/* Investment Type Selector */}
            <InvestmentTypeSelector
              selectedType={formData.Asset_Type || 'Real Estate'}
              onTypeChange={(type) => setFormData(prev => ({ ...prev, Asset_Type: type }))}
            />

            <h5 className="mb-3">Basic Information</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Title *</label>
                  <input type="text" className="form-control" name="Title" value={formData.Title || ''} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select className="form-select" name="Type" value={formData.Type || 'Residential'} onChange={handleInputChange}>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Address *</label>
              <input type="text" className="form-control" name="Address" value={formData.Address || ''} onChange={handleInputChange} required />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-control" name="City" value={formData.City || ''} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">State *</label>
                  <select className="form-select" name="State" value={formData.State || ''} onChange={handleInputChange} required>
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map(state => (
                      <option key={state.name} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">LGA *</label>
                  <select className="form-select" name="LGA" value={formData.LGA || ''} onChange={handleInputChange} required disabled={!formData.State}>
                    <option value="">Select LGA</option>
                    {formData.State && NIGERIAN_STATES.find(s => s.name === formData.State)?.lgas.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Zip Code</label>
                  <input type="text" className="form-control" name="Zip_Code" value={formData.Zip_Code || ''} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Total Investment Value (₦) *</label>
              <input type="number" className="form-control" name="Price" value={formData.Price || 0} onChange={handleInputChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea className="form-control" name="Description" rows={4} value={formData.Description || ''} onChange={handleInputChange} required />
            </div>

            {/* Conditional Fields Based on Asset Type */}
            {formData.Asset_Type === 'Real Estate' && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                <h5 style={{ marginBottom: '1.5rem', color: '#0e2e50' }}>🏠 Property Details</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Property Type</label>
                      <select className="form-select" name="Type" value={formData.Type || 'Residential'} onChange={handleInputChange}>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Area (Sq Ft)</label>
                      <input type="number" className="form-control" name="Area" value={formData.Area || ''} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Bedrooms</label>
                      <input type="number" className="form-control" name="Bedroom" value={formData.Bedroom || 0} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Bathrooms</label>
                      <input type="number" className="form-control" name="Bathroom" value={formData.Bathroom || 0} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Built Year</label>
                      <input type="number" className="form-control" name="Built_Year" value={formData.Built_Year || new Date().getFullYear()} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <AmenityIconLibrary
                    selectedAmenities={amenities}
                    onAmenitiesChange={setAmenities}
                  />
                </div>
              </div>
            )}

            {formData.Asset_Type === 'Agriculture' && (
              <AgricultureFields formData={formData} onChange={handleInputChange} />
            )}

            <div className="mb-3">
              <label className="form-label">Images</label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? '2px solid #09c398' : '2px dashed #ccc',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: dragActive ? 'rgba(9, 195, 152, 0.1)' : 'transparent',
                  transition: 'all 0.3s'
                }}
              >
                <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="imageInput" multiple />
                <label htmlFor="imageInput" style={{ cursor: 'pointer', margin: 0 }}>
                  <p style={{ margin: '10px 0' }}>Drag and drop images here or click to select (multiple)</p>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '10px' }}>
                {imageFiles.map((file, idx) => (
                  <div key={idx} style={{ position: 'relative', textAlign: 'center' }}>
                    <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }} />
                    <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Videos</label>
              <div
                onDragEnter={handleVideoDrag}
                onDragLeave={handleVideoDrag}
                onDragOver={handleVideoDrag}
                onDrop={handleVideoDrop}
                style={{
                  border: videoDragActive ? '2px solid #09c398' : '2px dashed #ccc',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: videoDragActive ? 'rgba(9, 195, 152, 0.1)' : 'transparent',
                  transition: 'all 0.3s'
                }}
              >
                <input type="file" className="form-control" accept="video/*" onChange={handleVideoChange} style={{ display: 'none' }} id="videoInput" multiple />
                <label htmlFor="videoInput" style={{ cursor: 'pointer', margin: 0 }}>
                  <p style={{ margin: '10px 0' }}>Drag and drop videos here or click to select (multiple)</p>
                </label>
              </div>
              <div style={{ marginTop: '10px' }}>
                {videoFiles.map((file, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '8px' }}>
                    <span>🎥 {file.name}</span>
                    <button type="button" onClick={() => removeVideo(idx)} className="btn btn-sm btn-danger">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <hr />
            <h5 className="mb-3">Investment Packages</h5>
            <p className="text-muted">Create the property first, then add investment packages below.</p>

            {createdPropertyId && (
              <PackageManager 
                propertyId={createdPropertyId}
                onUpdate={() => console.log('Packages updated')}
              />
            )}

            {!createdPropertyId && (
              <div className="alert alert-info">
                Save the property first to add investment packages.
              </div>
            )}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Property'}
              </button>
              <button type="button" className="btn btn-success" onClick={(e) => handleSubmit(e, true)} disabled={loading}>
                {loading ? 'Creating...' : 'Create & Add Another'}
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

export default AddProperty;

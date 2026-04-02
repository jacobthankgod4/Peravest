import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService, Property } from '../services/propertyService';
import PackageManager from '../components/PackageManager';
import Swal from 'sweetalert2';
import AmenityIconLibrary from '../components/AmenityIconLibrary';
import PropertyDocuments from '../components/PropertyDocuments';
import { supabase } from '../lib/supabase';
import { NIGERIAN_STATES } from '../data/nigerianStatesLGAs';

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    Images: '',
    Status: 'active'
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [amenities, setAmenities] = useState<Array<{ name: string; icon: string }>>([]);
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [investmentPackage, setInvestmentPackage] = useState({ Share_Cost: 0, Interest_Rate: 25, Period_Months: 6, Max_Investors: 100 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const property = await propertyService.getPropertyById(id!);
      setFormData({
        Title: property.title,
        Type: property.type,
        Address: property.address,
        City: property.city,
        State: property.state,
        Zip_Code: property.zipCode,
        Price: property.price,
        Area: property.area,
        Bedroom: property.bedroom,
        Bathroom: property.bathroom,
        Built_Year: parseInt(property.builtYear || '0'),
        Description: property.description,
        Amenities: property.amenities,
        Video: property.video,
        Images: property.images?.[0] || '',
        Status: property.status
      });
      setCurrentImages(property.images || []);
      
      if (property.amenities) {
        const parsedAmenities = property.amenities.split(',').map(a => {
          const trimmed = a.trim();
          const [name, icon] = trimmed.includes(':') ? trimmed.split(':') : [trimmed, 'fa-check-circle'];
          return { name: name.trim(), icon: icon.trim() };
        });
        setAmenities(parsedAmenities);
      }

      const { data: pkgData } = await supabase.from('investment_package').select('*').eq('Property_Id', id).limit(1);
      if (pkgData && pkgData.length > 0) {
        setInvestmentPackage({
          Share_Cost: Number(pkgData[0].Share_Cost) || 0,
          Interest_Rate: Number(pkgData[0].Interest_Rate) || 25,
          Period_Months: Number(pkgData[0].Period_Months) || 6,
          Max_Investors: Number(pkgData[0].Max_Investors) || 100
        });
      }

      const { data: docsData } = await supabase.from('property_documents').select('*').eq('Property_Id', id).order('Display_Order');
      if (docsData) setDocuments(docsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'State') {
      setFormData(prev => ({ ...prev, State: value, LGA: '' }));
    } else if (name === 'Price' || name === 'Bedroom' || name === 'Bathroom' || name === 'Built_Year') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name === 'Area') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const removeCurrentImage = (idx: number) => {
    setCurrentImages(currentImages.filter((_, i) => i !== idx));
  };

  const removeVideo = (idx: number) => {
    setVideoFiles(videoFiles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.Title || !formData.Address || !formData.City || !formData.State) {
        throw new Error('Please fill in all required fields');
      }

      const submitData = { ...formData, Amenities: amenities.map(a => `${a.name}:${a.icon}`).join(',') };
      await propertyService.update(id!, submitData, imageFiles);

      await supabase.from('investment_package').upsert({
        Property_Id: parseInt(id!),
        Share_Cost: investmentPackage.Share_Cost,
        Interest_Rate: investmentPackage.Interest_Rate,
        Period_Months: investmentPackage.Period_Months,
        Max_Investors: investmentPackage.Max_Investors,
        updated_at: new Date().toISOString()
      }, { onConflict: 'Property_Id' });

      await supabase.from('property_documents').delete().eq('Property_Id', parseInt(id!));
      if (documents.length > 0) {
        const docsToInsert = documents.map((doc, idx) => ({
          Property_Id: parseInt(id!),
          Document_Name: doc.Document_Name,
          Document_Type: doc.Document_Type,
          Document_Url: doc.Document_Url,
          File_Size: doc.File_Size,
          Display_Order: idx
        }));
        await supabase.from('property_documents').insert(docsToInsert);
      }

      Swal.fire('Success!', 'Property updated successfully', 'success');
      navigate('/admin/properties');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update property';
      setError(message);
      Swal.fire('Error!', message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading property...</div>;

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header">
          <h4>Edit Property</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <h5 className="mb-3">Property Details</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Title *</label>
                  <input type="text" className="form-control" name="Title" value={formData.Title || ''} onChange={handleChange} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select className="form-select" name="Type" value={formData.Type || 'Residential'} onChange={handleChange}>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Address *</label>
              <input type="text" className="form-control" name="Address" value={formData.Address || ''} onChange={handleChange} required />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-control" name="City" value={formData.City || ''} onChange={handleChange} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">State *</label>
                  <select className="form-select" name="State" value={formData.State || ''} onChange={handleChange} required>
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
                  <select className="form-select" name="LGA" value={formData.LGA || ''} onChange={handleChange} required disabled={!formData.State}>
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
                  <input type="text" className="form-control" name="Zip_Code" value={formData.Zip_Code || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Zip Code</label>
                  <input type="text" className="form-control" name="Zip_Code" value={formData.Zip_Code || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Price (₦) *</label>
                  <input type="number" className="form-control" name="Price" value={formData.Price || 0} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Bedrooms</label>
                  <input type="number" className="form-control" name="Bedroom" value={formData.Bedroom || 0} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Bathrooms</label>
                  <input type="number" className="form-control" name="Bathroom" value={formData.Bathroom || 0} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Area (Sq Ft)</label>
                  <input type="number" className="form-control" name="Area" value={formData.Area || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Built Year</label>
                  <input type="number" className="form-control" name="Built_Year" value={formData.Built_Year || new Date().getFullYear()} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea className="form-control" name="Description" rows={4} value={formData.Description || ''} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <AmenityIconLibrary
                selectedAmenities={amenities}
                onAmenitiesChange={setAmenities}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Video Embed Code</label>
              <textarea
                className="form-control"
                name="Video"
                rows={4}
                value={formData.Video || ''}
                onChange={handleChange}
                placeholder="Paste the embed code from YouTube, Vimeo, Instagram, or TikTok (e.g., <iframe src=...>)"
              />
              <small className="text-muted">Paste the complete embed code (iframe) from the video platform</small>
            </div>

            <div className="mb-3">
              <PropertyDocuments
                propertyId={parseInt(id!)}
                documents={documents}
                onDocumentsChange={setDocuments}
                isEditing={true}
              />
            </div>

            <hr />
            <h5 className="mb-3">Investment Packages</h5>
            
            <PackageManager 
              propertyId={parseInt(id!)}
              onUpdate={() => console.log('Packages updated')}
            />

            <div className="mb-3">
              <label className="form-label">Images</label>
              {currentImages.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '8px' }}>Current images:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {currentImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', textAlign: 'center' }}>
                        <img src={img} alt={`current-${idx}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <button type="button" onClick={() => removeCurrentImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Update Property'}
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

export default EditProperty;

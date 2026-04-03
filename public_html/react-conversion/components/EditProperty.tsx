import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService } from '../services/propertyService';

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    roi: '',
    duration: '',
    description: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      propertyService.getPropertyById(id).then(data => setFormData(data));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await propertyService.updateProperty(id!, formData);
      alert('Property updated successfully');
      navigate('/admin/properties');
    } catch (error) {
      alert('Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="edit-property">
      <h1>Edit Property</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} required />
        <input name="location" value={formData.location} onChange={handleChange} required />
        <input name="price" type="number" value={formData.price} onChange={handleChange} required />
        <input name="roi" type="number" value={formData.roi} onChange={handleChange} required />
        <input name="duration" value={formData.duration} onChange={handleChange} required />
        <textarea name="description" value={formData.description} onChange={handleChange} required />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold">Sold</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Property'}
        </button>
      </form>
    </div>
  );
};

export default EditProperty;

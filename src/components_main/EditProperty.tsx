import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService } from '../services/propertyService';

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    price: '',
    area: '',
    bedroom: '',
    bathroom: '',
    description: '',
    status: 'active',
    type: 'apartment',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      propertyService.getPropertyById(id).then(data => {
        setFormData({
          title: data.title,
          address: data.address,
          city: data.city,
          state: data.state,
          price: data.price.toString(),
          area: data.area.toString(),
          bedroom: data.bedroom.toString(),
          bathroom: data.bathroom.toString(),
          description: data.description || '',
          status: data.status,
          type: data.type,
          zipCode: data.zipCode
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await propertyService.update(id!, formData);
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
        <input name="title" placeholder="Property Title" value={formData.title} onChange={handleChange} required />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <input name="area" type="number" placeholder="Area (sq ft)" value={formData.area} onChange={handleChange} required />
        <input name="bedroom" type="number" placeholder="Bedrooms" value={formData.bedroom} onChange={handleChange} required />
        <input name="bathroom" type="number" placeholder="Bathrooms" value={formData.bathroom} onChange={handleChange} required />
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

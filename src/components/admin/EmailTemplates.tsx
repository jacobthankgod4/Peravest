import React, { useState, useEffect } from 'react';
import { communicationAdminService } from '../../services/communicationAdminService';
import Swal from 'sweetalert2';

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', subject: '', body: '', type: 'email' });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await communicationAdminService.getNotificationTemplates();
      setTemplates(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load templates', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      Swal.fire('Warning', 'Please fill all fields', 'warning');
      return;
    }

    try {
      if (editingTemplate) {
        await communicationAdminService.updateTemplate(editingTemplate.id, formData);
        Swal.fire('Success!', 'Template updated', 'success');
      } else {
        await communicationAdminService.createTemplate(formData);
        Swal.fire('Success!', 'Template created', 'success');
      }
      setFormData({ name: '', subject: '', body: '', type: 'email' });
      setEditingTemplate(null);
      setShowForm(false);
      loadTemplates();
    } catch (error) {
      Swal.fire('Error', 'Failed to save template', 'error');
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({ name: template.name, subject: template.subject, body: template.body, type: template.type });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete template?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      try {
        await communicationAdminService.deleteTemplate(id);
        Swal.fire('Deleted!', 'Template deleted', 'success');
        loadTemplates();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete template', 'error');
      }
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Email Templates</h2>
        <button className="theme-btn" onClick={() => { setShowForm(!showForm); setEditingTemplate(null); setFormData({ name: '', subject: '', body: '', type: 'email' }); }}>
          {showForm ? 'Cancel' : '+ New Template'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <h5 style={{ marginBottom: '1rem' }}>{editingTemplate ? 'Edit Template' : 'Create Template'}</h5>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Template Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Welcome Email"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Subject</label>
            <input
              type="text"
              className="form-control"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Body</label>
            <textarea
              className="form-control"
              rows={8}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Email body (supports variables: {{name}}, {{email}}, {{amount}})"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Type</label>
            <select className="form-control" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option value="email">Email</option>
              <option value="notification">Notification</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <button className="theme-btn" onClick={handleSave}>
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {templates.map(template => (
          <div key={template.id} style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h5>{template.name}</h5>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', background: '#09c398', color: '#fff' }}>
                {template.type}
              </span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.25rem' }}>Subject:</div>
              <div style={{ fontWeight: 600 }}>{template.subject}</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.25rem' }}>Body:</div>
              <div style={{ fontSize: '0.875rem', maxHeight: '100px', overflow: 'auto' }}>{template.body}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="theme-btn" onClick={() => handleEdit(template)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Edit
              </button>
              <button className="theme-btn" onClick={() => handleDelete(template.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#dc3545' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#757f95' }}>
          <p>No templates yet. Create your first template!</p>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface PropertyDocument {
  Id?: number;
  Document_Name: string;
  Document_Type: string;
  Document_Url: string;
  File_Size?: number;
}

interface PropertyDocumentsProps {
  propertyId: number;
  documents: PropertyDocument[];
  onDocumentsChange: (docs: PropertyDocument[]) => void;
  isEditing?: boolean;
}

const DOCUMENT_TYPES = [
  'Floor Plan',
  'Title Deed',
  'Valuation Report',
  'Survey Plan',
  'Building Permit',
  'Investment Prospectus',
  'Other'
];

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ 
  propertyId, 
  documents, 
  onDocumentsChange,
  isEditing = false 
}) => {
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async (file: File, docType: string) => {
    try {
      setUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('property-documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('property-documents')
        .getPublicUrl(data.path);

      const newDoc: PropertyDocument = {
        Document_Name: file.name,
        Document_Type: docType,
        Document_Url: urlData.publicUrl,
        File_Size: file.size
      };

      onDocumentsChange([...documents, newDoc]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (e.target.files && e.target.files[0]) {
      await uploadDocument(e.target.files[0], docType);
    }
  };

  const removeDocument = (index: number) => {
    onDocumentsChange(documents.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label className="form-label">Property Documents</label>
      
      {/* Existing Documents */}
      {documents.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {documents.map((doc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0e2e50' }}>
                  <i className="fas fa-file-pdf" style={{ marginRight: '8px', color: '#dc3545' }}></i>
                  {doc.Document_Name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                  <span style={{ 
                    background: '#0e2e50', 
                    color: '#fff', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginRight: '8px'
                  }}>
                    {doc.Document_Type}
                  </span>
                  {formatFileSize(doc.File_Size)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={doc.Document_Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="fas fa-download"></i>
                </a>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeDocument(idx)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Section */}
      {isEditing && (
        <div style={{ 
          border: '2px dashed #dee2e6', 
          borderRadius: '8px', 
          padding: '1.5rem',
          background: '#f8f9fa'
        }}>
          <h6 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#0e2e50' }}>
            Add Documents
          </h6>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {DOCUMENT_TYPES.map((type) => (
              <div key={type}>
                <input
                  type="file"
                  id={`doc-${type}`}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, type)}
                  disabled={uploading}
                />
                <label
                  htmlFor={`doc-${type}`}
                  style={{
                    display: 'block',
                    padding: '10px',
                    background: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading) {
                      e.currentTarget.style.background = '#0e2e50';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#000';
                  }}
                >
                  <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>
                  {type}
                </label>
              </div>
            ))}
          </div>
          <small className="text-muted d-block mt-2">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
          </small>
        </div>
      )}

      {uploading && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#0e2e50' }}>
          <i className="fas fa-spinner fa-spin"></i> Uploading...
        </div>
      )}
    </div>
  );
};

export default PropertyDocuments;

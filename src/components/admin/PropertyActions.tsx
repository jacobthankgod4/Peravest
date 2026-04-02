import React from 'react';
import Swal from 'sweetalert2';

interface PropertyActionsProps {
  property: any;
  onDelete: () => void;
  onTogglePublish: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
}

const PropertyActions: React.FC<PropertyActionsProps> = ({
  property,
  onDelete,
  onTogglePublish,
  onArchive,
  onDuplicate,
  onEdit
}) => {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Property?',
      text: `Are you sure you want to delete "${property.Title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      onDelete();
    }
  };

  const handleArchive = async () => {
    const result = await Swal.fire({
      title: 'Archive Property?',
      text: `Archive "${property.Title}"? It will be hidden from listings.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, archive',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      onArchive();
    }
  };

  const isActive = property.Status === 'active';
  const isArchived = property.Status === 'archived';

  return (
    <div className="btn-group btn-group-sm">
      <button
        className="btn btn-outline-primary"
        onClick={onEdit}
        title="Edit Property"
      >
        <i className="fas fa-edit"></i>
      </button>

      {!isArchived && (
        <button
          className={`btn ${isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
          onClick={onTogglePublish}
          title={isActive ? 'Unpublish' : 'Publish'}
        >
          <i className={`fas ${isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      )}

      <button
        className="btn btn-outline-info"
        onClick={onDuplicate}
        title="Duplicate Property"
      >
        <i className="fas fa-copy"></i>
      </button>

      {!isArchived && (
        <button
          className="btn btn-outline-secondary"
          onClick={handleArchive}
          title="Archive Property"
        >
          <i className="fas fa-archive"></i>
        </button>
      )}

      <button
        className="btn btn-outline-danger"
        onClick={handleDelete}
        title="Delete Property"
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default PropertyActions;

import React, { useState } from 'react';

interface DeletePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  property: any;
}

const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  property
}) => {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    setReason('');
    setConfirmText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Property</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle"></i>
            <strong> Warning:</strong> This action cannot be undone!
          </div>

          <div className="property-info mb-3">
            <p><strong>Property:</strong> {property?.Title}</p>
            <p><strong>Location:</strong> {property?.City}, {property?.State}</p>
            <p><strong>Price:</strong> ₦{property?.Price?.toLocaleString()}</p>
          </div>

          <div className="form-group mb-3">
            <label>Reason for Deletion (Optional)</label>
            <textarea
              className="form-control"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this property being deleted?"
            />
          </div>

          <div className="form-group">
            <label>Type <strong>DELETE</strong> to confirm *</label>
            <input
              type="text"
              className="form-control"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              required
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={loading || confirmText !== 'DELETE'}
          >
            {loading ? 'Deleting...' : 'Delete Property'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePropertyModal;

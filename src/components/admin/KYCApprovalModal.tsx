import React, { useState } from 'react';

interface KYCApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  type: 'reject' | 'request_more';
  document: any;
}

const KYCApprovalModal: React.FC<KYCApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  document
}) => {
  const [reason, setReason] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    'Valid ID Card',
    'Proof of Address (Utility Bill)',
    'Bank Statement',
    'Passport Photo',
    'Additional Selfie'
  ];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (type === 'reject' && !reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    if (type === 'request_more' && selectedDocs.length === 0) {
      alert('Please select at least one document type');
      return;
    }

    setLoading(true);
    await onConfirm(type === 'reject' ? reason : selectedDocs);
    setLoading(false);
    setReason('');
    setSelectedDocs([]);
  };

  const toggleDoc = (doc: string) => {
    setSelectedDocs(prev =>
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{type === 'reject' ? 'Reject KYC' : 'Request Additional Documents'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="user-info mb-3">
            <p><strong>User:</strong> {document?.user_accounts?.Name}</p>
            <p><strong>Email:</strong> {document?.user_accounts?.Email}</p>
          </div>

          {type === 'reject' ? (
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                className="form-control"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a clear reason for rejection (e.g., blurry image, expired document, mismatch information)..."
                required
              />
              <small className="text-muted">
                This reason will be sent to the user via email.
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label>Select Documents to Request *</label>
              <div className="document-checklist">
                {documentTypes.map(doc => (
                  <div key={doc} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={doc}
                      checked={selectedDocs.includes(doc)}
                      onChange={() => toggleDoc(doc)}
                    />
                    <label className="form-check-label" htmlFor={doc}>
                      {doc}
                    </label>
                  </div>
                ))}
              </div>
              <small className="text-muted">
                User will be notified to upload these documents.
              </small>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${type === 'reject' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : type === 'reject' ? 'Reject' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCApprovalModal;

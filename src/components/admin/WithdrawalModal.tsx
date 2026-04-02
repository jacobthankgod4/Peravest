import React, { useState } from 'react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  withdrawal: any;
  type: 'approve' | 'reject';
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
  type
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (type === 'reject' && !reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    setReason('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #dee2e6' }}>
          <h3 style={{ margin: 0 }}>{type === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}</h3>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div className="withdrawal-details">
            <p style={{ margin: '0.5rem 0' }}><strong>User:</strong> {withdrawal?.user_accounts?.Name}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Amount:</strong> ₦{withdrawal?.Amount?.toLocaleString()}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Bank:</strong> {withdrawal?.Bank_Name}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Account:</strong> {withdrawal?.Account_Number}</p>
          </div>

          {type === 'reject' && (
            <div className="form-group mt-3">
              <label>Rejection Reason *</label>
              <textarea
                className="form-control"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a clear reason for rejection..."
                required
              />
            </div>
          )}

          {type === 'approve' && (
            <div className="alert alert-info mt-3">
              Are you sure you want to approve this withdrawal? This action cannot be undone.
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${type === 'approve' ? 'btn-success' : 'btn-danger'}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : type === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;

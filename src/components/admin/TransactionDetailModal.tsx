import React, { useState, useEffect } from 'react';
import { transactionAdminService } from '../../services/transactionAdminService';
import Swal from 'sweetalert2';

interface TransactionDetailModalProps {
  transactionId: number;
  onClose: () => void;
  onUpdate: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transactionId, onClose, onUpdate }) => {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactionDetails();
  }, [transactionId]);

  const loadTransactionDetails = async () => {
    try {
      const data = await transactionAdminService.getTransactionDetails(transactionId);
      setTransaction(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load transaction details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    const result = await Swal.fire({
      title: `Update to ${status}?`,
      text: 'This will update the transaction status',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update'
    });

    if (result.isConfirmed) {
      try {
        await transactionAdminService.updateTransactionStatus(transactionId, status, 'admin@peravest.com');
        Swal.fire('Updated!', 'Transaction status updated', 'success');
        onUpdate();
        loadTransactionDetails();
      } catch (error) {
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!transaction) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '15px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Transaction Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ color: '#757f95', marginBottom: '0.25rem' }}>Transaction ID</p>
              <p style={{ fontWeight: 600 }}>#{transaction.id}</p>
            </div>
            <div>
              <p style={{ color: '#757f95', marginBottom: '0.25rem' }}>Reference</p>
              <p style={{ fontWeight: 600 }}>{transaction.reference}</p>
            </div>
            <div>
              <p style={{ color: '#757f95', marginBottom: '0.25rem' }}>Type</p>
              <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{transaction.type}</p>
            </div>
            <div>
              <p style={{ color: '#757f95', marginBottom: '0.25rem' }}>Amount</p>
              <p style={{ fontWeight: 600, fontSize: '1.25rem', color: '#09c398' }}>₦{transaction.amount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h5>User Information</h5>
          <p><strong>Name:</strong> {transaction.user_name}</p>
          <p><strong>Email:</strong> {transaction.user_email}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h5>Transaction Details</h5>
          <p><strong>Gateway:</strong> {transaction.gateway || 'N/A'}</p>
          <p><strong>Status:</strong> <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: transaction.status === 'completed' ? '#28a745' : transaction.status === 'failed' ? '#dc3545' : '#ffc107', color: '#fff', fontSize: '0.75rem' }}>{transaction.status}</span></p>
          <p><strong>Created:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
          <p><strong>Updated:</strong> {new Date(transaction.updated_at).toLocaleString()}</p>
        </div>

        {transaction.gateway_response && (
          <div style={{ background: '#e7f5ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h6>Gateway Response</h6>
            <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>{JSON.stringify(transaction.gateway_response, null, 2)}</pre>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="theme-btn" onClick={() => handleStatusChange('pending')} style={{ background: '#ffc107' }}>Mark Pending</button>
          <button className="theme-btn" onClick={() => handleStatusChange('processing')} style={{ background: '#17a2b8' }}>Mark Processing</button>
          <button className="theme-btn" onClick={() => handleStatusChange('completed')} style={{ background: '#28a745' }}>Mark Completed</button>
          <button className="theme-btn" onClick={() => handleStatusChange('failed')} style={{ background: '#dc3545' }}>Mark Failed</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;

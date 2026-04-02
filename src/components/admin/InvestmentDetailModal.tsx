import React, { useState, useEffect } from 'react';
import { investmentAdminService } from '../../services/investmentAdminService';
import Swal from 'sweetalert2';

interface InvestmentDetailModalProps {
  investmentId: number;
  onClose: () => void;
  onUpdate: () => void;
}

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({ investmentId, onClose, onUpdate }) => {
  const [investment, setInvestment] = useState<any>(null);
  const [roi, setRoi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestmentDetails();
  }, [investmentId]);

  const loadInvestmentDetails = async () => {
    try {
      const [invData, roiData] = await Promise.all([
        investmentAdminService.getInvestmentDetails(investmentId),
        investmentAdminService.calculateROI(investmentId)
      ]);
      setInvestment(invData);
      setRoi(roiData);
    } catch (error) {
      Swal.fire('Error', 'Failed to load investment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    const result = await Swal.fire({
      title: `Update to ${status}?`,
      text: 'This will update the payment status',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update'
    });

    if (result.isConfirmed) {
      try {
        await investmentAdminService.updatePaymentStatus(investmentId, status, 'admin@peravest.com');
        Swal.fire('Updated!', 'Payment status updated', 'success');
        onUpdate();
        loadInvestmentDetails();
      } catch (error) {
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!investment) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '15px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Investment Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h5>Investor Information</h5>
            <p><strong>Name:</strong> {investment.user_name}</p>
            <p><strong>Email:</strong> {investment.user_email}</p>
            <p><strong>Investment ID:</strong> #{investment.Id_invest}</p>
          </div>
          <div>
            <h5>Property Information</h5>
            <p><strong>Property:</strong> {investment.property_title}</p>
            <p><strong>Location:</strong> {investment.property_location}</p>
            <p><strong>Type:</strong> {investment.property_type}</p>
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <h5>Investment Details</h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <p><strong>Amount:</strong> ₦{investment.share_cost?.toLocaleString()}</p>
            <p><strong>Interest Rate:</strong> {investment.interest}%</p>
            <p><strong>Period:</strong> {investment.period} months</p>
            <p><strong>Start Date:</strong> {new Date(investment.start_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: investment.payment_status === 'completed' ? '#28a745' : '#ffc107', color: '#fff', fontSize: '0.75rem' }}>{investment.payment_status}</span></p>
          </div>
        </div>

        {roi && (
          <div style={{ background: '#e7f5ff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
            <h5>ROI Calculation</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <p><strong>Expected Return:</strong> ₦{roi.expected_return?.toLocaleString()}</p>
              <p><strong>Current Value:</strong> ₦{roi.current_value?.toLocaleString()}</p>
              <p><strong>ROI:</strong> {roi.roi_percentage}%</p>
              <p><strong>Days Elapsed:</strong> {roi.days_elapsed} / {roi.total_days}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="theme-btn" onClick={() => handleStatusChange('pending')} style={{ background: '#ffc107' }}>Mark Pending</button>
          <button className="theme-btn" onClick={() => handleStatusChange('processing')} style={{ background: '#17a2b8' }}>Mark Processing</button>
          <button className="theme-btn" onClick={() => handleStatusChange('completed')} style={{ background: '#28a745' }}>Mark Completed</button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDetailModal;

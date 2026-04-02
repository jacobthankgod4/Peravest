import React, { useState, useEffect } from 'react';
import { investmentAdminService } from '../../services/investmentAdminService';
import InvestmentDetailModal from './InvestmentDetailModal';
import Swal from 'sweetalert2';

const InvestmentTracking: React.FC = () => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvestments, setSelectedInvestments] = useState<number[]>([]);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<number | null>(null);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const data = await investmentAdminService.getInvestmentsList();
      setInvestments(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load investments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedInvestments.length === 0) {
      Swal.fire('Warning', 'Please select investments first', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: `Update ${selectedInvestments.length} investments?`,
      text: `Set status to ${status}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update'
    });

    if (result.isConfirmed) {
      try {
        await investmentAdminService.bulkUpdateStatus(selectedInvestments, status, 'admin@peravest.com');
        Swal.fire('Success!', 'Investments updated', 'success');
        setSelectedInvestments([]);
        loadInvestments();
      } catch (error) {
        Swal.fire('Error', 'Failed to update investments', 'error');
      }
    }
  };

  const handleExport = async () => {
    try {
      const data = await investmentAdminService.exportInvestments({ status: statusFilter });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investments_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      Swal.fire('Success!', 'Investments exported', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to export', 'error');
    }
  };

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.property_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelection = (id: number) => {
    setSelectedInvestments(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '2rem' }}>Investment Tracking</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by user or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        
        <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>

        <button className="theme-btn" onClick={handleExport}>Export</button>
      </div>

      {selectedInvestments.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <span>{selectedInvestments.length} selected</span>
          <button className="theme-btn" onClick={() => handleBulkStatusUpdate('pending')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: '#ffc107' }}>Mark Pending</button>
          <button className="theme-btn" onClick={() => handleBulkStatusUpdate('processing')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: '#17a2b8' }}>Mark Processing</button>
          <button className="theme-btn" onClick={() => handleBulkStatusUpdate('completed')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: '#28a745' }}>Mark Completed</button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={(e) => setSelectedInvestments(e.target.checked ? filteredInvestments.map(i => i.Id_invest) : [])} /></th>
              <th>Investor</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvestments.map(inv => (
              <tr key={inv.Id_invest}>
                <td><input type="checkbox" checked={selectedInvestments.includes(inv.Id_invest)} onChange={() => toggleSelection(inv.Id_invest)} /></td>
                <td>{inv.user_name}</td>
                <td>{inv.property_title}</td>
                <td>₦{inv.share_cost?.toLocaleString()}</td>
                <td>{inv.interest}%</td>
                <td>{inv.period} months</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: inv.payment_status === 'completed' ? '#28a745' : inv.payment_status === 'processing' ? '#17a2b8' : '#ffc107',
                    color: '#fff'
                  }}>
                    {inv.payment_status}
                  </span>
                </td>
                <td>
                  <button className="theme-btn" onClick={() => setSelectedInvestmentId(inv.Id_invest)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInvestments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No investments found</p>
        </div>
      )}

      {selectedInvestmentId && (
        <InvestmentDetailModal
          investmentId={selectedInvestmentId}
          onClose={() => setSelectedInvestmentId(null)}
          onUpdate={loadInvestments}
        />
      )}
    </div>
  );
};

export default InvestmentTracking;

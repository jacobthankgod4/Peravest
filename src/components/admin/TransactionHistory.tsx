import React, { useState, useEffect } from 'react';
import { transactionAdminService } from '../../services/transactionAdminService';
import TransactionDetailModal from './TransactionDetailModal';
import Swal from 'sweetalert2';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  useEffect(() => {
    loadTransactions();
    loadAnalytics();
  }, []);

  const loadTransactions = async () => {
    try {
      const filters = {
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        start_date: dateRange.start || undefined,
        end_date: dateRange.end || undefined
      };
      const data = await transactionAdminService.getTransactionsList(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
      // Don't show error for empty table - it's normal
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await transactionAdminService.getTransactionAnalytics(
        dateRange.start && dateRange.end ? dateRange : undefined
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Set default analytics if none exist
      setAnalytics({
        total_count: 0,
        total_volume: 0,
        completed_count: 0,
        failed_count: 0,
        pending_count: 0
      });
    }
  };

  const handleExport = async () => {
    try {
      const filters = { type: typeFilter, status: statusFilter, ...dateRange };
      const data = await transactionAdminService.exportTransactions(filters);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      Swal.fire('Success!', 'Transactions exported', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to export', 'error');
    }
  };

  const applyFilters = () => {
    loadTransactions();
    loadAnalytics();
  };

  const filteredTransactions = transactions.filter(txn =>
    txn.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '2rem' }}>Transaction History</h2>

      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Transactions</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50' }}>{analytics.total_count}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Volume</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#09c398' }}>₦{analytics.total_volume?.toLocaleString()}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Completed</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#28a745' }}>{analytics.completed_count}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Failed</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#dc3545' }}>{analytics.failed_count}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by reference or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="investment">Investment</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="refund">Refund</option>
          <option value="fee">Fee</option>
        </select>

        <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          className="form-control"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
        />

        <input
          type="date"
          className="form-control"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
        />

        <button className="theme-btn" onClick={applyFilters}>Apply Filters</button>
        <button className="theme-btn" onClick={handleExport}>Export</button>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Gateway</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(txn => (
              <tr key={txn.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{txn.reference}</td>
                <td>{txn.user_name}</td>
                <td style={{ textTransform: 'capitalize' }}>{txn.type}</td>
                <td style={{ fontWeight: 600 }}>₦{txn.amount?.toLocaleString()}</td>
                <td>{txn.gateway || 'N/A'}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: txn.status === 'completed' ? '#28a745' : txn.status === 'failed' ? '#dc3545' : txn.status === 'processing' ? '#17a2b8' : '#ffc107',
                    color: '#fff'
                  }}>
                    {txn.status}
                  </span>
                </td>
                <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="theme-btn" onClick={() => setSelectedTransactionId(txn.id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No transactions found. This is normal for a new system.</p>
        </div>
      )}

      {selectedTransactionId && (
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          onUpdate={loadTransactions}
        />
      )}
    </div>
  );
};

export default TransactionHistory;

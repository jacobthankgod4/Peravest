import React, { useState, useEffect } from 'react';
import { withdrawalAdminService } from '../../services/withdrawalAdminService';
import { useAuth } from '../../contexts/AuthContext';
import WithdrawalModal from './WithdrawalModal';
import Swal from 'sweetalert2';

const WithdrawalApproval: React.FC = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    withdrawal: any;
  }>({ isOpen: false, type: 'approve', withdrawal: null });

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const data = filter === 'pending' 
        ? await withdrawalAdminService.getPendingWithdrawals()
        : await withdrawalAdminService.getAllWithdrawals(filter === 'all' ? undefined : filter);
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      setWithdrawals([]);
      // Don't show error for empty table - it's normal
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawal: any) => {
    setModalState({ isOpen: true, type: 'approve', withdrawal });
  };

  const handleReject = async (withdrawal: any) => {
    setModalState({ isOpen: true, type: 'reject', withdrawal });
  };

  const confirmAction = async (reason: string) => {
    try {
      if (modalState.type === 'approve') {
        await withdrawalAdminService.approveWithdrawal(modalState.withdrawal.Id, user?.email!);
        Swal.fire('Success', 'Withdrawal approved successfully', 'success');
      } else {
        await withdrawalAdminService.rejectWithdrawal(modalState.withdrawal.Id, user?.email!, reason);
        Swal.fire('Success', 'Withdrawal rejected', 'success');
      }
      setModalState({ isOpen: false, type: 'approve', withdrawal: null });
      fetchWithdrawals();
    } catch (error) {
      Swal.fire('Error', 'Action failed', 'error');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Warning', 'Please select withdrawals to approve', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Approve',
      text: `Approve ${selectedIds.length} withdrawal(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await withdrawalAdminService.bulkApprove(selectedIds, user?.email!);
        Swal.fire('Success', `${selectedIds.length} withdrawals approved`, 'success');
        setSelectedIds([]);
        fetchWithdrawals();
      } catch (error) {
        Swal.fire('Error', 'Bulk approval failed', 'error');
      }
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === withdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(withdrawals.map(w => w.Id));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      processing: 'info'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status}</span>;
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="withdrawal-approval">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Withdrawal Management</h2>
        <div className="d-flex gap-2">
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          {selectedIds.length > 0 && (
            <button className="btn btn-success" onClick={handleBulkApprove}>
              Approve Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {withdrawals.length === 0 ? (
            <div className="text-center py-4">
              <p>No withdrawals found. This is normal for a new system.</p>
              <small className="text-muted">Withdrawal requests will appear here when users request withdrawals.</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    {filter === 'pending' && (
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === withdrawals.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                    )}
                    <th>Date</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Bank Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.Id}>
                      {filter === 'pending' && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(withdrawal.Id)}
                            onChange={() => toggleSelect(withdrawal.Id)}
                          />
                        </td>
                      )}
                      <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                      <td>{withdrawal.user_accounts?.Name}</td>
                      <td>₦{withdrawal.Amount?.toLocaleString()}</td>
                      <td>
                        <small>
                          {withdrawal.Bank_Name}<br />
                          {withdrawal.Account_Number}
                        </small>
                      </td>
                      <td>{getStatusBadge(withdrawal.Status)}</td>
                      <td>
                        {withdrawal.Status === 'pending' && (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-success"
                              onClick={() => handleApprove(withdrawal)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleReject(withdrawal)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <WithdrawalModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: 'approve', withdrawal: null })}
        onConfirm={confirmAction}
        withdrawal={modalState.withdrawal}
        type={modalState.type}
      />
    </div>
  );
};

export default WithdrawalApproval;

import React, { useState, useEffect } from 'react';
import { withdrawalService } from '../services/withdrawalService';
import { nigerianBanks } from '../data/nigerianBanks';
import Swal from 'sweetalert2';

interface Withdrawal {
  id: number;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  reference: string;
  created_at: string;
}

const Withdrawal: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await withdrawalService.getUserWithdrawals();
      setWithdrawals(response.data || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await withdrawalService.create(formData);
      Swal.fire('Success!', 'Withdrawal request submitted', 'success');
      setFormData({ amount: '', bankName: '', accountNumber: '', accountName: '' });
      fetchWithdrawals();
    } catch (error) {
      Swal.fire('Error!', 'Failed to submit withdrawal request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Request Withdrawal</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Amount (₦)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Bank Name</label>
                  <select
                    className="form-control"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    required
                  >
                    <option value="">Select Bank</option>
                    {nigerianBanks.map((bank) => (
                      <option key={bank.code} value={bank.name}>{bank.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Account Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.accountName}
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Withdrawal History</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td>₦{withdrawal.amount.toLocaleString()}</td>
                        <td>
                          <span className={`badge bg-${
                            withdrawal.status === 'completed' ? 'success' :
                            withdrawal.status === 'pending' ? 'warning' : 'danger'
                          }`}>
                            {withdrawal.status}
                          </span>
                        </td>
                        <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;

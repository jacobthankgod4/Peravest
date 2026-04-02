import React, { useState, useEffect } from 'react';
import { withdrawalService } from '../services/withdrawalService';
import Swal from 'sweetalert2';

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
}

interface WithdrawalRequest {
  amount: number;
  bank_account_id: number;
  purpose: string;
}

const Withdrawal: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [formData, setFormData] = useState<WithdrawalRequest>({
    amount: 0,
    bank_account_id: 0,
    purpose: ''
  });
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankData, setNewBankData] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  });

  useEffect(() => {
    fetchBankAccounts();
    fetchAvailableBalance();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await withdrawalService.getBankAccounts();
      setBankAccounts(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, bank_account_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchAvailableBalance = async () => {
    try {
      const response = await withdrawalService.getAvailableBalance();
      setAvailableBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔍 DEBUG: Starting addBankAccount');
    console.log('📝 Form Data:', newBankData);

    try {
      console.log('🔵 Calling withdrawalService.addBankAccount...');
      const response = await withdrawalService.addBankAccount(newBankData);
      console.log('✅ Response:', response);
      
      setBankAccounts([...bankAccounts, response.data]);
      setNewBankData({ bank_name: '', account_number: '', account_name: '' });
      setShowAddBank(false);
      Swal.fire('Success!', 'Bank account added successfully', 'success');
    } catch (error: any) {
      console.error('❌ ERROR in handleAddBankAccount:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to add bank account',
        html: `
          <div style="text-align: left; font-family: monospace; font-size: 12px;">
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Details:</strong></p>
            <pre>${JSON.stringify(error, null, 2)}</pre>
          </div>
        `,
        width: 600
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount > availableBalance) {
      Swal.fire('Error!', 'Insufficient balance', 'error');
      return;
    }

    if (formData.amount < 1000) {
      Swal.fire('Error!', 'Minimum withdrawal amount is ₦1,000', 'error');
      return;
    }

    setLoading(true);

    try {
      await withdrawalService.requestWithdrawal(formData);
      Swal.fire({
        icon: 'success',
        title: 'Withdrawal Request Submitted',
        text: 'Your withdrawal request has been submitted and will be processed within 24 hours'
      });
      setFormData({ amount: 0, bank_account_id: bankAccounts[0]?.id || 0, purpose: '' });
      fetchAvailableBalance();
    } catch (error) {
      Swal.fire('Error!', 'Failed to submit withdrawal request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdrawal-container">
      <div className="container py-4">
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card">
              <div className="card-header">
                <h4>Withdraw Funds</h4>
              </div>
              <div className="card-body">
                <div className="alert alert-info mb-4">
                  <strong>Available Balance: ₦{availableBalance.toLocaleString()}</strong>
                </div>

                {bankAccounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No bank accounts found. Please add a bank account first.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddBank(true)}
                    >
                      Add Bank Account
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleWithdrawalRequest}>
                    <div className="mb-3">
                      <label className="form-label">Withdrawal Amount (₦)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                        min="1000"
                        max={availableBalance}
                        required
                      />
                      <div className="form-text">Minimum withdrawal: ₦1,000</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Bank Account</label>
                      <select
                        className="form-select"
                        value={formData.bank_account_id}
                        onChange={(e) => setFormData({...formData, bank_account_id: Number(e.target.value)})}
                        required
                      >
                        {bankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bank_name} - {account.account_number} ({account.account_name})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-link p-0 mt-1"
                        onClick={() => setShowAddBank(true)}
                      >
                        Add New Bank Account
                      </button>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Purpose (Optional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.purpose}
                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                        placeholder="Reason for withdrawal..."
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Processing...' : 'Submit Withdrawal Request'}
                    </button>
                  </form>
                )}

                {showAddBank && (
                  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Add Bank Account</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowAddBank(false)}
                          ></button>
                        </div>
                        <form onSubmit={handleAddBankAccount}>
                          <div className="modal-body">
                            <div className="mb-3">
                              <label className="form-label">Bank Name</label>
                              <select
                                className="form-select"
                                value={newBankData.bank_name}
                                onChange={(e) => setNewBankData({...newBankData, bank_name: e.target.value})}
                                required
                              >
                                <option value="">Select Bank</option>
                                <option value="Access Bank">Access Bank</option>
                                <option value="Afribank Nigeria Plc">Afribank Nigeria Plc</option>
                                <option value="Citibank Nigeria Limited">Citibank Nigeria Limited</option>
                                <option value="Ecobank Nigeria Plc">Ecobank Nigeria Plc</option>
                                <option value="Equitorial Trust Bank Limited">Equitorial Trust Bank Limited</option>
                                <option value="First Bank of Nigeria Plc">First Bank of Nigeria Plc</option>
                                <option value="First City Monument Bank Plc">First City Monument Bank Plc</option>
                                <option value="Guaranty Trust Bank Plc">Guaranty Trust Bank Plc</option>
                                <option value="Heritage Banking Company Ltd">Heritage Banking Company Ltd</option>
                                <option value="Jaiz Bank Plc">Jaiz Bank Plc</option>
                                <option value="Keystone Bank Plc">Keystone Bank Plc</option>
                                <option value="Polaris Bank">Polaris Bank</option>
                                <option value="Providus Bank">Providus Bank</option>
                                <option value="Stanbic IBTC Bank Plc">Stanbic IBTC Bank Plc</option>
                                <option value="Standard Chartered Bank Nigeria Ltd">Standard Chartered Bank Nigeria Ltd</option>
                                <option value="Sterling Bank Plc">Sterling Bank Plc</option>
                                <option value="SunTrust Bank Nigeria Limited">SunTrust Bank Nigeria Limited</option>
                                <option value="Union Bank of Nigeria Plc">Union Bank of Nigeria Plc</option>
                                <option value="United Bank For Africa Plc">United Bank For Africa Plc</option>
                                <option value="Unity Bank Plc">Unity Bank Plc</option>
                                <option value="Wema Bank Plc">Wema Bank Plc</option>
                                <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                                <option value="TAJ Bank">TAJ Bank</option>
                                <option value="Kuda Bank">Kuda Bank</option>
                                <option value="Alat by Wema">Alat by Wema</option>
                                <option value="Moniepoint MFB">Moniepoint MFB</option>
                                <option value="Renmoney MFB">Renmoney MFB</option>
                                <option value="VFD Microfinance Bank">VFD Microfinance Bank</option>
                                <option value="Accion Microfinance Bank">Accion Microfinance Bank</option>
                                <option value="LAPO Microfinance Bank">LAPO Microfinance Bank</option>
                                <option value="Mint MFB">Mint MFB</option>
                                <option value="Nirsal Microfinance Bank">Nirsal Microfinance Bank</option>
                                <option value="Boctrust Microfinance Bank">Boctrust Microfinance Bank</option>
                                <option value="OPay">OPay</option>
                                <option value="PalmPay">PalmPay</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Account Number</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newBankData.account_number}
                                onChange={(e) => setNewBankData({...newBankData, account_number: e.target.value})}
                                maxLength={10}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Account Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newBankData.account_name}
                                onChange={(e) => setNewBankData({...newBankData, account_name: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowAddBank(false)}
                            >
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                              {loading ? 'Adding...' : 'Add Account'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { withdrawalService } from '../services/withdrawalService';
import { nigerianBanks } from '../data/nigerianBanks';
import Swal from 'sweetalert2';

interface WithdrawalRecord {
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
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [savedBankAccounts, setSavedBankAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    fetchWithdrawals();
    fetchAvailableBalance();
    fetchSavedBankAccounts();
  }, []);

  const fetchSavedBankAccounts = async () => {
    try {
      // This should fetch from user profile service
      // const response = await profileService.getBankAccounts();
      // setSavedBankAccounts(response.data || []);
      setSavedBankAccounts([]); // Default to empty until real data is connected
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      setSavedBankAccounts([]);
    }
  };

  const fetchAvailableBalance = async () => {
    try {
      // This should fetch from your actual portfolio/investment service
      // const response = await portfolioService.getAvailableBalance();
      // setAvailableBalance(response.data.availableBalance);
      setAvailableBalance(0); // Default to 0 until real data is connected
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setAvailableBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

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
      Swal.fire('Success!', 'Withdrawal request submitted successfully', 'success');
      setFormData({ amount: '', bankName: '', accountNumber: '', accountName: '' });
      fetchWithdrawals();
    } catch (error) {
      Swal.fire('Error!', 'Failed to submit withdrawal request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Withdraw Funds">
      <main style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '6rem' }}>
        <div className="container">
          {/* Header Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ color: '#0e2e50', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Withdraw Funds</h1>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Transfer your earnings to your bank account</p>
            </div>
            
            {/* Balance Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0e2e50 0%, #0e2e50 100%)',
              borderRadius: '20px',
              padding: '2rem',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(14, 46, 80, 0.3)',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' }}>Available Balance</div>
              <div style={{ fontSize: '3rem', fontWeight: '700' }}>
                {balanceLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  `₦${availableBalance.toLocaleString()}`
                )}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ready for withdrawal</div>
            </div>
          </div>

          <div className="row g-4">
            {/* Withdrawal Form */}
            <div className="col-lg-6">
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '2.5rem',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Request Withdrawal</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Enter your bank details to withdraw funds</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Saved Bank Accounts */}
                  {savedBankAccounts.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '1rem' }}>Saved Bank Accounts</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {savedBankAccounts.map((account) => (
                          <div
                            key={account.id}
                            onClick={() => {
                              setSelectedAccount(account);
                              setFormData({
                                ...formData,
                                bankName: account.bankName,
                                accountNumber: account.accountNumber,
                                accountName: account.accountName
                              });
                            }}
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              border: selectedAccount?.id === account.id ? '2px solid #0e2e50' : '2px solid #e2e8f0',
                              background: selectedAccount?.id === account.id ? '#f0f9ff' : '#fff',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: '600', color: '#0e2e50', marginBottom: '0.25rem' }}>{account.accountName}</div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{account.bankName} • {account.accountNumber}</div>
                              </div>
                              {selectedAccount?.id === account.id && (
                                <i className="fas fa-check-circle" style={{ color: '#0e2e50', fontSize: '1.25rem' }}></i>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ textAlign: 'center', margin: '1rem 0', color: '#64748b', fontSize: '0.9rem' }}>or enter new bank details below</div>
                    </div>
                  )}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Amount (₦)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: '600' }}>₦</span>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                        min="1000"
                        max={availableBalance}
                        style={{
                          width: '100%',
                          padding: '1rem 1rem 1rem 2.5rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                        placeholder="10,000"
                      />
                    </div>
                    <small style={{ color: '#64748b', fontSize: '0.85rem' }}>Minimum: ₦1,000 • Maximum: ₦{availableBalance.toLocaleString()}</small>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Bank Name</label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <option value="">Select Bank</option>
                      {nigerianBanks.map((bank) => (
                        <option key={bank.code} value={bank.name}>{bank.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      required
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      placeholder="0123456789"
                    />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Account Name</label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      placeholder="John Doe"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      background: loading ? '#94a3b8' : '#0e2e50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 30px rgba(14, 46, 80, 0.3)',
                      marginBottom: '2rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = '#1e3a8a';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = '#0e2e50';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane" style={{ marginRight: '0.5rem' }}></i>
                        Submit Withdrawal Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Withdrawal History */}
            <div className="col-lg-6">
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '2.5rem',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Withdrawal History</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Track your withdrawal requests</p>
                </div>

                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {withdrawals.length > 0 ? (
                    withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0e2e50' }}>₦{withdrawal.amount.toLocaleString()}</div>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: withdrawal.status === 'completed' ? '#dcfce7' : withdrawal.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: withdrawal.status === 'completed' ? '#166534' : withdrawal.status === 'pending' ? '#92400e' : '#dc2626'
                          }}>
                            {withdrawal.status}
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          {withdrawal.bank_name} • {withdrawal.account_number}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {new Date(withdrawal.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <i className="fas fa-history" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No withdrawals yet</div>
                      <div style={{ fontSize: '0.9rem' }}>Your withdrawal history will appear here</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Withdrawal;
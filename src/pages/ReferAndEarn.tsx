import React, { useState, useEffect } from 'react';
import { referralService, ReferralData, ReferralStats } from '../services/referralService';
import { useReferral } from '../contexts/ReferralContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Swal from 'sweetalert2';
import styles from './ReferAndEarn.module.css';

const ReferAndEarn: React.FC = () => {
  const { referralCode, stats, loading, refreshStats } = useReferral();
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [withdrawing, setWithdrawing] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [newCode, setNewCode] = useState('');

  useEffect(() => {
    if (referralCode) {
      setReferralLink(referralService.generateReferralLink(referralCode));
    }
    fetchReferrals();
  }, [referralCode]);

  const fetchReferrals = async () => {
    try {
      const response = await referralService.getUserReferrals();
      setReferrals(response.data);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    }
  };

  const handleEditCode = async () => {
    if (!newCode.trim()) {
      Swal.fire('Error', 'Please enter a referral code', 'error');
      return;
    }

    if (newCode === referralCode) {
      setEditingCode(false);
      return;
    }

    try {
      await referralService.updateReferralCode(newCode.trim());
      await refreshStats();
      setEditingCode(false);
      Swal.fire('Success!', 'Referral code updated successfully', 'success');
    } catch (error: any) {
      Swal.fire('Error!', error.message || 'Failed to update referral code', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      title: 'Copied!',
      text: 'Referral link copied to clipboard',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const shareViaWhatsApp = () => {
    const message = `Join me on PeraVest and start investing in real estate with as little as ₦5,000! Use my referral link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaTwitter = () => {
    const message = `Join me on PeraVest and start investing in real estate! Use my referral link: ${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWithdraw = async () => {
    if (stats.available_bonus < 100) {
      Swal.fire('Error', 'Minimum withdrawal amount is ₦100', 'error');
      return;
    }

    const { value: amount } = await Swal.fire({
      title: 'Withdraw Referral Bonus',
      input: 'number',
      inputLabel: `Available: ₦${stats.available_bonus.toLocaleString()}`,
      inputPlaceholder: 'Enter amount',
      inputAttributes: {
        min: '100',
        max: stats.available_bonus.toString(),
        step: '50'
      },
      showCancelButton: true,
      confirmButtonText: 'Withdraw',
      inputValidator: (value) => {
        if (!value || parseInt(value) < 100) {
          return 'Minimum withdrawal is ₦100';
        }
        if (parseInt(value) > stats.available_bonus) {
          return 'Amount exceeds available bonus';
        }
      }
    });

    if (amount) {
      setWithdrawing(true);
      try {
        await referralService.withdrawReferralBonus(parseInt(amount));
        Swal.fire('Success!', 'Withdrawal request submitted successfully', 'success');
        refreshStats();
      } catch (error) {
        Swal.fire('Error!', 'Failed to process withdrawal', 'error');
      } finally {
        setWithdrawing(false);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Refer & Earn">
        <div className={styles.loading}>
          <i className={`fas fa-spinner fa-spin ${styles.spinner}`}></i>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Refer & Earn">
      <main className={styles.referralPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Refer & Earn</h1>
            <p className={styles.subtitle}>Earn ₦500 for every successful referral</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ animationDelay: '0.1s' }}>
              <div className={styles.statValue}>{stats.total_referrals}</div>
              <div className={styles.statLabel}>Total Referrals</div>
            </div>
            <div className={styles.statCard} style={{ animationDelay: '0.2s' }}>
              <div className={styles.statValue}>{stats.successful_referrals}</div>
              <div className={styles.statLabel}>Successful</div>
            </div>
            <div className={styles.statCard} style={{ animationDelay: '0.3s' }}>
              <div className={styles.statValue}>{stats.pending_referrals}</div>
              <div className={styles.statLabel}>Pending</div>
            </div>
            <div className={styles.statCard} style={{ animationDelay: '0.4s' }}>
              <div className={styles.statValue}>₦{stats.total_earnings.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Earnings</div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div>
              <div className={styles.card} style={{ animationDelay: '0.5s' }}>
                <h3 className={styles.cardTitle}>Your Referral Link</h3>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Referral Code</label>
                  {editingCode ? (
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        placeholder="Enter custom code (3-20 characters)"
                        maxLength={20}
                        className={styles.input}
                      />
                      <button onClick={handleEditCode} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnIcon}`}>
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        onClick={() => {
                          setEditingCode(false);
                          setNewCode('');
                        }}
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnIcon}`}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className={styles.inputWrapper}>
                      <input type="text" value={referralCode} readOnly className={styles.input} />
                      <button onClick={() => copyToClipboard(referralCode)} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnIcon}`}>
                        <i className="fas fa-copy"></i>
                      </button>
                      <button
                        onClick={() => {
                          setEditingCode(true);
                          setNewCode(referralCode);
                        }}
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnIcon}`}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Referral Link</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" value={referralLink} readOnly className={styles.input} style={{ fontSize: '0.9rem' }} />
                    <button onClick={() => copyToClipboard(referralLink)} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnIcon}`}>
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>

                <div className={styles.socialButtons}>
                  <button onClick={shareViaWhatsApp} className={`${styles.btn} ${styles.btnWhatsapp}`}>
                    <i className="fab fa-whatsapp"></i>
                    Share on WhatsApp
                  </button>
                  <button onClick={shareViaTwitter} className={`${styles.btn} ${styles.btnTwitter}`}>
                    <i className="fab fa-twitter"></i>
                    Share on Twitter
                  </button>
                </div>
              </div>

              <div className={styles.card} style={{ animationDelay: '0.6s', marginTop: '2rem' }}>
                <h3 className={styles.cardTitle}>How It Works</h3>
                <div className={styles.howItWorks}>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>1</div>
                    <h5 className={styles.stepTitle}>Share Your Link</h5>
                    <p className={styles.stepDesc}>Share your unique referral link with friends and family</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>2</div>
                    <h5 className={styles.stepTitle}>They Sign Up</h5>
                    <p className={styles.stepDesc}>Your friends register using your referral link</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepIcon}>3</div>
                    <h5 className={styles.stepTitle}>Earn ₦500</h5>
                    <p className={styles.stepDesc}>Get ₦500 when they make their first investment</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className={styles.bonusCard}>
                <div className={styles.bonusLabel}>Available Bonus</div>
                <div className={styles.bonusAmount}>₦{stats.available_bonus.toLocaleString()}</div>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || stats.available_bonus < 100}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{
                    opacity: stats.available_bonus >= 100 ? 1 : 0.5,
                    cursor: stats.available_bonus >= 100 ? 'pointer' : 'not-allowed',
                    width: '100%'
                  }}
                >
                  {withdrawing ? 'Processing...' : 'Withdraw'}
                </button>
                <div className={styles.bonusMin}>Min: ₦100</div>
              </div>

              <div className={styles.card} style={{ animationDelay: '0.7s' }}>
                <h4 className={styles.cardTitle}>Recent Referrals</h4>
                {referrals.length > 0 ? (
                  <div className={styles.referralsList}>
                    {referrals.slice(0, 5).map((referral) => (
                      <div key={referral.id} className={styles.referralItem}>
                        <div className={styles.referralHeader}>
                          <div className={styles.referralName}>
                            {referral.referred_user?.name || 'New User'}
                          </div>
                          <span className={`${styles.badge} ${referral.status === 'completed' ? styles.badgeCompleted : styles.badgePending}`}>
                            {referral.status}
                          </span>
                        </div>
                        <div className={styles.referralDetails}>
                          ₦{referral.bonus_amount.toLocaleString()} • {new Date(referral.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <i className={`fas fa-users ${styles.emptyIcon}`}></i>
                    <div>No referrals yet</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Start sharing your link!</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );

};

export default ReferAndEarn;
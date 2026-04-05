import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { investmentService } from '../services/investmentService';
import { withdrawalService } from '../services/withdrawalService';
import { useAuth } from '../contexts/AuthContext';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import styles from './Dashboard.module.css';

interface Investment {
  Id_invest: number;
  share_cost: number;
  interest: number;
  period: number;
  start_date: string;
  property: any;
  package: any;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔵 Loading dashboard data...');
      const [balanceRes, investmentsRes] = await Promise.all([
        withdrawalService.getAvailableBalance(),
        investmentService.getUserInvestments()
      ]);
      
      console.log('✅ Balance:', balanceRes.data.balance);
      console.log('✅ Investments:', investmentsRes.data);
      
      setBalance(balanceRes.data.balance);
      setInvestments(investmentsRes.data);
    } catch (error: any) {
      console.error('❌ Failed to load dashboard:', error);
      console.error('Error details:', error.message);
      setBalance(0);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateInterest = (inv: Investment) => {
    return Number(inv.interest || 0);
  };

  const calculatePortfolioStats = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.share_cost || 0), 0);
    const totalReturns = investments.reduce((sum, inv) => sum + calculateInterest(inv), 0);
    const currentValue = totalInvested + totalReturns;
    const activeCount = investments.length;
    
    return { totalInvested, currentValue, totalReturns, activeCount };
  };

  const generateRecentActivities = () => {
    return investments.slice(0, 5).map((inv) => ({
      id: inv.Id_invest,
      type: 'investment' as const,
      title: `Invested in ${inv.property?.[0]?.Title || 'Property'}`,
      amount: Number(inv.share_cost),
      date: inv.start_date,
      icon: 'fas fa-arrow-up',
      color: '#09c398'
    }));
  };

  const calculateProgress = (inv: Investment) => {
    const start = new Date(inv.start_date).getTime();
    const months = inv.period || 12;
    const end = start + (months * 30 * 24 * 60 * 60 * 1000);
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getMaturityDate = (inv: Investment) => {
    const start = new Date(inv.start_date);
    const months = inv.period || 12;
    start.setMonth(start.getMonth() + months);
    return start;
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const portfolioStats = calculatePortfolioStats();

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Portfolio Summary */}
        <div className={styles.portfolioSummary}>
          <StatCard 
            icon="fas fa-wallet"
            title="Total Invested"
            value={`₦${portfolioStats.totalInvested.toLocaleString('en-NG')}`}
            color="#09c398"
          />
          <StatCard 
            icon="fas fa-chart-line"
            title="Current Value"
            value={`₦${portfolioStats.currentValue.toLocaleString('en-NG')}`}
            color="#0d6efd"
          />
          <StatCard 
            icon="fas fa-coins"
            title="Total Returns"
            value={`₦${portfolioStats.totalReturns.toLocaleString('en-NG')}`}
            color="#28a745"
          />
          <StatCard 
            icon="fas fa-briefcase"
            title="Active Investments"
            value={portfolioStats.activeCount}
            color="#ffc107"
          />
        </div>

        {/* Balance Card - Spec #4 */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>
            My Balance
            <span 
              className={styles.eyeIcon} 
              onClick={() => setShowBalance(!showBalance)}
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              <i className={`fas fa-eye${showBalance ? '' : '-slash'}`} aria-hidden="true" />
            </span>
          </div>
          <h1 className={styles.balanceAmount}>
            {showBalance ? `₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '₦••••••'}
          </h1>
          {/* Sub-info Row */}
          <div className={styles.balanceSubRow}>
            <span>Total Invested: ₦{portfolioStats.totalInvested.toLocaleString()}</span>
            <span>{investments.length} Active</span>
          </div>
          {/* Mini Chart */}
          <div className={styles.balanceChart}>
            <div className={styles.chartDot}></div>
            <div className={styles.chartBar1}></div>
            <div className={styles.chartBar2}></div>
            <div className={styles.chartBar3}></div>
          </div>
        </div>

        {/* Header Bar #2 */}
        <div className={styles.headerBar}>
          <i className="fas fa-arrow-left headerIcon" aria-label="Back" />
          <div className={styles.headerTitle}>Flex Naira</div>
          <i className="fas fa-info-circle headerIcon" aria-label="Info" />
        </div>

        {/* Top Badges #3 */}
        <div className={styles.badgesRow}>
          <div className={`${styles.badge} ${styles.badgeVerified}`}>Verified</div>
          <div className={`${styles.badge} ${styles.badgePremium}`}>Premium</div>
        </div>

        {/* Primary Actions #6 */}
        <div className={styles.primaryActions}>
          <Link to="/listings" className={`${styles.primaryActionBtn} ${styles.addMoneyBtn}`} aria-label="Add Money">
            <i className="fas fa-plus" aria-hidden="true" />
            <span>Add Money</span>
          </Link>
          <Link to="/withdrawal" className={`${styles.primaryActionBtn} ${styles.withdrawBtn}`} aria-label="Withdraw">
            <i className="fas fa-money-bill-wave" aria-hidden="true" />
            <span>Withdraw</span>
            <small>Available Balance</small>
          </Link>
        </div>

        {/* Savings Programs */}
        <div className={styles.savingsSection}>
          <h2 className={styles.sectionTitle}>Savings & Investment Programs</h2>
          <div className={styles.savingsGrid}>
            <Link to="/listings" className={styles.savingsCard}>
              <i className="fas fa-building" style={{ fontSize: '2rem', color: '#09c398', marginBottom: '0.5rem' }}></i>
              <h6>Real Estate Investment</h6>
            </Link>
            <Link to="/ajo" className={styles.savingsCard}>
              <i className="fas fa-users" style={{ fontSize: '2rem', color: '#09c398', marginBottom: '0.5rem' }}></i>
              <h6>Ajo Savings</h6>
            </Link>
            <Link to="/target-savings" className={styles.savingsCard}>
              <i className="fas fa-bullseye" style={{ fontSize: '2rem', color: '#09c398', marginBottom: '0.5rem' }}></i>
              <h6>Target Savings</h6>
            </Link>
            <Link to="/safelock" className={styles.savingsCard}>
              <i className="fas fa-lock" style={{ fontSize: '2rem', color: '#09c398', marginBottom: '0.5rem' }}></i>
              <h6>SafeLock</h6>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <ActivityFeed activities={generateRecentActivities()} />

        {/* My Investments */}
        <div className={styles.investmentsSection}>
          <h2 className={styles.sectionTitle}>My Investments</h2>
          {investments.length > 0 ? (
            investments.map((inv) => {
              const interest = calculateInterest(inv);
              const progress = calculateProgress(inv);
              
              return (
                <div key={inv.Id_invest} className={styles.investmentCard}>
                  <div className={styles.investmentContent}>
                    <div>
                      <img 
                        src={inv.property?.[0]?.Images || '/assets/img/property/default.jpg'} 
                        className={styles.investmentImage}
                        alt={inv.property?.[0]?.Title}
                      />
                      <h3 className={styles.investmentTitle}>
                        {inv.property?.[0]?.Title || 'Property Investment'}
                      </h3>
                    </div>
                    <div>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className={styles.investmentStats}>
                        <div className={styles.statBox}>
                          <div className={styles.statLabel}>Investment</div>
                          <div className={styles.statValue}>₦{Number(inv.share_cost).toLocaleString()}</div>
                        </div>
                        <div className={styles.statBox}>
                          <div className={styles.statLabel}>Start Date</div>
                          <div className={styles.statValue}>{new Date(inv.start_date).toLocaleDateString('en-GB')}</div>
                        </div>
                        <div className={styles.statBox}>
                          <div className={styles.statLabel}>Maturity</div>
                          <div className={styles.statValue}>{getMaturityDate(inv).toLocaleDateString('en-GB')}</div>
                        </div>
                      </div>
                      <div className={styles.investmentActions}>
                        <div className={styles.interestBox}>
                          <div className={styles.interestLabel}>Interest Earned</div>
                          <div className={styles.interestValue}>₦{interest.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <Link 
                          to="/withdrawal" 
                          state={{ investmentId: inv.Id_invest, amount: Number(inv.share_cost) + interest }}
                          className={styles.withdrawBtn}
                        >
                          Withdraw Funds <i className="fas fa-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <i className="fas fa-chart-line" style={{ fontSize: '3rem', color: '#09c398', marginBottom: '1rem' }}></i>
              <p>No investments yet. Start investing today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


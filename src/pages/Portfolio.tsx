import React, { useState, useEffect } from 'react';
import { useInvestment } from '../contexts/InvestmentContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Portfolio.module.css';

const Portfolio: React.FC = () => {
  const { investments, stats, loading, getInvestments } = useInvestment();
  const [ajoSavings, setAjoSavings] = useState<any[]>([]);
  const [targetSavings, setTargetSavings] = useState<any[]>([]);
  const [safeLock, setSafeLock] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getInvestments();
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const ajoRes = await fetch('/api/investments/ajo', { headers: { 'Authorization': `Bearer ${token}` } });
      if (ajoRes.ok) setAjoSavings(Array.isArray(await ajoRes.json()) ? await ajoRes.json() : []);
      
      const targetRes = await fetch('/api/investments/target-savings', { headers: { 'Authorization': `Bearer ${token}` } });
      if (targetRes.ok) setTargetSavings(Array.isArray(await targetRes.json()) ? await targetRes.json() : []);
      
      const safeLockRes = await fetch('/api/investments/safelock', { headers: { 'Authorization': `Bearer ${token}` } });
      if (safeLockRes.ok) setSafeLock(Array.isArray(await safeLockRes.json()) ? await safeLockRes.json() : []);
    } catch (error) {
      console.error('Error fetching savings data:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Portfolio">
        <div className={styles.loading}>
          <i className={`fas fa-spinner fa-spin ${styles.spinner}`}></i>
        </div>
      </DashboardLayout>
    );
  }

  const totalInvested = stats.totalInvestments || 0;
  const totalAjo = ajoSavings.reduce((sum, a) => sum + (Number(a.ContributionAmount) || 0), 0);
  const totalTargetSavings = targetSavings.reduce((sum, t) => sum + (Number(t.TargetAmount) || 0), 0);
  const totalSafeLock = safeLock.reduce((sum, s) => sum + (Number(s.Amount) || 0), 0);
  const grandTotal = totalInvested + totalAjo + totalTargetSavings + totalSafeLock;

  return (
    <DashboardLayout title="My Portfolio">
      <main className={styles.portfolioPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Portfolio</h1>
            <p className={styles.subtitle}>Track all your investments and savings in one place</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ animationDelay: '0.1s' }}>
              <div className={styles.statValue}>₦{grandTotal.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
              <div className={styles.statLabel}>Total Portfolio</div>
            </div>
            <div className={styles.statCard} style={{ animationDelay: '0.2s' }}>
              <div className={styles.statValue}>{investments.length + ajoSavings.length + targetSavings.length + safeLock.length}</div>
              <div className={styles.statLabel}>Active Products</div>
            </div>
            <div className={styles.statCard} style={{ animationDelay: '0.3s' }}>
              <div className={styles.statValue}>₦{totalInvested.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
              <div className={styles.statLabel}>Properties</div>
            </div>
            <div className={styles.statCard} style={{ animationDelay: '0.4s' }}>
              <div className={styles.statValue}>₦{(totalAjo + totalTargetSavings + totalSafeLock).toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
              <div className={styles.statLabel}>Savings</div>
            </div>
          </div>

          <div className={styles.tabNavigation}>
            {['overview', 'properties', 'ajo', 'target', 'safelock'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'properties' ? 'Properties' : tab === 'ajo' ? 'Ajo Savings' : tab === 'target' ? 'Target Savings' : 'SafeLock'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className={styles.mainContent}>
              <div>
                <div className={styles.card} style={{ animationDelay: '0.5s' }}>
                  <h3 className={styles.cardTitle}>Portfolio Breakdown</h3>
                  <div className={styles.breakdownGrid}>
                    <div className={styles.breakdownItem}>
                      <div className={styles.breakdownLabel}>Property Investments</div>
                      <div className={styles.breakdownValue}>₦{totalInvested.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
                      <div className={styles.breakdownCount}>{investments.length} Active</div>
                    </div>
                    <div className={styles.breakdownItem}>
                      <div className={styles.breakdownLabel}>Ajo Savings</div>
                      <div className={styles.breakdownValue}>₦{totalAjo.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
                      <div className={styles.breakdownCount}>{ajoSavings.length} Active</div>
                    </div>
                    <div className={styles.breakdownItem}>
                      <div className={styles.breakdownLabel}>Target Savings</div>
                      <div className={styles.breakdownValue}>₦{totalTargetSavings.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
                      <div className={styles.breakdownCount}>{targetSavings.length} Active</div>
                    </div>
                    <div className={styles.breakdownItem}>
                      <div className={styles.breakdownLabel}>SafeLock</div>
                      <div className={styles.breakdownValue}>₦{totalSafeLock.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
                      <div className={styles.breakdownCount}>{safeLock.length} Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className={styles.card} style={{ animationDelay: '0.5s' }}>
              <h3 className={styles.cardTitle}>Property Investments</h3>
              {investments.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className={`fas fa-building ${styles.emptyIcon}`}></i>
                  <div>No property investments yet</div>
                  <a href="/listings" className={styles.emptyLink}>Start investing</a>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {investments.map((inv: any) => (
                    <div key={inv.Id_invest} className={styles.listItem}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>{inv.property?.[0]?.Title || 'Property'}</div>
                        <div className={styles.itemBadge}>Active</div>
                      </div>
                      <div className={styles.itemDetails}>
                        <span>₦{Number(inv.share_cost).toLocaleString()}</span>
                        <span>{inv.interest}% p.a</span>
                        <span>{inv.period} months</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ajo' && (
            <div className={styles.card} style={{ animationDelay: '0.5s' }}>
              <h3 className={styles.cardTitle}>Ajo Savings</h3>
              {ajoSavings.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className={`fas fa-users ${styles.emptyIcon}`}></i>
                  <div>No Ajo savings yet</div>
                  <a href="/ajo/onboard" className={styles.emptyLink}>Start Ajo</a>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {ajoSavings.map((ajo: any) => (
                    <div key={ajo.Id} className={styles.listItem}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>{ajo.Type === 'group' ? 'Group Ajo' : 'Personal Ajo'}</div>
                        <div className={styles.itemBadge}>Active</div>
                      </div>
                      <div className={styles.itemDetails}>
                        <span>₦{Number(ajo.ContributionAmount).toLocaleString()}</span>
                        <span>{ajo.Frequency}</span>
                        <span>{ajo.Duration} months</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'target' && (
            <div className={styles.card} style={{ animationDelay: '0.5s' }}>
              <h3 className={styles.cardTitle}>Target Savings</h3>
              {targetSavings.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className={`fas fa-bullseye ${styles.emptyIcon}`}></i>
                  <div>No target savings yet</div>
                  <a href="/target-savings/onboard" className={styles.emptyLink}>Create Goal</a>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {targetSavings.map((target: any) => {
                    const progress = Math.min((Number(target.MonthlyAmount) / Number(target.TargetAmount)) * 100, 100);
                    return (
                      <div key={target.Id} className={styles.listItem}>
                        <div className={styles.itemHeader}>
                          <div className={styles.itemTitle}>{target.GoalName}</div>
                          <div className={styles.itemBadge}>{Math.round(progress)}%</div>
                        </div>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className={styles.itemDetails}>
                          <span>₦{Number(target.TargetAmount).toLocaleString()}</span>
                          <span>₦{Number(target.MonthlyAmount).toLocaleString()}/month</span>
                          <span>{target.Duration} months</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'safelock' && (
            <div className={styles.card} style={{ animationDelay: '0.5s' }}>
              <h3 className={styles.cardTitle}>SafeLock</h3>
              {safeLock.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className={`fas fa-lock ${styles.emptyIcon}`}></i>
                  <div>No SafeLock yet</div>
                  <a href="/safelock/onboard" className={styles.emptyLink}>Lock Savings</a>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {safeLock.map((lock: any) => (
                    <div key={lock.Id} className={styles.listItem}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>SafeLock</div>
                        <div className={styles.itemBadge}>Locked</div>
                      </div>
                      <div className={styles.itemDetails}>
                        <span>₦{Number(lock.Amount).toLocaleString()}</span>
                        <span>{lock.InterestRate}% p.a</span>
                        <span>{lock.LockPeriod} months</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Portfolio;

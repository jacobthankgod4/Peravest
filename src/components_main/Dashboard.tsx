import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { investmentService } from '../services/investmentService';
import { withdrawalService } from '../services/withdrawalService';
import { useAuth } from '../contexts/AuthContext';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import PropertyCard from '../pages/PropertyCard';
import styles from './Dashboard.module.css';

interface FeaturedProperty {
  id: string;
  title: string;
  address: string;
  image: string;
  shareCost: number;
  interest: number;
  percent: number;
  investors: number;
  raised: number;
}

interface Investment {
  Id_invest: number;
  share_cost: number;
  interest: number;
  period: number;
  start_date: string;
  property: Array<{ Title: string; Images: string; property_image?: Array<{ Image_Url: string; Display_Order: number }> }>;
  package: Record<string, any>;
}

interface DashboardStats {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  activeCount: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<'verified' | 'pending' | 'not_verified'>('not_verified');
  const [balance, setBalance] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);


  useEffect(() => {
    console.group('🔍 KYC Status Debug');
    console.log('Current KYC Status:', kycStatus);
    console.log('Should Show KYC Button:', kycStatus !== 'verified');
    console.log('Button Condition (kycStatus !== "verified"):', kycStatus !== 'verified');
    console.groupEnd();
  }, [kycStatus]);

  const fetchFeaturedProperties = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*, property_image(Image_Url, Display_Order), investment_package(Share_Cost, Interest_Rate)')
        .eq('Status', 'active')
        .eq('is_deleted', false)
        .limit(3);

      if (error || !data) return;

      const mapped: FeaturedProperty[] = data.map((p: any) => {
        const imageUrls: string[] = [];
        if (p.property_image && Array.isArray(p.property_image) && p.property_image.length > 0) {
          imageUrls.push(...p.property_image
            .sort((a: any, b: any) => a.Display_Order - b.Display_Order)
            .map((img: any) => img.Image_Url));
        } else if (p.Images?.trim()) {
          imageUrls.push(p.Images);
        }
        if (imageUrls.length === 0) imageUrls.push('/i/1.jpg');

        const pkg = Array.isArray(p.investment_package) && p.investment_package.length > 0 ? p.investment_package[0] : null;

        return {
          id: p.Id,
          title: p.Title,
          address: p.Address,
          image: imageUrls.join(','),
          shareCost: pkg ? Number(pkg.Share_Cost) : 5000,
          interest: pkg ? Number(pkg.Interest_Rate) : 25,
          percent: 0,
          investors: 0,
          raised: 0
        };
      });

      setFeaturedProperties(mapped);
    } catch (err: any) {
      console.error('[Dashboard] Featured properties error:', err);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      if (user) {
        console.group('🔍 Loading KYC Status');
        console.log('User ID:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('kyc_status')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('❌ KYC Query Error:', profileError);
          console.error('Error Code:', profileError.code);
          console.error('Error Message:', profileError.message);
          setKycStatus('not_verified');
        } else {
          console.log('✅ Profile Data:', profile);
          console.log('Raw KYC Status from DB:', profile?.kyc_status);
          
          const statusMap: Record<string, 'verified' | 'pending' | 'not_verified'> = {
            'approved': 'verified',
            'pending': 'pending',
            'submitted': 'pending',
            'rejected': 'not_verified',
            'not_started': 'not_verified'
          };
          
          const mappedStatus = statusMap[profile?.kyc_status] || 'not_verified';
          console.log('📄 Setting KYC to:', mappedStatus);
          setKycStatus(mappedStatus);
        }
        console.groupEnd();
      }

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
      console.error('❌ Failed to load dashboard');
      const errorMsg = error?.message || 'Unknown error';
      if (typeof errorMsg === 'string' && errorMsg.length < 200) {
        console.error('Error:', errorMsg.replace(/[\n\r]/g, ' '));
      }
      setBalance(0);
      setInvestments([]);
      setKycStatus('not_verified');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user, loadDashboardData]);

  const calculateInterest = (inv: Investment) => {
    return Number(inv.interest || 0);
  };

  const calculatePortfolioStats = useCallback((): DashboardStats => {
    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.share_cost || 0), 0);
    const totalReturns = investments.reduce((sum, inv) => sum + calculateInterest(inv), 0);
    const currentValue = totalInvested + totalReturns;
    const activeCount = investments.length;
    return { totalInvested, currentValue, totalReturns, activeCount };
  }, [investments]);

  const portfolioStats = useMemo(() => calculatePortfolioStats(), [calculatePortfolioStats]);

  const generateRecentActivities = useCallback(() => {
    return investments.slice(0, 5).map((inv) => ({
      id: inv.Id_invest,
      type: 'investment' as const,
      title: `Invested in ${inv.property?.[0]?.Title || 'Property'}`,
      amount: Number(inv.share_cost),
      date: inv.start_date,
      icon: 'fas fa-arrow-up',
      color: '#09c398'
    }));
  }, [investments]);

  const recentActivities = useMemo(() => generateRecentActivities(), [generateRecentActivities]);

  const calculateProgress = (inv: Investment) => {
    const start = new Date(inv.start_date).getTime();
    const months = inv.period || 12;
    const end = start + (months * 30 * 24 * 60 * 60 * 1000);
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getInvestmentImageUrl = (inv: Investment): string => {
    const prop = inv.property?.[0];
    if (!prop) return '/i/1.jpg';
    const imgs: Array<{ Image_Url: string; Display_Order: number }> = prop.property_image || [];
    if (imgs.length > 0) {
      return [...imgs].sort((a, b) => a.Display_Order - b.Display_Order)[0].Image_Url;
    }
    return prop.Images?.trim() || '/i/1.jpg';
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

        {/* Balance Card */}
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
          <div className={styles.balanceSubRow}>
            <span>Total Invested: ₦{portfolioStats.totalInvested.toLocaleString()}</span>
            <span>{investments.length} Active</span>
          </div>
          <div className={styles.balanceChart}>
            <div className={styles.chartDot}></div>
            <div className={styles.chartBar1}></div>
            <div className={styles.chartBar2}></div>
            <div className={styles.chartBar3}></div>
          </div>
        </div>

        {/* Header Bar */}
        <div className={styles.headerBar}>
          <i className="fas fa-arrow-left headerIcon" aria-label="Back" />
          <div className={styles.headerTitle}>Flex Naira</div>
          <i className="fas fa-info-circle headerIcon" aria-label="Info" />
        </div>

        {/* Top Badges */}
        <div className={styles.badgesRow}>
          <div className={`${styles.badge} ${kycStatus === 'verified' ? styles.badgeVerified : kycStatus === 'pending' ? styles.badgePending : styles.badgeNotVerified}`}>
            {kycStatus === 'verified' ? 'KYC Verified' : kycStatus === 'pending' ? 'KYC Pending' : 'KYC Not Verified'}
          </div>
          <div className={`${styles.badge} ${styles.badgePremium}`}>Premium</div>
        </div>

        {/* KYC Status Alert */}
        {kycStatus !== 'verified' && (
          <div className={`${styles.kycAlert} ${kycStatus === 'pending' ? styles.kycAlertPending : styles.kycAlertWarning}`}>
            <i className={`fas ${kycStatus === 'pending' ? 'fa-hourglass-half' : 'fa-exclamation-circle'}`} aria-hidden="true" />
            <div className={styles.kycAlertContent}>
              <h4>{kycStatus === 'pending' ? 'KYC Verification Pending' : 'Complete Your KYC Verification'}</h4>
              <p>{kycStatus === 'pending' ? 'Your KYC is under review. This usually takes 24-48 hours.' : 'Verify your identity to unlock full features and higher withdrawal limits.'}</p>
            </div>
            <Link to="/kyc" className={styles.kycAlertBtn}>
              {kycStatus === 'pending' ? 'View Status' : 'Complete KYC'}
            </Link>
          </div>
        )}

        {/* Primary Actions */}
        <div className={styles.primaryActions}>
          <Link to="/listings" className={`${styles.primaryActionBtn} ${styles.addMoneyBtn}`} aria-label="Add Money">
            <i className="fas fa-plus" aria-hidden="true" />
            <span>Invest Now</span>
          </Link>
          <Link to="/withdrawal" className={`${styles.primaryActionBtn} ${styles.withdrawBtn}`} aria-label="Withdraw">
            <i className="fas fa-money-bill-wave" aria-hidden="true" />
            <span>Withdraw</span>
          </Link>
          <Link to="/referral" className={`${styles.primaryActionBtn} ${styles.referralBtn}`} aria-label="Refer and Earn">
            <i className="fas fa-share-alt" aria-hidden="true" />
            <span>Refer & Earn</span>
          </Link>
          {kycStatus !== 'verified' && (
            <Link to="/kyc" className={`${styles.primaryActionBtn} ${styles.kycBtn}`} aria-label="Complete KYC">
              <i className="fas fa-shield-alt" aria-hidden="true" />
              <span>{kycStatus === 'pending' ? 'KYC Pending' : 'Complete KYC'}</span>
            </Link>
          )}
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
        <ActivityFeed activities={recentActivities} />

        {/* Featured Properties */}
        <div className={styles.investmentsSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className={styles.sectionTitle}>Featured Properties</h2>
            <Link to="/listings" style={{ color: '#09c398', fontWeight: 600, fontSize: '0.9rem' }}>View All</Link>
          </div>
          {featuredLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading properties...</div>
          ) : featuredProperties.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <i className="fas fa-building" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', color: '#09c398' }}></i>
              No properties available
            </div>
          )}
        </div>

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
                        src={getInvestmentImageUrl(inv)}
                        className={styles.investmentImage}
                        alt={inv.property?.[0]?.Title}
                        onError={(e) => { e.currentTarget.src = '/i/1.jpg'; }}
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
                          className={styles.withdrawFundsBtn}
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

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { investmentService } from '../services/investmentService';
import { withdrawalService } from '../services/withdrawalService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import PropertyCard from './PropertyCard';
import styles from './Dashboard.module.css';
import '../styles/design-tokens.css';

interface Investment {
  Id_invest: number;
  share_cost: number;
  interest: number;
  period: number;
  start_date: string;
  property: any;
  package: any;
}

interface Property {
  Id: number;
  Title: string;
  Address: string;
  Images: string;
  Price: number;
  Status: string;
  _resolvedImage: string;
  _shareCost: number;
  _interestRate: number;
  _percent: number;
  _investors: number;
  _raised: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadDashboardData();
        fetchProperties();
      } else {
        setLoading(false);
      }
    });
    checkSuccessMessage();
  }, []);

  const checkSuccessMessage = () => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    if (success) {
      const messages: Record<string, string> = {
        investment: '✓ Investment successful! Your property investment is now active.',
        ajo: '✓ Ajo savings created! Your first contribution has been recorded.',
        'target-savings': '✓ Target savings goal created! You\'re on your way to achieving your goal.',
        safelock: '✓ Funds locked successfully! Your SafeLock is now active.'
      };
      setSuccessMessage(messages[success] || '✓ Transaction successful!');
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, '', '/dashboard');
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*, property_image(Image_Url, Display_Order), investment_package(Share_Cost, Interest_Rate)')
        .eq('Status', 'active')
        .limit(10);

      if (error || !data) return;

      const mapped = data.map((p: any) => {
        const imageUrls: string[] = [];
        if (p.property_image?.length > 0) {
          imageUrls.push(...[...p.property_image]
            .sort((a: any, b: any) => a.Display_Order - b.Display_Order)
            .map((img: any) => img.Image_Url));
        } else if (p.Images?.trim()) {
          imageUrls.push(p.Images.trim());
        } else {
          imageUrls.push('/i/1.jpg');
        }

        const pkg = Array.isArray(p.investment_package) && p.investment_package.length > 0 ? p.investment_package[0] : null;

        return {
          ...p,
          _resolvedImage: imageUrls.join(','),
          _shareCost: pkg ? Number(pkg.Share_Cost) : 5000,
          _interestRate: pkg ? Number(pkg.Interest_Rate) : 25,
          _percent: 0,
          _investors: 0,
          _raised: 0
        };
      });

      setProperties(mapped);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [balanceRes, investmentsRes] = await Promise.all([
        withdrawalService.getAvailableBalance(),
        investmentService.getUserInvestments()
      ]);
      
      setBalance(balanceRes.data.balance);
      setInvestments(investmentsRes.data);
    } catch (error: any) {
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

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p style={{ marginTop: '1rem' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const portfolioStats = calculatePortfolioStats();

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/listings', icon: 'fas fa-building', label: 'Properties' },
    { path: '/portfolio', icon: 'fas fa-chart-pie', label: 'Portfolio' },
    { path: '/ajo', icon: 'fas fa-users', label: 'Ajo Savings' },
    { path: '/target-savings', icon: 'fas fa-bullseye', label: 'Target Savings' },
    { path: '/safelock', icon: 'fas fa-lock', label: 'SafeLock' },
    { path: '/withdrawal', icon: 'fas fa-money-bill-wave', label: 'Withdraw' },
    { path: '/refer', icon: 'fas fa-gift', label: 'Refer & Earn' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className={styles.sidebar} style={{ width: sidebarOpen ? '250px' : '0' }}>
        <div className={styles.sidebarHeader}>
          <img src="/assets/img/logo/logo_a.png" alt="PeraVest" style={{ height: '40px' }} />
        </div>
        
        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`${styles.navItem} ${window.location.pathname === item.path ? styles.active : ''}`}
              aria-current={window.location.pathname === item.path ? 'page' : undefined}
            >
              <i className={item.icon} aria-hidden="true"></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            onClick={logout}
            className={styles.logoutBtn}
            aria-label="Logout from your account"
          >
            <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={styles.hamburger}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className={styles.headerTitle}>
            <h1>Welcome, {user?.name || user?.email?.split('@')[0]}</h1>
          </div>

          <div className={styles.headerActions}>
            <Link 
              to="/notifications" 
              className={styles.notificationBtn}
              aria-label="View notifications"
            >
              <i className="fas fa-bell" aria-hidden="true"></i>
            </Link>
            <button
              className={styles.profileBtn}
              aria-label="Open user menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={styles.content}>
          {/* Success Message */}
          {successMessage && (
            <div className={styles.successMessage} role="alert">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                className={styles.dismissBtn}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          <div className={styles.container}>

            {/* PRIMARY SECTION: Portfolio Stats (Hero) */}
            <section className={styles.heroSection} aria-labelledby="portfolio-heading">
              <h2 id="portfolio-heading" className={styles.sectionHeading}>Your Portfolio</h2>
              <div className={styles.portfolioGrid}>
                <StatCard 
                  icon="fas fa-wallet"
                  title="Total Invested"
                  value={showBalance ? `₦${portfolioStats.totalInvested.toLocaleString('en-NG')}` : '₦••••••'}
                  color="#09c398"
                />
                <StatCard 
                  icon="fas fa-chart-line"
                  title="Current Value"
                  value={showBalance ? `₦${portfolioStats.currentValue.toLocaleString('en-NG')}` : '₦••••••'}
                  color="#0d6efd"
                />
                <StatCard 
                  icon="fas fa-coins"
                  title="Total Returns"
                  value={showBalance ? `₦${portfolioStats.totalReturns.toLocaleString('en-NG')}` : '₦••••••'}
                  color="#6f42c1"
                />
                <StatCard 
                  icon="fas fa-chart-bar"
                  title="Active Investments"
                  value={portfolioStats.activeCount.toString()}
                  color="#fd7e14"
                />
              </div>
            </section>

            {/* SECONDARY SECTION: Available Balance */}
            <section className={styles.balanceSection} aria-labelledby="balance-heading">
              <div className={styles.balanceCard}>
                <div className={styles.balanceHeader}>
                  <h3 id="balance-heading">Available Balance</h3>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className={styles.toggleBalanceBtn}
                    aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    title={showBalance ? 'Hide balance' : 'Show balance'}
                  >
                    <i className={`fas fa-eye${showBalance ? '' : '-slash'}`} aria-hidden="true"></i>
                  </button>
                </div>
                <div className={styles.balanceAmount}>
                  {showBalance ? `₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '₦••••••'}
                </div>
              </div>
            </section>

            {/* PRIMARY ACTIONS */}
            <section className={styles.actionsSection} aria-labelledby="actions-heading">
              <h2 id="actions-heading" className={styles.sectionHeading}>Quick Actions</h2>
              <div className={styles.primaryActions}>
                <Link to="/listings" className={styles.primaryActionBtn} aria-label="Start investing in properties">
                  <i className="fas fa-chart-line" aria-hidden="true"></i>
                  <span>Invest Now</span>
                </Link>
                <Link to="/withdrawal" className={styles.primaryActionBtn} aria-label="Withdraw your funds">
                  <i className="fas fa-money-bill-wave" aria-hidden="true"></i>
                  <span>Withdraw</span>
                </Link>
                <Link to="/refer" className={styles.primaryActionBtn} aria-label="Refer and earn">
                  <i className="fas fa-gift" aria-hidden="true"></i>
                  <span>Refer & Earn</span>
                </Link>
                <Link to="/kyc" className={styles.primaryActionBtn} aria-label="Complete KYC verification">
                  <i className="fas fa-shield-alt" aria-hidden="true"></i>
                  <span>KYC</span>
                </Link>
                <Link to="/profile" className={styles.primaryActionBtn} aria-label="View your profile">
                  <i className="fas fa-user" aria-hidden="true"></i>
                  <span>Profile</span>
                </Link>
              </div>
            </section>

            {/* Recent Activity */}
            <section className={styles.activitySection} aria-labelledby="activity-heading">
              <h2 id="activity-heading" className={styles.sectionHeading}>Recent Activity</h2>
              <ActivityFeed activities={generateRecentActivities()} />
            </section>

            {/* Empty State */}
            {investments.length === 0 && (
              <section className={styles.emptyStateSection} aria-labelledby="empty-heading">
                <div className={styles.emptyState}>
                  <i className="fas fa-chart-line" aria-hidden="true"></i>
                  <h3 id="empty-heading">Ready to grow your wealth?</h3>
                  <p>Start with our beginner-friendly investment packages</p>
                  <Link to="/listings" className={styles.emptyStateBtn}>
                    Browse Properties
                  </Link>
                </div>
              </section>
            )}

            {/* Properties Grid */}
            {properties.length > 0 && (
              <section className={styles.carouselSection} aria-labelledby="carousel-heading">
                <h2 id="carousel-heading" className={styles.sectionHeading}>Featured Properties</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                  {properties.map((prop) => (
                    <PropertyCard
                      key={prop.Id}
                      property={{
                        id: String(prop.Id),
                        title: prop.Title,
                        address: prop.Address,
                        image: prop._resolvedImage,
                        shareCost: prop._shareCost,
                        interest: prop._interestRate,
                        percent: prop._percent,
                        investors: prop._investors,
                        raised: prop._raised
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

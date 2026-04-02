import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { investmentService } from '../services/investmentService';
import { withdrawalService } from '../services/withdrawalService';
import { supabase } from '../lib/supabase';
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

interface Property {
  Id: number;
  Title: string;
  Address: string;
  Images: string;
  Price: number;
  Status: string;
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
    fetchProperties();
    checkSuccessMessage();
  }, []);

  const checkSuccessMessage = () => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    if (success) {
      const messages: Record<string, string> = {
        investment: '🎉 Investment successful! Your property investment is now active.',
        ajo: '🎉 Ajo savings created! Your first contribution has been recorded.',
        'target-savings': '🎉 Target savings goal created! You\'re on your way to achieving your goal.',
        safelock: '🎉 Funds locked successfully! Your SafeLock is now active.'
      };
      setSuccessMessage(messages[success] || '🎉 Transaction successful!');
      setTimeout(() => setSuccessMessage(''), 8000);
      window.history.replaceState({}, '', '/dashboard');
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*')
        .eq('Status', 'active')
        .limit(10);
      if (error) throw error;
      setProperties(data || []);
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
      <div style={{
        width: sidebarOpen ? '250px' : '0',
        background: '#0e2e50',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1a3a5c' }}>
          <img src="/assets/img/logo/logo_a.png" alt="PeraVest" style={{ height: '40px' }} />
        </div>
        
        <nav style={{ padding: '20px 0' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: window.location.pathname === item.path ? '#09c398' : '#fff',
                textDecoration: 'none',
                background: window.location.pathname === item.path ? 'rgba(9, 195, 152, 0.1)' : 'transparent',
                borderRight: window.location.pathname === item.path ? '3px solid #09c398' : 'none'
              }}
            >
              <i className={item.icon} style={{ marginRight: '12px', width: '20px' }}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #1a3a5c',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
            Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '0' }}>
        {/* Header */}
        <header style={{
          height: '60px',
          background: '#fff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              marginRight: '20px'
            }}
          >
            ☰
          </button>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '18px', color: '#0e2e50' }}>
              Welcome, {user?.name || user?.email?.split('@')[0]}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/notifications" style={{ fontSize: '18px', color: '#666' }}>
              🔔
            </Link>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: '#09c398',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold'
            }}>
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{ padding: '20px' }}>
          {successMessage && (
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <i className="fas fa-check-circle" style={{ fontSize: '1.5rem' }}></i>
              <span style={{ flex: 1, fontWeight: 500 }}>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ×
              </button>
            </div>
          )}
          <div className={styles.container}>
            {/* Portfolio Summary */}
            <div className={styles.portfolioSummary}>
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
            </div>

            {/* Balance Card */}
            <div className={styles.balanceCard}>
              <div className={styles.balanceLabel}>
                My Balance
                <span className={styles.eyeIcon} onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? '👁️' : '👁️🗨️'}
                </span>
              </div>
              <h1 className={styles.balanceAmount}>
                {showBalance ? `₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '₦••••••'}
              </h1>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <Link to="/listings" className={styles.actionBtn}>
                <span>Invest Now</span>
                <div className={styles.actionIcon}><i className="fas fa-chart-line"></i></div>
              </Link>
              <Link to="/withdrawal" className={styles.actionBtn}>
                <span>Withdraw</span>
                <div className={styles.actionIcon}><i className="fas fa-money-bill-wave"></i></div>
              </Link>
              <Link to="/refer" className={styles.actionBtn}>
                <span>Refer & Earn</span>
                <div className={styles.actionIcon}><i className="fas fa-users"></i></div>
              </Link>
              <Link to="/kyc" className={styles.actionBtn}>
                <span>Complete KYC</span>
                <div className={styles.actionIcon}><i className="fas fa-shield-alt"></i></div>
              </Link>
            </div>

            {/* Recent Activity */}
            <ActivityFeed activities={generateRecentActivities()} />

            {/* Empty State */}
            {investments.length === 0 && (
              <div className={styles.emptyState}>
                <i className="fas fa-chart-line" style={{ fontSize: '3rem', color: '#09c398', marginBottom: '1rem' }}></i>
                <p>No investments yet. Start investing today!</p>
              </div>
            )}

            {/* Properties Carousel */}
            {properties.length > 0 && (
              <div className={styles.carouselSection}>
                <h3 className={styles.carouselTitle}>Featured Properties</h3>
                <div className={styles.carousel}>
                  <button className={styles.carouselBtn} onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))} disabled={carouselIndex === 0}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <div className={styles.carouselTrack}>
                    {properties.map((prop, idx) => (
                      <div key={prop.Id} className={styles.propertyCarouselCard} style={{ transform: `translateX(${(idx - carouselIndex) * 100}%)` }}>
                        <div className={styles.propertyImage}>
                          <img src={`/includes/admin/${prop.Images}`} alt={prop.Title} />
                        </div>
                        <div className={styles.propertyInfo}>
                          <h4>{prop.Title}</h4>
                          <p className={styles.propertyAddress}>
                            <i className="fas fa-map-marker-alt"></i> {prop.Address}
                          </p>
                          <div className={styles.propertyPrice}>₦{Number(prop.Price).toLocaleString()}</div>
                        </div>
                        <Link to={`/listings/${prop.Id}`} className={styles.packageBtn}>View Details</Link>
                      </div>
                    ))}
                  </div>
                  <button className={styles.carouselBtn} onClick={() => setCarouselIndex(Math.min(properties.length - 1, carouselIndex + 1))} disabled={carouselIndex === properties.length - 1}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

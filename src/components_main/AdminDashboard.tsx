import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardService, AdminStats as AdminStatsType, InvestorData } from '../services/adminDashboardService';
import AdminStats from '../components/admin/AdminStats';
import InvestmentsTable from '../components/admin/InvestmentsTable';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [investments, setInvestments] = useState<InvestorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [statsData, investmentsData] = await Promise.all([
        adminDashboardService.getAdminStats(),
        adminDashboardService.getAllInvestments()
      ]);
      
      setStats(statsData);
      setInvestments(investmentsData);
    } catch (error: any) {
      console.error('Failed to load admin dashboard:', error);
      setError(error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '40px' }}>⏳</div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '40px', color: '#d32f2f' }}>⚠️</div>
        <h3>Error Loading Dashboard</h3>
        <p style={{ color: '#666' }}>{error}</p>
        <button 
          onClick={loadDashboardData}
          style={{
            padding: '10px 20px',
            background: '#0e2e50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <span style={{ color: '#0e2e50', fontSize: '12px' }}>
          Total Investments 👁️
        </span>
        <h2 style={{ fontSize: '32px', margin: '10px 0' }}>
          {showBalance 
            ? `₦${(stats?.total_investment_value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}` 
            : '₦••••••'}
          <span 
            style={{ fontSize: '20px', marginLeft: '10px', cursor: 'pointer' }}
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? '👁️' : '👁️🗨️'}
          </span>
        </h2>
      </div>

      {stats && (
        <AdminStats
          totalInvestments={stats.total_investments}
          totalValue={stats.total_investment_value}
          activeInvestors={stats.active_investors}
          totalProperties={stats.total_properties}
          pendingWithdrawals={stats.pending_withdrawals}
          activeAjoGroups={stats.active_ajo_groups}
          totalUsers={stats.total_users}
          totalSafelock={stats.total_safelock}
          safelockValue={stats.safelock_value}
          totalTargetSavings={stats.total_target_savings}
          targetSavingsValue={stats.target_savings_value}
        />
      )}

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
        <Link to="/admin/properties" style={{
          padding: '12px 24px',
          background: '#0e2e50',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          PROPERTY →
        </Link>
        <Link to="/admin/users" style={{
          padding: '12px 24px',
          background: '#0e2e50',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          USERS →
        </Link>
        <Link to="/admin/ajo" style={{
          padding: '12px 24px',
          background: '#0e2e50',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          AJO GROUPS →
        </Link>
        <Link to="/admin/analytics" style={{
          padding: '12px 24px',
          background: '#0e2e50',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          ANALYTICS →
        </Link>
      </div>

      <div style={{ marginTop: '20px' }}>
        <InvestmentsTable investments={investments} />
      </div>
    </div>
  );
};

export default AdminDashboard;
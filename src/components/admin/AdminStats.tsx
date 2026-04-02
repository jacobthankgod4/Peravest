import React from 'react';

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const AdminStatCard: React.FC<StatCardProps> = ({ icon, title, value, color, trend }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '15px',
      padding: '1.5rem',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'transform 0.3s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '12px',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        <i className={icon}></i>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#757f95', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ color: '#0e2e50', fontSize: '1.75rem', fontWeight: 700 }}>
          {value}
        </div>
        {trend && (
          <div style={{ 
            color: trend.isPositive ? '#28a745' : '#dc3545', 
            fontSize: '0.875rem',
            marginTop: '0.25rem'
          }}>
            <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'}`}></i>
            {' '}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
};

interface AdminStatsProps {
  totalInvestments: number;
  totalValue: number;
  activeInvestors: number;
  totalProperties: number;
  pendingWithdrawals: number;
  activeAjoGroups: number;
  totalUsers: number;
  totalSafelock?: number;
  safelockValue?: number;
  totalTargetSavings?: number;
  targetSavingsValue?: number;
  realEstateCount?: number;
  agricultureCount?: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({
  totalInvestments,
  totalValue,
  activeInvestors,
  totalProperties,
  pendingWithdrawals,
  activeAjoGroups,
  totalUsers,
  totalSafelock = 0,
  safelockValue = 0,
  totalTargetSavings = 0,
  targetSavingsValue = 0,
  realEstateCount = 0,
  agricultureCount = 0
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      <AdminStatCard
        icon="fas fa-chart-line"
        title="Total Investments"
        value={totalInvestments}
        color="#09c398"
      />
      
      <AdminStatCard
        icon="fas fa-money-bill-wave"
        title="Total Value"
        value={`₦${totalValue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
        color="#0d6efd"
      />
      
      <AdminStatCard
        icon="fas fa-users"
        title="Active Investors"
        value={activeInvestors}
        color="#28a745"
      />
      
      <AdminStatCard
        icon="fas fa-building"
        title="🏠 Real Estate"
        value={realEstateCount}
        color="#0e2e50"
      />
      
      <AdminStatCard
        icon="fas fa-seedling"
        title="🌾 Agriculture"
        value={agricultureCount}
        color="#2d5016"
      />
      
      <AdminStatCard
        icon="fas fa-clock"
        title="Pending Withdrawals"
        value={pendingWithdrawals}
        color="#dc3545"
      />
      
      <AdminStatCard
        icon="fas fa-user-friends"
        title="Ajo Groups"
        value={activeAjoGroups}
        color="#6f42c1"
      />
      
      <AdminStatCard
        icon="fas fa-user-circle"
        title="Total Users"
        value={totalUsers}
        color="#17a2b8"
      />
      
      <AdminStatCard
        icon="fas fa-lock"
        title="SafeLock Accounts"
        value={totalSafelock}
        color="#e83e8c"
      />
      
      <AdminStatCard
        icon="fas fa-piggy-bank"
        title="SafeLock Value"
        value={`₦${safelockValue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
        color="#fd7e14"
      />
      
      <AdminStatCard
        icon="fas fa-bullseye"
        title="Target Savings"
        value={totalTargetSavings}
        color="#20c997"
      />
      
      <AdminStatCard
        icon="fas fa-coins"
        title="Target Savings Value"
        value={`₦${targetSavingsValue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
        color="#6610f2"
      />
    </div>
  );
};

export default AdminStats;
export { AdminStatCard };
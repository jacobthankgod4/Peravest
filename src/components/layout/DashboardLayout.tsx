import React, { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      <div style={{ flex: 1, marginLeft: '0' }}>
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
              {title || 'Dashboard'}
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

        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>1,234</p>
          </div>
          <div className="stat-card">
            <h3>Active Sessions</h3>
            <p>56</p>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p>$12,345</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
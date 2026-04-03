import React, { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { dashboardData, fetchDashboardData } = useAdmin();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData().finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Properties</h3>
          <p className="stat-value">{dashboardData?.totalProperties || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{dashboardData?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Investments</h3>
          <p className="stat-value">₦{dashboardData?.totalInvestments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Withdrawals</h3>
          <p className="stat-value">{dashboardData?.pendingWithdrawals || 0}</p>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/admin/add-property" className="btn btn-primary">Add Property</Link>
        <Link to="/admin/properties" className="btn btn-secondary">Manage Properties</Link>
        <Link to="/admin/subscribers" className="btn btn-secondary">View Subscribers</Link>
      </div>

      <div className="recent-activity">
        <h2>Recent Investments</h2>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData?.recentInvestments?.map((inv: any) => (
              <tr key={inv.id}>
                <td>{inv.userName}</td>
                <td>{inv.propertyName}</td>
                <td>₦{inv.amount}</td>
                <td>{new Date(inv.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

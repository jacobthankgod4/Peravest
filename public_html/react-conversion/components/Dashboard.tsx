import React, { useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';

interface DashboardStats {
  totalInvestments: number;
  activeInvestments: number;
  totalReturns: number;
  pendingWithdrawals: number;
}

interface RecentActivity {
  id: number;
  type: 'investment' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestments: 0,
    activeInvestments: 0,
    totalReturns: 0,
    pendingWithdrawals: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        investmentService.getStats(),
        investmentService.getRecentActivity(5)
      ]);
      
      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>Dashboard</h2>
          <p className="text-muted">Welcome back! Here's your investment overview.</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">₦{stats.totalInvestments.toLocaleString()}</h5>
              <p className="card-text">Total Investments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">{stats.activeInvestments}</h5>
              <p className="card-text">Active Investments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-info">₦{stats.totalReturns.toLocaleString()}</h5>
              <p className="card-text">Total Returns</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">₦{stats.pendingWithdrawals.toLocaleString()}</h5>
              <p className="card-text">Pending Withdrawals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Recent Activity</h5>
            </div>
            <div className="card-body">
              {recentActivity.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{activity.description}</h6>
                        <p className="mb-1">₦{activity.amount.toLocaleString()}</p>
                        <small className="text-muted">{new Date(activity.date).toLocaleDateString()}</small>
                      </div>
                      <span className={`badge bg-${activity.status === 'active' ? 'success' : activity.status === 'pending' ? 'warning' : 'secondary'}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
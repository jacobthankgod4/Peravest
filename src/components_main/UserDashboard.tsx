import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Investment {
  id: string;
  propertyTitle: string;
  amount: number;
  interest: number;
  period: number;
  startDate: string;
  status: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalReturns: 0,
    activeInvestments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [investmentsRes, statsRes] = await Promise.all([
        fetch('/api/user/investments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/user/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (investmentsRes.ok && statsRes.ok) {
        const investmentsData = await investmentsRes.json();
        const statsData = await statsRes.json();
        setInvestments(investmentsData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading dashboard...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2>Welcome back, {user?.name}</h2>
            <p className="text-muted">Manage your investments and track your portfolio</p>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5>Total Invested</h5>
                <h3>₦{stats.totalInvested.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5>Total Returns</h5>
                <h3>₦{stats.totalReturns.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5>Active Investments</h5>
                <h3>{stats.activeInvestments}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h5>My Investments</h5>
                <a href="/listings" className="btn btn-primary btn-sm">
                  New Investment
                </a>
              </div>
              <div className="card-body">
                {investments.length === 0 ? (
                  <p className="text-center text-muted">No investments yet</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Amount</th>
                          <th>Interest</th>
                          <th>Period</th>
                          <th>Start Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((investment) => (
                          <tr key={investment.id}>
                            <td>{investment.propertyTitle}</td>
                            <td>₦{investment.amount.toLocaleString()}</td>
                            <td>{investment.interest}%</td>
                            <td>{investment.period} months</td>
                            <td>{new Date(investment.startDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${
                                investment.status === 'active' ? 'bg-success' : 'bg-warning'
                              }`}>
                                {investment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
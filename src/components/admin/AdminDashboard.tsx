import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProperties: number;
  totalInvestments: number;
  totalInvestors: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalInvestments: 0,
    totalInvestors: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Admin Dashboard</h2>
          
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Properties</h5>
                  <h3>{stats.totalProperties}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Investments</h5>
                  <h3>₦{stats.totalInvestments.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Investors</h5>
                  <h3>{stats.totalInvestors}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Revenue</h5>
                  <h3>₦{stats.totalRevenue.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Property Management</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <Link to="/admin/properties" className="btn btn-outline-primary">
                      View All Properties
                    </Link>
                    <Link to="/admin/properties/add" className="btn btn-primary">
                      Add New Property
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Investment Management</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <Link to="/admin/investments" className="btn btn-outline-success">
                      View All Investments
                    </Link>
                    <Link to="/admin/withdrawals" className="btn btn-outline-warning">
                      Manage Withdrawals
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
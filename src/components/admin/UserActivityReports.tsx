import React, { useState, useEffect } from 'react';
import { analyticsAdminService } from '../../services/analyticsAdminService';
import Swal from 'sweetalert2';

const UserActivityReports: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const data = await analyticsAdminService.getUserActivityReport(
        dateRange.start && dateRange.end ? dateRange : undefined
      );
      setReport(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load activity report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await analyticsAdminService.exportReport('user-activity', dateRange);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_activity_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      Swal.fire('Success!', 'Report exported', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to export', 'error');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading report...</div>;
  if (!report) return null;

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>User Activity Reports</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="date" className="form-control" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} style={{ maxWidth: '200px' }} />
          <input type="date" className="form-control" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} style={{ maxWidth: '200px' }} />
          <button className="theme-btn" onClick={loadReport}>Apply</button>
          <button className="theme-btn" onClick={handleExport}>Export</button>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Users</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50' }}>{report.total_users}</div>
          <div style={{ fontSize: '0.75rem', color: '#28a745', marginTop: '0.5rem' }}>
            +{report.new_users} new users
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Active Users</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#09c398' }}>{report.active_users}</div>
          <div style={{ fontSize: '0.75rem', color: '#757f95', marginTop: '0.5rem' }}>
            {((report.active_users / report.total_users) * 100).toFixed(1)}% engagement
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Avg Session Time</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#667eea' }}>{report.avg_session_time}m</div>
          <div style={{ fontSize: '0.75rem', color: '#757f95', marginTop: '0.5rem' }}>
            per user session
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Sessions</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f5576c' }}>{report.total_sessions}</div>
          <div style={{ fontSize: '0.75rem', color: '#757f95', marginTop: '0.5rem' }}>
            {(report.total_sessions / report.total_users).toFixed(1)} per user
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <h5 style={{ marginBottom: '1rem' }}>User Actions</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Investments</span>
                <span style={{ fontWeight: 600 }}>{report.action_counts?.investments}</span>
              </div>
              <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(report.action_counts?.investments / report.action_counts?.total) * 100}%`, height: '100%', background: '#667eea' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Withdrawals</span>
                <span style={{ fontWeight: 600 }}>{report.action_counts?.withdrawals}</span>
              </div>
              <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(report.action_counts?.withdrawals / report.action_counts?.total) * 100}%`, height: '100%', background: '#f5576c' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>KYC Submissions</span>
                <span style={{ fontWeight: 600 }}>{report.action_counts?.kyc}</span>
              </div>
              <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(report.action_counts?.kyc / report.action_counts?.total) * 100}%`, height: '100%', background: '#09c398' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <h5 style={{ marginBottom: '1rem' }}>User Status</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <span>Verified Users</span>
              <span style={{ fontWeight: 600, color: '#28a745' }}>{report.verified_users}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <span>Pending Verification</span>
              <span style={{ fontWeight: 600, color: '#ffc107' }}>{report.pending_verification}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <span>Suspended Users</span>
              <span style={{ fontWeight: 600, color: '#dc3545' }}>{report.suspended_users}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Active Users */}
      <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
        <h5 style={{ marginBottom: '1rem' }}>Most Active Users</h5>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Sessions</th>
                <th>Investments</th>
                <th>Last Active</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.top_active_users?.map((user: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.session_count}</td>
                  <td>{user.investment_count}</td>
                  <td>{new Date(user.last_active).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: user.status === 'active' ? '#28a745' : '#ffc107',
                      color: '#fff'
                    }}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserActivityReports;

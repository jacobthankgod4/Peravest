import React, { useState, useEffect } from 'react';
import { analyticsAdminService } from '../../services/analyticsAdminService';
import Swal from 'sweetalert2';

const DashboardAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAdminService.getDashboardAnalytics(
        dateRange.start && dateRange.end ? dateRange : undefined
      );
      setAnalytics(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await analyticsAdminService.exportReport('dashboard', dateRange);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard_analytics_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      Swal.fire('Success!', 'Analytics exported', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to export', 'error');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading analytics...</div>;
  if (!analytics) return null;

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Dashboard Analytics</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="date" className="form-control" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} style={{ maxWidth: '200px' }} />
          <input type="date" className="form-control" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} style={{ maxWidth: '200px' }} />
          <button className="theme-btn" onClick={loadAnalytics}>Apply</button>
          <button className="theme-btn" onClick={handleExport}>Export</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₦{analytics.total_revenue?.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {analytics.revenue_growth > 0 ? '↑' : '↓'} {Math.abs(analytics.revenue_growth)}% from last period
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Investments</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{analytics.total_investments}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
            ₦{analytics.total_investment_value?.toLocaleString()} value
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Active Users</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{analytics.active_users}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {analytics.new_users} new this period
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Active Properties</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{analytics.active_properties}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {analytics.total_properties} total properties
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Investment Trends */}
        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <h5 style={{ marginBottom: '1rem' }}>Investment Trends</h5>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            {analytics.investment_trends?.map((item: any, idx: number) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', background: '#667eea', borderRadius: '4px 4px 0 0', height: `${(item.value / Math.max(...analytics.investment_trends.map((i: any) => i.value))) * 100}%`, minHeight: '20px' }}></div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Status */}
        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <h5 style={{ marginBottom: '1rem' }}>Transaction Status</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Completed</span>
              <div style={{ flex: 1, margin: '0 1rem', height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(analytics.completed_transactions / analytics.total_transactions) * 100}%`, height: '100%', background: '#28a745' }}></div>
              </div>
              <span style={{ fontWeight: 600 }}>{analytics.completed_transactions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pending</span>
              <div style={{ flex: 1, margin: '0 1rem', height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(analytics.pending_transactions / analytics.total_transactions) * 100}%`, height: '100%', background: '#ffc107' }}></div>
              </div>
              <span style={{ fontWeight: 600 }}>{analytics.pending_transactions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Failed</span>
              <div style={{ flex: 1, margin: '0 1rem', height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(analytics.failed_transactions / analytics.total_transactions) * 100}%`, height: '100%', background: '#dc3545' }}></div>
              </div>
              <span style={{ fontWeight: 600 }}>{analytics.failed_transactions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <h5 style={{ marginBottom: '1rem' }}>Top Properties</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.top_properties?.slice(0, 5).map((prop: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>{prop.title}</span>
                <span style={{ fontWeight: 600, color: '#09c398' }}>₦{prop.total_investment?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <h5 style={{ marginBottom: '1rem' }}>Top Investors</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.top_investors?.slice(0, 5).map((investor: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>{investor.name}</span>
                <span style={{ fontWeight: 600, color: '#667eea' }}>₦{investor.total_invested?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;

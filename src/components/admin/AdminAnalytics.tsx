import React, { useState, useEffect } from 'react';
import { adminAnalyticsService, MonthlyRevenue, PropertyPerformance, InvestmentDistribution } from '../../services/adminAnalyticsService';

const AdminAnalytics: React.FC = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [propertyPerformance, setPropertyPerformance] = useState<PropertyPerformance[]>([]);
  const [investmentDistribution, setInvestmentDistribution] = useState<InvestmentDistribution[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<any>(null);
  const [ajoAnalytics, setAjoAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [revenue, properties, distribution, growth, ajo] = await Promise.all([
        adminAnalyticsService.getMonthlyRevenue(6),
        adminAnalyticsService.getPropertyPerformance(),
        adminAnalyticsService.getInvestmentsByDuration(),
        adminAnalyticsService.getGrowthMetrics(),
        adminAnalyticsService.getAjoAnalytics()
      ]);

      setMonthlyRevenue(revenue);
      setPropertyPerformance(properties);
      setInvestmentDistribution(distribution);
      setGrowthMetrics(growth);
      setAjoAnalytics(ajo);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading analytics...</div>;
  }

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '2rem' }}>Analytics & Reports</h2>

        {/* Growth Metrics */}
        {growthMetrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Current Month Investments</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50' }}>
                {growthMetrics.current_month_investments}
              </div>
            </div>
            
            <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Last Month Investments</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50' }}>
                {growthMetrics.last_month_investments}
              </div>
            </div>
            
            <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Growth Rate</div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: growthMetrics.growth_percentage >= 0 ? '#28a745' : '#dc3545' 
              }}>
                {growthMetrics.growth_percentage >= 0 ? '+' : ''}{growthMetrics.growth_percentage}%
              </div>
            </div>
          </div>
        )}

        {/* Monthly Revenue Chart */}
        <div style={{ background: '#fff', borderRadius: '15px', padding: '2rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Monthly Revenue Trend</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', minWidth: '600px', height: '300px' }}>
              {monthlyRevenue.map((month, index) => {
                const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
                const height = (month.revenue / maxRevenue) * 250;
                
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      ₦{(month.revenue / 1000000).toFixed(1)}M
                    </div>
                    <div style={{
                      width: '100%',
                      height: `${height}px`,
                      background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    title={`₦${month.revenue.toLocaleString()} - ${month.investments_count} investments`}
                    ></div>
                    <div style={{ fontSize: '0.75rem', color: '#757f95', marginTop: '0.5rem' }}>
                      {month.month.split('-')[1]}/{month.month.split('-')[0].slice(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Investment Distribution */}
        <div style={{ background: '#fff', borderRadius: '15px', padding: '2rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Investment Distribution by Duration</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {investmentDistribution.map((dist, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{dist.duration} Months</span>
                  <span style={{ color: '#757f95' }}>
                    {dist.count} investments ({dist.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div style={{ background: '#f8f9fa', borderRadius: '10px', height: '30px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${dist.percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '0.5rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    ₦{(dist.total_value / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Performance */}
        <div style={{ background: '#fff', borderRadius: '15px', padding: '2rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Top Performing Properties</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Investments</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {propertyPerformance.slice(0, 10).map((property, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{property.property_title}</div>
                    </td>
                    <td>{property.total_investments}</td>
                    <td style={{ fontWeight: 600, color: '#09c398' }}>
                      ₦{property.total_value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ajo Analytics */}
        {ajoAnalytics && (
          <div style={{ background: '#fff', borderRadius: '15px', padding: '2rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Ajo Groups Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Groups</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50' }}>
                  {ajoAnalytics.total_groups}
                </div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Active Groups</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#28a745' }}>
                  {ajoAnalytics.active_groups}
                </div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Members</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0d6efd' }}>
                  {ajoAnalytics.total_members}
                </div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Contributions</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#09c398' }}>
                  ₦{(ajoAnalytics.total_contributions / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminAnalytics;
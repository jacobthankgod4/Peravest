import React, { useState, useEffect } from 'react';
import { analyticsAdminService } from '../../services/analyticsAdminService';
import Swal from 'sweetalert2';

const RevenueReports: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadReport();
  }, [period, year]);

  const loadReport = async () => {
    try {
      const data = await analyticsAdminService.getRevenueReport(period, year);
      setReport(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load revenue report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await analyticsAdminService.exportReport('revenue', { period, year });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue_report_${period}_${year}.json`;
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
        <h2>Revenue Reports</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="form-control" value={period} onChange={(e) => setPeriod(e.target.value as any)} style={{ maxWidth: '150px' }}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select className="form-control" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ maxWidth: '120px' }}>
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <button className="theme-btn" onClick={handleExport}>Export</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₦{report.total_revenue?.toLocaleString()}</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Investment Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₦{report.investment_revenue?.toLocaleString()}</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Fee Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₦{report.fee_revenue?.toLocaleString()}</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '15px', padding: '1.5rem', color: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Average Transaction</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₦{report.avg_transaction?.toLocaleString()}</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '1.5rem' }}>Revenue Breakdown</h5>
        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
          {report.breakdown?.map((item: any, idx: number) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>₦{item.value?.toLocaleString()}</div>
              <div style={{ width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px 4px 0 0', height: `${(item.value / Math.max(...report.breakdown.map((i: any) => i.value))) * 100}%`, minHeight: '30px' }}></div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
        <h5 style={{ marginBottom: '1rem' }}>Detailed Breakdown</h5>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Investment Revenue</th>
                <th>Fee Revenue</th>
                <th>Total Revenue</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {report.details?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.period}</td>
                  <td>₦{item.investment_revenue?.toLocaleString()}</td>
                  <td>₦{item.fee_revenue?.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₦{item.total_revenue?.toLocaleString()}</td>
                  <td>
                    <span style={{ color: item.growth >= 0 ? '#28a745' : '#dc3545', fontWeight: 600 }}>
                      {item.growth >= 0 ? '↑' : '↓'} {Math.abs(item.growth)}%
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

export default RevenueReports;

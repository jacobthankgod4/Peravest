import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface AuditLog {
  id: number;
  admin_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  old_value: any;
  new_value: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const logsPerPage = 20;

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const headers = ['Date', 'Admin ID', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = filteredLogs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.admin_id,
      log.action,
      log.entity_type,
      log.entity_id || 'N/A',
      log.ip_address || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesEntity = filterEntity === 'all' || log.entity_type === filterEntity;
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesEntity && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueEntities = [...new Set(logs.map(log => log.entity_type))];

  const getActionColor = (action: string) => {
    if (action.includes('create')) return '#28a745';
    if (action.includes('update')) return '#0d6efd';
    if (action.includes('delete')) return '#dc3545';
    return '#6c757d';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading audit logs...</div>;
  }

  return (
    <main className="main">
      <div className="container" style={{ padding: '2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Audit Logs</h2>
          <button onClick={exportLogs} className="theme-btn">
            <i className="fas fa-download"></i> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          
          <select
            className="form-control"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Entities</option>
            {uniqueEntities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
        </div>

        {/* Logs Table */}
        <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.875rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background: '#f8f9fa',
                        fontSize: '0.875rem'
                      }}>
                        Admin #{log.admin_id}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background: getActionColor(log.action),
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity_type}</td>
                    <td>{log.entity_id || 'N/A'}</td>
                    <td style={{ fontSize: '0.875rem', color: '#757f95' }}>
                      {log.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No audit logs found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="theme-btn"
                style={{ padding: '0.5rem 1rem' }}
              >
                Previous
              </button>
              <span style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="theme-btn"
                style={{ padding: '0.5rem 1rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Total Logs</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50' }}>{logs.length}</div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Today's Actions</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0d6efd' }}>
              {logs.filter(log => {
                const logDate = new Date(log.created_at).toDateString();
                const today = new Date().toDateString();
                return logDate === today;
              }).length}
            </div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Unique Admins</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#28a745' }}>
              {new Set(logs.map(log => log.admin_id)).size}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminAuditLogs;
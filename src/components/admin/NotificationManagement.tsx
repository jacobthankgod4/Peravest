import React, { useState, useEffect } from 'react';
import { communicationAdminService } from '../../services/communicationAdminService';
import { adminDashboardService } from '../../services/adminDashboardService';
import Swal from 'sweetalert2';

const NotificationManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [notification, setNotification] = useState({ title: '', message: '', type: 'info', scheduled_at: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, templatesData] = await Promise.all([
        adminDashboardService.getUsersList(),
        communicationAdminService.getNotificationTemplates()
      ]);
      setUsers(usersData);
      setTemplates(templatesData);
    } catch (error) {
      Swal.fire('Error', 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    if (!notification.title || !notification.message || selectedUsers.length === 0) {
      Swal.fire('Warning', 'Please fill all fields and select users', 'warning');
      return;
    }

    try {
      await communicationAdminService.sendNotification({
        user_ids: selectedUsers,
        title: notification.title,
        message: notification.message,
        type: notification.type
      });
      Swal.fire('Success!', `Notification sent to ${selectedUsers.length} users`, 'success');
      setNotification({ title: '', message: '', type: 'info', scheduled_at: '' });
      setSelectedUsers([]);
    } catch (error) {
      Swal.fire('Error', 'Failed to send notification', 'error');
    }
  };

  const handleSchedule = async () => {
    if (!notification.title || !notification.message || !notification.scheduled_at || selectedUsers.length === 0) {
      Swal.fire('Warning', 'Please fill all fields including schedule time', 'warning');
      return;
    }

    try {
      await communicationAdminService.scheduleNotification({
        user_ids: selectedUsers,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        scheduled_at: notification.scheduled_at
      });
      Swal.fire('Success!', 'Notification scheduled', 'success');
      setNotification({ title: '', message: '', type: 'info', scheduled_at: '' });
      setSelectedUsers([]);
    } catch (error) {
      Swal.fire('Error', 'Failed to schedule notification', 'error');
    }
  };

  const handleTemplateSelect = (template: any) => {
    setNotification({ ...notification, title: template.subject, message: template.body });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '2rem' }}>Notification Management</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Compose Section */}
        <div>
          <h5 style={{ marginBottom: '1rem' }}>Compose Notification</h5>
          
          {templates.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label>Use Template</label>
              <select className="form-control" onChange={(e) => handleTemplateSelect(templates[Number(e.target.value)])}>
                <option value="">Select template...</option>
                {templates.map((t, idx) => <option key={t.id} value={idx}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
              placeholder="Notification title"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Message</label>
            <textarea
              className="form-control"
              rows={5}
              value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })}
              placeholder="Notification message"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Type</label>
            <select className="form-control" value={notification.type} onChange={(e) => setNotification({ ...notification, type: e.target.value })}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Schedule (Optional)</label>
            <input
              type="datetime-local"
              className="form-control"
              value={notification.scheduled_at}
              onChange={(e) => setNotification({ ...notification, scheduled_at: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="theme-btn" onClick={handleSendNow}>Send Now</button>
            <button className="theme-btn" onClick={handleSchedule} style={{ background: '#17a2b8' }}>Schedule</button>
          </div>
        </div>

        {/* User Selection */}
        <div>
          <h5 style={{ marginBottom: '1rem' }}>Select Recipients ({selectedUsers.length} selected)</h5>
          
          <div style={{ marginBottom: '1rem' }}>
            <button className="theme-btn" onClick={() => setSelectedUsers(users.map(u => u.Id))} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Select All
            </button>
            <button className="theme-btn" onClick={() => setSelectedUsers([])} style={{ background: '#dc3545', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Clear All
            </button>
          </div>

          <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #e9ecef', borderRadius: '8px', padding: '1rem' }}>
            {users.map(user => (
              <div key={user.Id} style={{ padding: '0.5rem', borderBottom: '1px solid #f8f9fa' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.Id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.Id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.Id));
                      }
                    }}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.Name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#757f95' }}>{user.Email}</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;

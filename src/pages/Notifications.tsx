import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock notifications - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: 'Investment Successful',
          message: 'Your investment of ₦50,000 in Lekki Property has been processed successfully.',
          type: 'success',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: 'KYC Under Review',
          message: 'Your KYC documents are currently under review. We will notify you once approved.',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'Withdrawal Processed',
          message: 'Your withdrawal request of ₦25,000 has been processed and sent to your bank account.',
          type: 'success',
          read: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      default: return 'fas fa-info-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#0e2e50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <DashboardLayout title="Notifications">
      <main style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh', paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ color: '#0e2e50', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Notifications</h1>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Stay updated with your investment activities</p>
            </div>

            {/* Notifications List */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0e2e50' }}></i>
                  <div style={{ marginTop: '1rem', color: '#64748b' }}>Loading notifications...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <i className="fas fa-bell-slash" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No notifications yet</div>
                  <div style={{ fontSize: '0.9rem' }}>We'll notify you about important updates</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: notification.read ? '#fff' : '#f0f9ff',
                        cursor: notification.read ? 'default' : 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!notification.read) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!notification.read) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {!notification.read && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#0e2e50'
                        }}></div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `${getTypeColor(notification.type)}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className={getTypeIcon(notification.type)} style={{ 
                            color: getTypeColor(notification.type), 
                            fontSize: '1.25rem' 
                          }}></i>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                            <h4 style={{ 
                              color: '#0e2e50', 
                              fontSize: '1.1rem', 
                              fontWeight: '600', 
                              margin: 0,
                              opacity: notification.read ? 0.7 : 1
                            }}>
                              {notification.title}
                            </h4>
                            <span style={{ 
                              color: '#64748b', 
                              fontSize: '0.85rem',
                              opacity: notification.read ? 0.7 : 1
                            }}>
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p style={{ 
                            color: '#64748b', 
                            fontSize: '0.95rem', 
                            lineHeight: '1.5', 
                            margin: 0,
                            opacity: notification.read ? 0.7 : 1
                          }}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Notifications;
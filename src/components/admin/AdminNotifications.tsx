import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('admin_notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) return;

      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('admin_id', userData.Id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .single();

      if (!userData) return;

      await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('admin_id', userData.Id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'error': return 'fa-times-circle';
      default: return 'fa-info-circle';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#0d6efd';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading notifications...</div>;
  }

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Notifications {unreadCount > 0 && <span style={{ color: '#dc3545' }}>({unreadCount})</span>}</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setFilter('all')}
              className="theme-btn"
              style={{ 
                padding: '0.5rem 1rem',
                background: filter === 'all' ? '#09c398' : '#6c757d'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className="theme-btn"
              style={{ 
                padding: '0.5rem 1rem',
                background: filter === 'unread' ? '#09c398' : '#6c757d'
              }}
            >
              Unread
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="theme-btn"
                style={{ padding: '0.5rem 1rem', background: '#0d6efd' }}
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                style={{
                  background: notification.is_read ? '#fff' : '#f8f9fa',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  cursor: notification.is_read ? 'default' : 'pointer',
                  borderLeft: `4px solid ${getColor(notification.type)}`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => !notification.is_read && (e.currentTarget.style.transform = 'translateX(5px)')}
                onMouseLeave={(e) => !notification.is_read && (e.currentTarget.style.transform = 'translateX(0)')}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getColor(notification.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <i className={`fas ${getIcon(notification.type)}`}></i>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{notification.title}</h4>
                      <span style={{ fontSize: '0.875rem', color: '#757f95' }}>
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#757f95' }}>{notification.message}</p>
                    {notification.link && (
                      <a href={notification.link} style={{ color: '#09c398', fontSize: '0.875rem', marginTop: '0.5rem', display: 'inline-block' }}>
                        View Details <i className="fas fa-arrow-right"></i>
                      </a>
                    )}
                  </div>

                  {!notification.is_read && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#dc3545',
                      flexShrink: 0
                    }}></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '15px' }}>
              <i className="fas fa-bell-slash" style={{ fontSize: '3rem', color: '#09c398', marginBottom: '1rem' }}></i>
              <p>No notifications</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default AdminNotifications;
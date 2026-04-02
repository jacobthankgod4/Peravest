import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import styles from './AdminHeader.module.css';
import sidebarStyles from './AdminSidebar.module.css';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  isMobile?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, isMenuOpen = false, isMobile = false }) => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('id', { count: 'exact' })
        .eq('is_read', false);
      
      if (!error) {
        setNotificationCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      setNotificationCount(0);
    }
  };

  return (
    <header className={styles.header}>
      {isMobile && onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className={sidebarStyles.hamburger}
          aria-label="Toggle admin menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      )}
      
      <div className={styles.actions}>
        <Link to="/admin/notifications" className={styles.notificationLink}>
          🔔
          {notificationCount > 0 && (
            <span className={styles.notificationBadge}>{notificationCount}</span>
          )}
        </Link>

        <div className={styles.profileContainer}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={styles.profileButton}
          >
            {user?.email?.[0].toUpperCase() || 'A'}
          </button>

          {showProfile && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.profileEmail}>{user?.email}</div>
                <div className={styles.profileRole}>Administrator</div>
              </div>
              <button onClick={logout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

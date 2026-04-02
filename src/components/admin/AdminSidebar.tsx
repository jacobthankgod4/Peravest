import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
}

const AdminSidebarComponent: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen, isMobile }) => {
  const location = useLocation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/properties', icon: '🏢', label: 'Properties' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/ajo', icon: '💰', label: 'Ajo Groups' },
    { path: '/admin/withdrawals', icon: '💸', label: 'Withdrawals' },
    { path: '/admin/kyc', icon: '🆔', label: 'KYC' },
    { path: '/admin/transactions', icon: '💳', label: 'Transactions' },
    { path: '/admin/blogs', icon: '📝', label: 'Blog Posts' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { path: '/admin/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
    { path: '/admin/audit-logs', icon: '📋', label: 'Audit Logs' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div onClick={() => setIsOpen(false)} className={styles.overlay} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobile ? (isOpen ? styles.sidebarOpen : styles.sidebarMobile) : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Peravest Admin</h2>
        </div>
        
        <nav className={styles.nav}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={`${styles.menuItem} ${location.pathname === item.path ? styles.menuItemActive : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebarComponent;

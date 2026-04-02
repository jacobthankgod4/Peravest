import React, { useState, useEffect } from 'react';
import AdminSidebarComponent from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ErrorBoundary from '../ErrorBoundary';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [isMenuOpen, isMobile]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <AdminSidebarComponent isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} isMobile={isMobile} />
      <div className="admin-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <AdminHeader onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} isMobile={isMobile} />
        <main style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <style>{`
        @media (min-width: 992px) {
          .admin-content {
            margin-left: 250px;
          }
        }
        @media (max-width: 991px) {
          .admin-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;

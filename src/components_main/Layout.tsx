import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Peravest - Home Page',
  description = '',
  keywords = ''
}) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/assets/img/logo/icon.png" />
        
        {/* CSS Files */}
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/all-fontawesome.min.css" />
        <link rel="stylesheet" href="/assets/css/flaticon.css" />
        <link rel="stylesheet" href="/assets/css/animate.min.css" />
        <link rel="stylesheet" href="/assets/css/magnific-popup.min.css" />
        <link rel="stylesheet" href="/assets/css/owl.carousel.min.css" />
        <link rel="stylesheet" href="/assets/css/nice-select.min.css" />
        <link rel="stylesheet" href="/assets/css/jquery-ui.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        
        {/* JavaScript Files */}
        <script src="/assets/js/csrf_helper.js" />
      </Helmet>

      <div className="home-3">
        <Header />
        <main>
          {children}
        </main>
        {!user && <Footer />}
      </div>
    </>
  );
};

// Preloader Component with Peravest Icon
const Preloader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)' }}>
    <div style={{ textAlign: 'center' }}>
      <img src="/assets/img/logo/icon.png" alt="Peravest" style={{ width: '80px', height: '80px', marginBottom: '20px', animation: 'bounce 1.5s ease-in-out infinite', objectFit: 'contain' }} />
      <p style={{ color: '#a0a0b0', fontSize: '14px', margin: 0 }}>Loading...</p>
    </div>
    <style>{`
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
    `}</style>
  </div>
);

export default Layout;
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../hooks/useAuth';

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
  const { loading } = useAuth();

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
        <link rel="stylesheet" href="/progress-bar-counter/animated-counter-prograssbar.css" />
        <link rel="stylesheet" href="/css/animate.css/animate.css" />
        
        {/* SweetAlert2 */}
        <link rel="stylesheet" href="/JavaScript/sweetalert2/dist/sweetalert2.min.css" />
        
        {/* JavaScript Files */}
        <script src="/JavaScript/sweetalert2/dist/sweetalert2.all.min.js" />
        <script src="/assets/js/csrf_helper.js" />
      </Helmet>

      <div className="home-3">
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

// Preloader Component (converted from PHP preloader)
const Preloader: React.FC = () => (
  <div className="preloader">
    <div className="loader">
      <div className="loader-shadow"></div>
      <div className="loader-box"></div>
    </div>
  </div>
);

export default Layout;
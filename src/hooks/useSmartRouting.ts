import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useSmartRouting = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleFeatureClick = (feature: 'real-estate' | 'ajo' | 'target-savings' | 'safelock') => {
    if (isAuthenticated) {
      // User is logged in, route to feature
      switch (feature) {
        case 'real-estate':
          navigate('/listings');
          break;
        case 'ajo':
          navigate('/ajo');
          break;
        case 'target-savings':
          navigate('/target-savings');
          break;
        case 'safelock':
          navigate('/safelock');
          break;
      }
    } else {
      // User not logged in, route to login with return URL
      const returnUrl = encodeURIComponent(getFeatureUrl(feature));
      navigate(`/login?return=${returnUrl}`);
      // Scroll to form after navigation
      setTimeout(() => {
        const formElement = document.querySelector('.login-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  };

  const getFeatureUrl = (feature: string) => {
    switch (feature) {
      case 'real-estate':
        return '/listings';
      case 'ajo':
        return '/ajo';
      case 'target-savings':
        return '/target-savings';
      case 'safelock':
        return '/safelock';
      default:
        return '/dashboard';
    }
  };

  return { handleFeatureClick };
};
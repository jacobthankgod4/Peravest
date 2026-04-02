import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const ActivateAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid activation link');
      return;
    }

    authService.activateAccount(token)
      .then(() => {
        setStatus('success');
        setMessage('Account activated successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Activation failed');
      });
  }, [searchParams, navigate]);

  return (
    <div className="activate-account">
      <div className="container">
        {status === 'loading' && <p>Activating your account...</p>}
        {status === 'success' && (
          <div className="success">
            <h2>✓ Success!</h2>
            <p>{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="error">
            <h2>✗ Error</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;

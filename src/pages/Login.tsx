import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('return') || '/dashboard';

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        const from = location.state?.from?.pathname;
        const fromState = location.state?.from?.state;
        
        if (from && from !== '/login') {
          navigate(from, { state: fromState, replace: true });
        } else {
          navigate(user?.isAdmin ? '/admin/dashboard' : decodeURIComponent(returnUrl), { replace: true });
        }
      } else {
        setError('Invalid email or password. Please check your credentials and ensure your email is confirmed.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '40px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img src="/assets/img/logo/logo_a.png" alt="Peravest" style={{ height: '50px', marginBottom: '20px', objectFit: 'contain', objectPosition: 'center' }} />
            <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 700, margin: '0 0 10px 0' }}>Welcome Back</h2>
            <p style={{ color: '#a0a0b0', fontSize: '14px', margin: 0 }}>Login to your account</p>
          </div>

          {successMessage && (
            <div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {successMessage}
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                <strong>Please check your email</strong> to confirm your account before logging in. Click the confirmation link in the email we sent you.
              </div>
            </div>
          )}
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Email</label>
              <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '12px 15px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.3s' }} onFocus={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.12)'; e.target.style.borderColor = '#09c398'; }} onBlur={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.08)'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }} />
            </div>

            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Password</label>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required style={{ width: '100%', padding: '12px 15px', paddingRight: '40px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.3s' }} onFocus={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.12)'; e.target.style.borderColor = '#09c398'; }} onBlur={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.08)'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }} />
              <i className={`far ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '38px', color: '#a0a0b0', cursor: 'pointer', fontSize: '16px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#a0a0b0', cursor: 'pointer', margin: 0 }}>
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ color: '#09c398', textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 24px', background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', opacity: loading ? 0.6 : 1 }} onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#a0a0b0' }}>
            Don't have an account? <Link to={`/register?return=${encodeURIComponent(returnUrl)}`} style={{ color: '#09c398', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

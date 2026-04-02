import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from './Breadcrumb';

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
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Get return URL from query params
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('return');

  // Auto-route authenticated users
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
      } else {
        // Route based on user role
        const defaultRoute = user.isAdmin ? '/admin/dashboard' : '/dashboard';
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, returnUrl, navigate]);

  // Scroll to form when component mounts
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    const formElement = document.querySelector('.login-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (!success) {
        setError('Invalid email or password. Please try again.');
      }
      // Navigation will be handled by the useEffect above
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="main">
      <Breadcrumb 
        title="Login" 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Login', active: true }
        ]} 
      />

      <div className="login-area py-120">
        <div className="container">
          <div className="col-md-6 mx-auto">
            <div className="login-form">
              <div className="login-header">
                <img src="/assets/img/logo/logo_a.png" alt="Peravest Logo" />
                <p>Login with your peravest account</p>
                {successMessage && (
                  <div className="alert alert-success" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {successMessage}
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="far fa-envelope"></i>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="password"
                    placeholder="Your Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="far fa-lock"></i>
                  <span
                    className={`far ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                    style={{
                      position: 'absolute',
                      top: '70%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer'
                    }}
                    onClick={togglePasswordVisibility}
                  />
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="rememberMe"
                      id="remember"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember Me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="forgot-pass">
                    Forgot Password?
                  </Link>
                </div>

                <div className="d-flex align-items-center">
                  <button 
                    type="submit" 
                    className="theme-btn loginBtn"
                    disabled={loading}
                  >
                    <i className="far fa-sign-in"></i> 
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>

              <div className="login-footer">
                <p>
                  Don't have an account? <Link to={`/register?return=${encodeURIComponent(returnUrl || '/dashboard')}`}>Register.</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
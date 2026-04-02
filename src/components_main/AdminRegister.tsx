import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Breadcrumb from './Breadcrumb';

interface AdminRegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  adminCode: string;
}

const AdminRegister: React.FC = () => {
  const [formData, setFormData] = useState<AdminRegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_SECRET_CODE = process.env.REACT_APP_ADMIN_SECRET_CODE || 'PERAVEST_ADMIN_2024';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.adminCode !== ADMIN_SECRET_CODE) {
      setError('Invalid admin access code');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('user_accounts')
          .insert({
            Email: formData.email,
            Name: formData.name,
            User_Type: 'admin',
            Password: 'hashed_by_supabase'
          });

        if (dbError) throw dbError;

        await supabase.from('admin_audit_log').insert({
          admin_email: formData.email,
          action: 'ADMIN_REGISTERED',
          table_name: 'user_accounts',
          details: { name: formData.name }
        });

        navigate('/login', { 
          state: { message: 'Admin account created successfully. Please login.' }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <Breadcrumb title="Admin Registration" currentPage="Admin Register" />

      <div className="login-area py-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="login-form" style={{ maxWidth: '100%' }}>
                <div className="login-header text-center mb-4">
                  <img src="/assets/img/logo/logo_a.png" alt="Peravest Logo" style={{ maxWidth: '200px' }} />
                  <h3 className="mt-3">Create Admin Account</h3>
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          placeholder="Your Full Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                        <i className="far fa-user"></i>
                      </div>
                    </div>

                    <div className="col-md-6">
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
                    </div>

                    <div className="col-md-6">
                      <div className="form-group" style={{ position: 'relative' }}>
                        <label>Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          name="password"
                          placeholder="Your Password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <i 
                          className={showPassword ? 'far fa-eye-slash' : 'far fa-eye'}
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ 
                            position: 'absolute', 
                            right: '15px', 
                            top: '43px', 
                            cursor: 'pointer',
                            zIndex: 10
                          }}
                        ></i>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group" style={{ position: 'relative' }}>
                        <label>Confirm Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          name="confirmPassword"
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <i 
                          className={showPassword ? 'far fa-eye-slash' : 'far fa-eye'}
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ 
                            position: 'absolute', 
                            right: '15px', 
                            top: '43px', 
                            cursor: 'pointer',
                            zIndex: 10
                          }}
                        ></i>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group" style={{ position: 'relative' }}>
                        <label>Admin Access Code</label>
                        <input
                          type="password"
                          className="form-control"
                          name="adminCode"
                          placeholder="Enter Admin Code"
                          value={formData.adminCode}
                          onChange={handleInputChange}
                          required
                          style={{ paddingRight: '15px' }}
                        />
                      </div>
                      
                      <div className="form-check" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="agreeTerms"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          required
                          style={{
                            width: '20px',
                            height: '20px',
                            marginTop: '0',
                            marginRight: '10px',
                            cursor: 'pointer',
                            border: '2px solid #d1d5db',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                          }}
                        />
                        <label className="form-check-label" htmlFor="agreeTerms" style={{ cursor: 'pointer', fontSize: '14px', color: '#374151', marginBottom: '0' }}>
                          I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Terms and Conditions</a>
                        </label>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex justify-content-center">
                        <button 
                          type="submit" 
                          className="theme-btn"
                          disabled={loading}
                          style={{ minWidth: '200px' }}
                        >
                          <i className="far fa-user-plus"></i> 
                          {loading ? 'Creating Account...' : 'Create Admin Account'}
                        </button>
                      </div>
                      <div className="text-center mt-3">
                        <p style={{ fontSize: '14px', color: '#6c757d' }}>
                          Already have an account? <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Login here</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminRegister;

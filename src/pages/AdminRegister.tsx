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
          <div className="col-md-6 mx-auto">
            <div className="login-form">
              <div className="login-header">
                <img src="/assets/img/logo/logo_a.png" alt="Peravest Logo" />
                <p>Create Admin Account</p>
                {error && <div className="alert alert-danger">{error}</div>}
              </div>

              <form onSubmit={handleSubmit}>
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
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="far fa-lock"></i>
                </div>

                <div className="form-group">
                  <label>Admin Access Code</label>
                  <input
                    type="password"
                    className="form-control"
                    name="adminCode"
                    placeholder="Enter Admin Code"
                    value={formData.adminCode}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="far fa-key"></i>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label className="form-check-label" htmlFor="showPassword">
                    Show Password
                  </label>
                </div>

                <div className="d-flex align-items-center">
                  <button 
                    type="submit" 
                    className="theme-btn loginBtn"
                    disabled={loading}
                  >
                    <i className="far fa-user-plus"></i> 
                    {loading ? 'Creating Account...' : 'Create Admin Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminRegister;

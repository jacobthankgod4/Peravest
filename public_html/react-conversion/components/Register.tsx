import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

interface Bank {
  code: string;
  name: string;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  accountNumber: string;
  bankCode: string;
  age: string;
  gender: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    accountNumber: '',
    bankCode: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/banks');
      const data = await response.json();
      setBanks(data.banks || []);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    }

    if (!formData.bankCode) {
      newErrors.bankCode = 'Please select a bank';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18) {
      newErrors.age = 'You must be at least 18 years old';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          accountNumber: formData.accountNumber,
          bankCode: formData.bankCode,
          age: parseInt(formData.age),
          gender: formData.gender,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login', { 
          state: { message: 'Registration successful! Please check your email to activate your account.' }
        });
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <Breadcrumb 
        title="Register" 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Register', active: true }
        ]} 
      />

      <div className="login-area py-120">
        <div className="container">
          <div className="col-md-5 mx-auto">
            <div className="login-form">
              <div className="login-header">
                <img src="/assets/img/logo/logo_a.png" alt="Peravest Logo" />
                <p>Create your peravest account</p>
                {errors.general && (
                  <div className="alert alert-danger">{errors.general}</div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    placeholder="Your Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  <i className="far fa-user"></i>
                  {errors.fullName && (
                    <div className="alert alert-danger mt-2">{errors.fullName}</div>
                  )}
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
                  />
                  <i className="far fa-envelope"></i>
                  {errors.email && (
                    <div className="alert alert-danger mt-2">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Bank Account No</label>
                  <input
                    type="number"
                    className="form-control"
                    name="accountNumber"
                    placeholder="Your Account Number"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                  />
                  <i className="far fa-list-ol"></i>
                  {errors.accountNumber && (
                    <div className="alert alert-danger mt-2">{errors.accountNumber}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Bank Name</label>
                  <select
                    name="bankCode"
                    className="form-select"
                    value={formData.bankCode}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Bank --</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bankCode && (
                    <div className="alert alert-danger mt-2">{errors.bankCode}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    className="form-control"
                    name="age"
                    placeholder="Enter Your Age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                  <i className="far fa-list-ol"></i>
                  {errors.age && (
                    <div className="alert alert-danger mt-2">{errors.age}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && (
                    <div className="alert alert-danger mt-2">{errors.gender}</div>
                  )}
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
                    onClick={() => setShowPassword(!showPassword)}
                  />
                  {errors.password && (
                    <div className="alert alert-danger mt-2">{errors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <i className="far fa-lock"></i>
                  <span
                    className={`far ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                    style={{
                      position: 'absolute',
                      top: '70%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                  {errors.confirmPassword && (
                    <div className="alert alert-danger mt-2">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="form-check form-group">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="agreeToTerms"
                    id="agree"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="agree">
                    I agree with the <Link to="/terms">Terms Of Service.</Link>
                  </label>
                  {errors.agreeToTerms && (
                    <div className="alert alert-danger mt-2">{errors.agreeToTerms}</div>
                  )}
                </div>

                <div className="d-flex align-items-center">
                  <button 
                    type="submit" 
                    className="theme-btn"
                    disabled={loading}
                  >
                    <i className="far fa-paper-plane"></i> 
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>

              <div className="login-footer">
                <p>
                  Already have an account? <Link to="/login">Login.</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface InvestSignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

const InvestSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InvestSignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
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
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        alert('Registration successful! Please check your email to activate your account.');
        navigate('/login', { state: { message: 'Registration successful! Please check your email to activate your account.' } });
      } else {
        // Handle server errors
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invest-signup-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="signup-form-wrapper">
              <h2 className="text-center mb-4">Create Investment Account</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.firstName && (
                        <div className="invalid-feedback">{errors.firstName}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.lastName && (
                        <div className="invalid-feedback">{errors.lastName}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    className={`form-check-input ${errors.agreeToTerms ? 'is-invalid' : ''}`}
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                  />
                  <label className="form-check-label" htmlFor="agreeToTerms">
                    I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> *
                  </label>
                  {errors.agreeToTerms && (
                    <div className="invalid-feedback d-block">{errors.agreeToTerms}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="text-center mt-3">
                <p>Already have an account? <a href="/login">Sign In</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestSignup;
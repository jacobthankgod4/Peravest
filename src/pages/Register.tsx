import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { nigerianBanks } from '../data/nigerianBanks';
import { useReferral } from '../contexts/ReferralContext';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { trackReferral } = useReferral();
  
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('return') || '/dashboard';
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (referralCode) trackReferral(referralCode);
  }, [referralCode, trackReferral]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Required';
    else if (!/^\d{10}$/.test(formData.accountNumber)) newErrors.accountNumber = '10 digits';
    if (!formData.bankCode) newErrors.bankCode = 'Select bank';
    if (!formData.age.trim()) newErrors.age = 'Required';
    else if (parseInt(formData.age) < 18) newErrors.age = 'Must be 18+';
    if (!formData.gender) newErrors.gender = 'Select gender';
    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 6) newErrors.password = '6+ chars';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mismatch';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      console.log('Attempting signup with:', { email: formData.email });
      
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (authError) {
        console.error('Supabase auth error:', authError);
        throw authError;
      }
      
      if (data.user) {
        console.log('User created, saving profile...');
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            full_name: formData.fullName,
            account_number: formData.accountNumber,
            bank_code: formData.bankCode,
            age: parseInt(formData.age),
            gender: formData.gender
          });
        
        if (profileError) {
          console.warn('Profile save warning:', profileError);
        } else {
          console.log('Profile saved successfully');
        }
      }
      
      console.log('Signup successful');
      navigate('/login', { state: { message: 'Registration successful! Check your email to verify.' } });
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.message || err.error_description || 'Registration failed';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '40px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* Left Column - Branding */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <img src="/assets/img/logo/logo_a.png" alt="Peravest" style={{ height: '50px', marginBottom: '20px', objectFit: 'contain', objectPosition: 'center' }} />
            <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 700, margin: '0 0 15px 0' }}>Join PeraVest</h2>
            <p style={{ color: '#a0a0b0', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>Start your cooperative real estate participation journey with as low as ₦5,000. Create your account in minutes.</p>
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <i className="fas fa-check" style={{ color: '#09c398', fontSize: '18px' }}></i>
                <span style={{ color: '#a0a0b0' }}>Secure & cooperative platform</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <i className="fas fa-check" style={{ color: '#09c398', fontSize: '18px' }}></i>
                <span style={{ color: '#a0a0b0' }}>Up to 25% projected member benefits</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <i className="fas fa-check" style={{ color: '#09c398', fontSize: '18px' }}></i>
                <span style={{ color: '#a0a0b0' }}>Professional property management</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            {errors.general && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{errors.general}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
                  <input type="text" name="fullName" placeholder="Your name" value={formData.fullName} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                  {errors.fullName && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.fullName}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                  <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                  {errors.email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.email}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Account Number</label>
                  <input type="number" name="accountNumber" placeholder="10 digits" value={formData.accountNumber} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                  {errors.accountNumber && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.accountNumber}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Bank</label>
                  <select name="bankCode" value={formData.bankCode} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="">Select bank</option>
                    {nigerianBanks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                  </select>
                  {errors.bankCode && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.bankCode}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Age</label>
                  <input type="number" name="age" placeholder="18+" value={formData.age} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                  {errors.age && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.age}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.gender}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                  {errors.password && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.password}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Confirm Password</label>
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                  {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: '#a0a0b0', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }} />
                  I agree to <Link to="/terms" style={{ color: '#09c398', textDecoration: 'none', marginLeft: '4px' }}>Terms of Service</Link>
                </label>
                {errors.agreeToTerms && <span style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px' }}>{errors.agreeToTerms}</span>}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 24px', background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', opacity: loading ? 0.6 : 1 }} onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}>
                {loading ? 'Creating account...' : 'Register'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#a0a0b0' }}>
                Already have an account? <Link to={`/login?return=${encodeURIComponent(returnUrl)}`} style={{ color: '#09c398', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: '1fr 1fr', gap: '40px'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default Register;

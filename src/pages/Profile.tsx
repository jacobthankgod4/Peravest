import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { nigerianBanks } from '../data/nigerianBanks';
import { nigerianStates } from '../data/nigerianStates';
import Swal from 'sweetalert2';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  bvn: string;
  nin: string;
  occupation: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    bank: '',
    accountNumber: '',
    accountName: '',
    bvn: '',
    nin: '',
    occupation: '',
    nextOfKin: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Mock data - replace with actual API call
      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        bank: '',
        accountNumber: '',
        accountName: '',
        bvn: '',
        nin: '',
        occupation: '',
        nextOfKin: '',
        nextOfKinPhone: '',
        nextOfKinRelationship: ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      Swal.fire('Success!', 'Profile updated successfully', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  return (
    <DashboardLayout title="Profile Settings">
      <main style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh', paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ color: '#0e2e50', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Profile Settings</h1>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage your personal information and preferences</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '2.5rem',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Personal Information</h3>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-12">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>State</label>
                    <select
                      name="state"
                      value={profile.state}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={profile.occupation}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>BVN</label>
                    <input
                      type="text"
                      name="bvn"
                      value={profile.bvn}
                      onChange={handleChange}
                      maxLength={11}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '2.5rem',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Bank Information</h3>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Bank</label>
                    <select
                      name="bank"
                      value={profile.bank}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <option value="">Select Bank</option>
                      {nigerianBanks.map((bank) => (
                        <option key={bank.code} value={bank.name}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={profile.accountNumber}
                      onChange={handleChange}
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Account Name</label>
                    <input
                      type="text"
                      name="accountName"
                      value={profile.accountName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '2.5rem',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Next of Kin</h3>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
                    <input
                      type="text"
                      name="nextOfKin"
                      value={profile.nextOfKin}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
                    <input
                      type="tel"
                      name="nextOfKinPhone"
                      value={profile.nextOfKinPhone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Relationship</label>
                    <select
                      name="nextOfKinRelationship"
                      value={profile.nextOfKinRelationship}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    padding: '1.25rem 3rem',
                    background: loading ? '#94a3b8' : '#0e2e50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(14, 46, 80, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#1e3a8a';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#0e2e50';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Profile;
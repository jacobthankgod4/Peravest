import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { nigerianBanks } from '../data/nigerianBanks';
import Swal from 'sweetalert2';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bank: string;
  accountNumber: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    bank: '',
    accountNumber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        Swal.fire('Success!', 'Profile updated successfully', 'success');
      } else {
        Swal.fire('Error!', 'Failed to update profile', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', 'An error occurred', 'error');
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
    <div className="profile-page">
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card">
              <div className="card-header">
                <h4>Profile Settings</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Bank</label>
                      <select
                        className="form-control"
                        name="bank"
                        value={profile.bank}
                        onChange={handleChange}
                      >
                        <option value="">Select Bank</option>
                        {nigerianBanks.map((bank) => (
                          <option key={bank.code} value={bank.name}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="accountNumber"
                        value={profile.accountNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
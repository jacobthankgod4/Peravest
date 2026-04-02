import React, { useState, useEffect } from 'react';
import { userAdminService } from '../../services/userAdminService';
import UserActivityTimeline from './UserActivityTimeline';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuspend: () => void;
  onActivate: () => void;
  onKYCOverride: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuspend,
  onActivate,
  onKYCOverride
}) => {
  const [user, setUser] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'investments' | 'activity'>('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [userData, investmentData, activityData] = await Promise.all([
        userAdminService.getUserById(userId),
        userAdminService.getUserInvestments(userId),
        userAdminService.getUserActivity(userId)
      ]);
      setUser(userData);
      setInvestments(investmentData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.share_cost || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>User Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="modal-body text-center py-5">Loading...</div>
        ) : (
          <>
            <div className="modal-body">
              <div className="user-header mb-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h4>{user?.Name}</h4>
                    <p className="text-muted">{user?.Email}</p>
                  </div>
                  <div className="d-flex gap-2">
                    <span className={`badge bg-${user?.status === 'active' ? 'success' : 'danger'}`}>
                      {user?.status || 'active'}
                    </span>
                    <span className={`badge bg-${user?.kyc_verified ? 'success' : 'warning'}`}>
                      KYC: {user?.kyc_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tabs mb-3">
                <button
                  className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Information
                </button>
                <button
                  className={`tab-btn ${activeTab === 'investments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('investments')}
                >
                  Investments ({investments.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'info' && (
                  <div className="user-info">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted">User ID</label>
                        <p>{user?.Id}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted">User Type</label>
                        <p>{user?.User_Type || 'user'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted">Total Invested</label>
                        <p className="text-success">₦{totalInvested.toLocaleString()}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted">Joined</label>
                        <p>{new Date(user?.created_at).toLocaleDateString()}</p>
                      </div>
                      {user?.suspension_reason && (
                        <div className="col-12">
                          <div className="alert alert-danger">
                            <strong>Suspension Reason:</strong> {user.suspension_reason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'investments' && (
                  <div className="investments-list">
                    {investments.length === 0 ? (
                      <p className="text-center text-muted">No investments yet</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Property</th>
                              <th>Amount</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {investments.map((inv) => (
                              <tr key={inv.Id_invest}>
                                <td>{inv.property?.Title}</td>
                                <td>₦{inv.share_cost?.toLocaleString()}</td>
                                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <UserActivityTimeline activity={activity} />
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onKYCOverride}>
                {user?.kyc_verified ? 'Revoke KYC' : 'Verify KYC'}
              </button>
              {user?.status === 'active' ? (
                <button className="btn btn-warning" onClick={onSuspend}>
                  Suspend User
                </button>
              ) : (
                <button className="btn btn-success" onClick={onActivate}>
                  Activate User
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDetailModal;

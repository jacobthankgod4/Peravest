import React, { useState, useEffect } from 'react';
import { userAdminService } from '../../services/userAdminService';
import { useAuth } from '../../contexts/AuthContext';
import UserDetailModal from './UserDetailModal';
import UserActions from './UserActions';
import Swal from 'sweetalert2';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userAdminService.getAllUsers(filter);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Swal.fire('Error', 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Suspend User',
      input: 'textarea',
      inputLabel: 'Suspension Reason',
      inputPlaceholder: 'Enter reason for suspension...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason!';
        }
      }
    });

    if (reason) {
      try {
        await userAdminService.suspendUser(userId, reason, user?.email!);
        Swal.fire('Success', 'User suspended successfully', 'success');
        fetchUsers();
        setSelectedUser(null);
      } catch (error) {
        Swal.fire('Error', 'Failed to suspend user', 'error');
      }
    }
  };

  const handleActivate = async (userId: number) => {
    const result = await Swal.fire({
      title: 'Activate User?',
      text: 'This will restore user access',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, activate'
    });

    if (result.isConfirmed) {
      try {
        await userAdminService.activateUser(userId, user?.email!);
        Swal.fire('Success', 'User activated successfully', 'success');
        fetchUsers();
        setSelectedUser(null);
      } catch (error) {
        Swal.fire('Error', 'Failed to activate user', 'error');
      }
    }
  };

  const handleKYCOverride = async (userId: number, currentStatus: boolean) => {
    const result = await Swal.fire({
      title: currentStatus ? 'Revoke KYC Verification?' : 'Verify KYC?',
      text: 'This will manually override KYC status',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed'
    });

    if (result.isConfirmed) {
      try {
        await userAdminService.overrideKYC(userId, !currentStatus, user?.email!);
        Swal.fire('Success', 'KYC status updated', 'success');
        fetchUsers();
        setSelectedUser(null);
      } catch (error) {
        Swal.fire('Error', 'Failed to update KYC status', 'error');
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors: any = {
      active: 'success',
      suspended: 'danger',
      pending: 'warning'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status || 'active'}</span>;
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="user-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '250px' }}
          />
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '150px' }}>
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4">No users found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>KYC Status</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.Id}>
                      <td>{u.Name}</td>
                      <td>{u.Email}</td>
                      <td>
                        <span className={`badge bg-${u.kyc_verified ? 'success' : 'warning'}`}>
                          {u.kyc_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td>{getStatusBadge(u.status)}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <UserActions
                          user={u}
                          onView={() => setSelectedUser(u.Id)}
                          onSuspend={() => handleSuspend(u.Id)}
                          onActivate={() => handleActivate(u.Id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser}
          onSuspend={() => handleSuspend(selectedUser)}
          onActivate={() => handleActivate(selectedUser)}
          onKYCOverride={() => {
            const u = users.find(user => user.Id === selectedUser);
            if (u) handleKYCOverride(selectedUser, u.kyc_verified);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;

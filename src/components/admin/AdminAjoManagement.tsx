import React, { useState, useEffect } from 'react';
import { ajoGroupService } from '../../services/ajoGroupService';
import { ajoContributionEngine } from '../../services/ajoContributionEngine';
import { ajoPayoutScheduler } from '../../services/ajoPayoutScheduler';
import { AjoGroup, AjoCycle, AjoGroupMember } from '../../types/ajo';

const AdminAjoManagement: React.FC = () => {
  const [groups, setGroups] = useState<AjoGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<AjoGroup | null>(null);
  const [members, setMembers] = useState<AjoGroupMember[]>([]);
  const [currentCycle, setCurrentCycle] = useState<AjoCycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data } = await ajoGroupService.getUserGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId: number) => {
    try {
      // Load members and current cycle
      const group = groups.find(g => g.id === groupId);
      setSelectedGroup(group || null);
    } catch (error) {
      console.error('Failed to load group details:', error);
    }
  };

  const processCyclePayout = async (cycleId: number) => {
    const confirmed = window.confirm('Process payout for this cycle? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      await ajoPayoutScheduler.processCyclePayout(cycleId);
      alert('Payout processed successfully');
      loadGroups();
    } catch (error: any) {
      alert(`Failed to process payout: ${error.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Ajo groups...</div>;
  }

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '2rem' }}>Ajo Group Management</h2>

        {/* Groups Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => loadGroupDetails(group.id)}
              style={{
                background: '#fff',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>{group.name}</h4>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: group.status === 'active' ? '#28a745' : '#6c757d',
                  color: '#fff'
                }}>
                  {group.status}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ color: '#757f95' }}>Members</div>
                  <div style={{ fontWeight: 600 }}>{group.current_members}/{group.max_members}</div>
                </div>
                <div>
                  <div style={{ color: '#757f95' }}>Contribution</div>
                  <div style={{ fontWeight: 600 }}>₦{group.contribution_amount.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: '#757f95' }}>Frequency</div>
                  <div style={{ fontWeight: 600 }}>{group.frequency}</div>
                </div>
                <div>
                  <div style={{ color: '#757f95' }}>Current Cycle</div>
                  <div style={{ fontWeight: 600 }}>{group.current_cycle}/{group.total_cycles}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '15px' }}>
            <i className="fas fa-users" style={{ fontSize: '3rem', color: '#09c398', marginBottom: '1rem' }}></i>
            <p>No Ajo groups found</p>
          </div>
        )}

        {/* Selected Group Details */}
        {selectedGroup && (
          <div style={{ background: '#fff', borderRadius: '15px', padding: '2rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>{selectedGroup.name} - Details</h3>
              <button onClick={() => setSelectedGroup(null)} className="theme-btn">
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Status</div>
                <div style={{ fontWeight: 600 }}>{selectedGroup.status}</div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Members</div>
                <div style={{ fontWeight: 600 }}>{selectedGroup.current_members}/{selectedGroup.max_members}</div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Contribution Amount</div>
                <div style={{ fontWeight: 600 }}>₦{selectedGroup.contribution_amount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Frequency</div>
                <div style={{ fontWeight: 600 }}>{selectedGroup.frequency}</div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Current Cycle</div>
                <div style={{ fontWeight: 600 }}>{selectedGroup.current_cycle}/{selectedGroup.total_cycles}</div>
              </div>
              <div>
                <div style={{ color: '#757f95', marginBottom: '0.5rem' }}>Next Payout</div>
                <div style={{ fontWeight: 600 }}>
                  {selectedGroup.next_payout_date 
                    ? new Date(selectedGroup.next_payout_date).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminAjoManagement;
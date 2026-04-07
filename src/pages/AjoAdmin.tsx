import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import UserLayout from '../components/UserLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function AjoAdmin() {
  const [activeTab, setActiveTab] = useState<'groups' | 'cycles' | 'members'>('groups');

  // Fetch all groups
  const { data: groups, isLoading: groupsLoading } = useQuery(
    ['all-groups'],
    async () => {
      const { data } = await supabase
        .from('ajo_groups')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  );

  // Fetch all cycles
  const { data: cycles, isLoading: cyclesLoading } = useQuery(
    ['all-cycles'],
    async () => {
      const { data } = await supabase
        .from('ajo_cycles')
        .select('*, ajo_groups(name)')
        .order('created_at', { ascending: false });
      return data || [];
    }
  );

  // Fetch all members
  const { data: members, isLoading: membersLoading } = useQuery(
    ['all-members'],
    async () => {
      const { data } = await supabase
        .from('ajo_group_members')
        .select('*, ajo_groups(name), user_accounts(Email)')
        .order('join_date', { ascending: false });
      return data || [];
    }
  );

  const isLoading = groupsLoading || cyclesLoading || membersLoading;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl font-bold text-primary-green mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 mb-12">Manage all Ajo groups, cycles, and members</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Total Groups</p>
              <p className="text-4xl font-bold text-primary-green">{groups?.length || 0}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Active Cycles</p>
              <p className="text-4xl font-bold text-blue-600">
                {cycles?.filter((c: any) => c.status === 'collecting').length || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-200">
              <p className="text-sm text-gray-600 mb-2">Total Members</p>
              <p className="text-4xl font-bold text-accent-orange">{members?.length || 0}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-300 mb-8">
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'groups'
                  ? 'border-primary-green text-primary-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Groups ({groups?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('cycles')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'cycles'
                  ? 'border-primary-green text-primary-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Cycles ({cycles?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-primary-green text-primary-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Members ({members?.length || 0})
            </button>
          </div>

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Groups</h2>
              
              {groups && groups.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Members</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Contribution</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group: any) => (
                        <tr key={group.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-gray-900">{group.name}</td>
                          <td className="py-3 px-4 text-gray-900">{group.current_members}/{group.max_members}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              group.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {group.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">₦{group.contribution_amount?.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <button className="text-primary-green hover:text-green-600 font-semibold text-sm">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No groups found</p>
              )}
            </div>
          )}

          {/* Cycles Tab */}
          {activeTab === 'cycles' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Cycles</h2>
              
              {cycles && cycles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Group</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Cycle #</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Progress</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycles.map((cycle: any) => (
                        <tr key={cycle.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-gray-900">{cycle.ajo_groups?.name}</td>
                          <td className="py-3 px-4 text-gray-900">#{cycle.cycle_number}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              cycle.status === 'collecting'
                                ? 'bg-blue-100 text-blue-800'
                                : cycle.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {cycle.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-green h-2 rounded-full"
                                style={{
                                  width: `${(cycle.total_collected / cycle.total_expected) * 100}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-primary-green hover:text-green-600 font-semibold text-sm">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No cycles found</p>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Members</h2>
              
              {members && members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Group</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member: any) => (
                        <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{member.user_accounts?.Email}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{member.ajo_groups?.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {new Date(member.join_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-primary-green hover:text-green-600 font-semibold text-sm">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No members found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

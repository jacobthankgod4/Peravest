import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ajoGroupService } from '../services/ajoGroupService';
import UserLayout from '../components/UserLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function AjoGroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'cycles'>('overview');

  // Fetch group details
  const { data: group, isLoading: groupLoading, error: groupError } = useQuery(
    ['group-detail', groupId],
    () => ajoGroupService.getGroupDetails(parseInt(groupId || '0'))
  );

  // Fetch group members
  const { data: members, isLoading: membersLoading } = useQuery(
    ['group-members', groupId],
    () => ajoGroupService.getGroupMembers(parseInt(groupId || '0'))
  );

  // Fetch group cycles
  const { data: cycles, isLoading: cyclesLoading } = useQuery(
    ['group-cycles', groupId],
    () => ajoGroupService.getGroupCycles(parseInt(groupId || '0'))
  );

  const isLoading = groupLoading || membersLoading || cyclesLoading;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      </UserLayout>
    );
  }

  if (groupError || !group) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4">
          <Alert type="error" className="max-w-2xl mx-auto">
            Group not found. Please check the URL and try again.
          </Alert>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-primary-green mb-2">{group?.name}</h1>
                <p className="text-lg text-gray-600">{group?.description}</p>
              </div>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                {group.status}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Members</p>
                <p className="text-2xl font-bold text-primary-green">
                  {group?.current_members}/{group?.max_members}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contribution</p>
                <p className="text-2xl font-bold text-accent-orange">
                  ₦{group?.contribution_amount?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Frequency</p>
                <p className="text-2xl font-bold text-blue-600 capitalize">
                  {group?.frequency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Trust Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(group?.reliability_threshold * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex gap-4 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-green text-primary-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
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
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Group Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(group.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cycle Duration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {group.cycle_duration} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Cycles</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {group.total_cycles || 'Ongoing'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Member Capacity</p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary-green h-3 rounded-full"
                          style={{
                            width: `${(group.current_members / group.max_members) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {group.current_members} of {group.max_members} members
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <button className="px-8 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold">
                  Join This Circle
                </button>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Group Members</h2>
              
              {members && members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Member</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member: any, idx: number) => (
                        <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-primary-green">#{member.position}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-900">Member {idx + 1}</p>
                              <p className="text-sm text-gray-600">{member.user_accounts?.Email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(member.join_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-green h-2 rounded-full"
                                  style={{
                                    width: `${(member.reliability_score || 0) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {((member.reliability_score || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No members yet</p>
              )}
            </div>
          )}

          {/* Cycles Tab */}
          {activeTab === 'cycles' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cycles</h2>
              
              {cycles && cycles.length > 0 ? (
                <div className="space-y-4">
                  {cycles.map((cycle: any) => (
                    <div key={cycle.id} className="border border-gray-200 rounded-lg p-6 hover:border-primary-green transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Cycle #{cycle.cycle_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          cycle.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : cycle.status === 'collecting'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cycle.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Expected</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ₦{cycle.total_expected?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Collected</p>
                          <p className="text-lg font-semibold text-primary-green">
                            ₦{cycle.total_collected?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {((cycle.total_collected / cycle.total_expected) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No cycles yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

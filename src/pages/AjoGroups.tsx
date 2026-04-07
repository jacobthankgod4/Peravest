import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { ajoGroupBrowseService, GroupBrowseFilter } from '../services/ajoGroupBrowseService';
import { ajoJoinRequestService } from '../services/ajoJoinRequestService';
import UserLayout from '../components/UserLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { GroupBrowseCard } from '../components/ajo/GroupBrowseCard';
import { JoinRequestModal } from '../components/ajo/JoinRequestModal';

interface FilterOptions {
  frequency?: 'daily' | 'weekly' | 'monthly';
  minAmount?: number;
  maxAmount?: number;
  minScore?: number;
  search?: string;
  sortBy?: 'newest' | 'most_trusted' | 'most_active' | 'ending_soon';
}

export default function AjoGroups() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'newest',
  });
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Fetch available groups
  const { data: groups, isLoading, error, refetch } = useQuery(
    ['available-groups', filters],
    async () => {
      const { data } = await ajoGroupBrowseService.getAvailableGroups(filters);
      return data || [];
    }
  );

  // Fetch user's join requests
  const { data: joinRequests, isLoading: requestsLoading } = useQuery(
    ['user-join-requests', user?.id],
    async () => {
      if (!user?.id) return [];
      const { data } = await ajoJoinRequestService.getUserJoinRequests(typeof user?.id === 'string' ? parseInt(user.id) : (user?.id || 0));
      return data || [];
    },
    { enabled: !!user?.id }
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (!groups || groups.length === 0) return;

    const subscriptions = groups.map((group: any) =>
      ajoGroupBrowseService.subscribeToGroupUpdates(group.id, () => {
        refetch();
      })
    );

    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe());
    };
  }, [groups, refetch]);

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-green mb-4 tracking-tight">
            Discover Ajo Circles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Browse and join cooperative savings groups in your community
          </p>
        </div>

        {/* Success Message */}
        {joinSuccess && (
          <Alert type="success" className="max-w-7xl mx-auto mb-8">
            ✓ Join request submitted! The group owner will review your request soon.
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert type="error" className="max-w-7xl mx-auto mb-8">
            Failed to load groups. Please try again.
          </Alert>
        )}

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex gap-4 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'browse'
                  ? 'text-primary-green border-b-2 border-primary-green'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Groups
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-primary-green border-b-2 border-primary-green'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Requests
              {joinRequests && joinRequests.length > 0 && (
                <span className="absolute top-1 right-0 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {joinRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Filters Section */}
            <div className="max-w-7xl mx-auto mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Filter Groups</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Group name..."
                      value={filters.search || ''}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={filters.frequency || ''}
                      onChange={(e) => setFilters({ ...filters, frequency: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Min Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minAmount || ''}
                      onChange={(e) => setFilters({ ...filters, minAmount: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="₦0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>

                  {/* Max Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={filters.maxAmount || ''}
                      onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="₦100,000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy || 'newest'}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    >
                      <option value="newest">Newest</option>
                      <option value="most_trusted">Most Trusted</option>
                      <option value="most_active">Most Active</option>
                      <option value="ending_soon">Ending Soon</option>
                    </select>
                  </div>
                </div>

                {/* Reset Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setFilters({ sortBy: 'newest' })}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner className="w-12 h-12" />
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="max-w-7xl mx-auto mb-6">
                  <p className="text-gray-600 font-semibold">
                    Found {groups?.length || 0} group{groups?.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Groups Grid */}
                {groups && groups.length > 0 ? (
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groups.map((group: any) => (
                        <GroupBrowseCard
                          key={group.id}
                          {...group}
                          onJoinClick={() => {
                            setSelectedGroup(group);
                            setShowJoinModal(true);
                          }}
                          onDetailsClick={() => {
                            // Navigate to group details
                            window.location.href = `/ajo/groups/${group.id}`;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Groups Found</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Try adjusting your filters or check back later for new groups
                      </p>
                      <button
                        onClick={() => setFilters({ sortBy: 'newest' })}
                        className="px-8 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="max-w-7xl mx-auto">
            {requestsLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner className="w-12 h-12" />
              </div>
            ) : joinRequests && joinRequests.length > 0 ? (
              <div className="space-y-4">
                {joinRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {request.ajo_groups?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Join Requests</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't submitted any join requests yet. Browse groups and submit a request to get started!
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-8 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  Browse Groups
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {selectedGroup && (
        <JoinRequestModal
          isOpen={showJoinModal}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          userId={typeof user?.id === 'string' ? parseInt(user.id) : (user?.id || 0)}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedGroup(null);
            setJoinSuccess(false);
          }}
          onSuccess={() => {
            setJoinSuccess(true);
            setShowJoinModal(false);
            setSelectedGroup(null);
            setTimeout(() => setJoinSuccess(false), 5000);
          }}
        />
      )}
    </UserLayout>
  );
}

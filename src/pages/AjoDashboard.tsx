import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { ajoGroupService } from '../services/ajoGroupService';
import { ajoService } from '../services/ajoService';
import UserLayout from '../components/UserLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

interface DashboardStats {
  activeGroups: number;
  personalBalance: number;
  unpaidContributions: number;
  reliabilityScore: number;
}

export default function AjoDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeGroups: 0,
    personalBalance: 0,
    unpaidContributions: 0,
    reliabilityScore: 0.8,
  });

  // Fetch user's groups
  const { data: groups, isLoading: groupsLoading, error: groupsError } = useQuery(
    ['ajo-groups'],
    async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data: userData } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', session.user.email)
        .single();

      if (!userData) return [];

      const { data } = await ajoGroupService.getUserGroups(userData.Id);
      return data || [];
    }
  );

  // Fetch personal Ajo
  const { data: personalAjo, isLoading: personalLoading } = useQuery(
    ['personal-ajo'],
    ajoService.getUserAjos
  );

  useEffect(() => {
    if (groups && personalAjo) {
      setStats({
        activeGroups: groups.length,
        personalBalance: personalAjo.data?.reduce((sum: number, ajo: any) => sum + (ajo.current_balance || 0), 0) || 0,
        unpaidContributions: 0, // TODO: Calculate from cycles
        reliabilityScore: 0.85,
      });
    }
  }, [groups, personalAjo]);

  const isLoading = groupsLoading || personalLoading;

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-green mb-4 tracking-tight">
            Ajo Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Manage your cooperative savings circles, track contributions, and grow your wealth together
          </p>
        </div>

        {/* Error State */}
        {groupsError && (
          <Alert type="error" className="max-w-7xl mx-auto mb-8">
            Failed to load Ajo data. Please try again.
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="max-w-7xl mx-auto mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Groups Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-semibold">Active Circles</h3>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-primary-green">{stats.activeGroups}</p>
                  <p className="text-sm text-gray-500 mt-2">Groups you're part of</p>
                </div>

                {/* Personal Balance Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-semibold">Personal Savings</h3>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-accent-orange">₦{stats.personalBalance.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">Total saved</p>
                </div>

                {/* Unpaid Contributions Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-semibold">Unpaid</h3>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-red-600">{stats.unpaidContributions}</p>
                  <p className="text-sm text-gray-500 mt-2">Contributions due</p>
                </div>

                {/* Reliability Score Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-semibold">Trust Score</h3>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{(stats.reliabilityScore * 100).toFixed(0)}%</p>
                  <p className="text-sm text-gray-500 mt-2">Reliability rating</p>
                </div>
              </div>
            </div>

            {/* Active Groups Section */}
            <div className="max-w-7xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Ajo Circles</h2>
              
              {groups && groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group: any) => (
                    <div
                      key={group.id}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 hover:border-green-400 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary-green">{group.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Active
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Members</span>
                          <span className="font-semibold text-gray-900">
                            {group.current_members}/{group.max_members}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-green h-2 rounded-full"
                            style={{
                              width: `${(group.current_members / group.max_members) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold">
                          Contribute
                        </button>
                        <button className="flex-1 px-4 py-2 border border-primary-green text-primary-green rounded-lg hover:bg-green-50 transition-colors font-semibold">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Ajo Circles Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Join or create cooperative savings circles to start saving with your community
                  </p>
                  <button className="px-8 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold">
                    Explore Circles
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="bg-gradient-to-r from-primary-green to-green-600 text-white rounded-2xl p-8 hover:shadow-xl transition-all hover:scale-105">
                  <div className="text-4xl mb-3">💳</div>
                  <h3 className="text-xl font-bold mb-2">Pay Contribution</h3>
                  <p className="text-green-100">Make your next payment</p>
                </button>

                <button className="bg-gradient-to-r from-accent-orange to-orange-500 text-white rounded-2xl p-8 hover:shadow-xl transition-all hover:scale-105">
                  <div className="text-4xl mb-3">💸</div>
                  <h3 className="text-xl font-bold mb-2">Withdraw Payout</h3>
                  <p className="text-orange-100">Claim your earnings</p>
                </button>

                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-8 hover:shadow-xl transition-all hover:scale-105">
                  <div className="text-4xl mb-3">➕</div>
                  <h3 className="text-xl font-bold mb-2">Join Circle</h3>
                  <p className="text-blue-100">Find new groups</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}

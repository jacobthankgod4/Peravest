import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAjoStats, useAjoGroups, useAjoTransactions, useAjoGraceNotices } from '../hooks/useAjoRealtime';
import { StatsCard, LineChartWidget, QuickAction, ListItem, EmptyState } from '../components/ajo/AjoDashboardWidgets';

export const AjoDashboardEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'transactions' | 'alerts'>('overview');
  
  const { data: stats, isLoading: statsLoading } = useAjoStats(Number(user?.id) || 0);
  const { data: groups, isLoading: groupsLoading } = useAjoGroups(Number(user?.id) || 0);
  const { data: transactions, isLoading: txLoading } = useAjoTransactions(Number(user?.id) || 0);
  const { data: graceNotices, isLoading: noticesLoading } = useAjoGraceNotices(Number(user?.id) || 0);

  const chartData = transactions?.slice(0, 7).reverse().map((tx, idx) => ({
    name: `Day ${idx + 1}`,
    value: tx.amount || 0
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ajo Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your savings circles and contributions</p>
      </div>

      {/* Stats Grid */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Active Groups"
            value={stats.activeGroups}
            subtitle="Circles you're in"
            icon="👥"
            color="green"
          />
          <StatsCard
            title="Total Contributed"
            value={`₦${stats.totalContributed.toLocaleString()}`}
            subtitle="All time"
            icon="💰"
            color="orange"
          />
          <StatsCard
            title="Withdrawal Locks"
            value={stats.withdrawalLocks}
            subtitle="Active restrictions"
            icon="🔒"
            color="blue"
          />
          <StatsCard
            title="Reliability Score"
            value={`${(stats.reliabilityScore * 100).toFixed(0)}%`}
            subtitle="Your trustworthiness"
            icon="⭐"
            trend={5}
            color="green"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <QuickAction
          icon="➕"
          label="Create Group"
          onClick={() => window.location.href = '/ajo/onboard?type=group'}
          color="green"
        />
        <QuickAction
          icon="🤝"
          label="Join Group"
          onClick={() => window.location.href = '/ajo/groups'}
          color="orange"
        />
        <QuickAction
          icon="💳"
          label="Contribute"
          onClick={() => window.location.href = '/ajo/contribute'}
          color="blue"
        />
        <QuickAction
          icon="💸"
          label="Withdraw"
          onClick={() => window.location.href = '/ajo/withdraw'}
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          {(['overview', 'groups', 'transactions', 'alerts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
                activeTab === tab
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {chartData.length > 0 ? (
                <LineChartWidget
                  title="Contribution Trend"
                  data={chartData}
                  dataKey="value"
                  height={300}
                />
              ) : (
                <EmptyState
                  icon="📊"
                  title="No Data Yet"
                  description="Start contributing to see your trends"
                  action={{ label: 'Make Contribution', onClick: () => window.location.href = '/ajo/contribute' }}
                />
              )}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div>
              {groupsLoading ? (
                <div className="text-center py-8">Loading groups...</div>
              ) : groups && groups.length > 0 ? (
                <div className="space-y-2">
                  {groups.map((group: any) => (
                    <ListItem
                      key={group.id}
                      title={group.ajo_groups?.name || 'Unknown Group'}
                      subtitle={`₦${group.ajo_groups?.contribution_amount} ${group.ajo_groups?.frequency}`}
                      value={`Position ${group.position}`}
                      status="active"
                      onClick={() => window.location.href = `/ajo/groups/${group.group_id}`}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="👥"
                  title="No Groups Yet"
                  description="Join or create an Ajo group to get started"
                  action={{ label: 'Browse Groups', onClick: () => window.location.href = '/ajo/groups' }}
                />
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              {txLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((tx: any) => (
                    <ListItem
                      key={tx.id}
                      title={tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)}
                      subtitle={new Date(tx.created_at).toLocaleDateString()}
                      value={`₦${tx.amount}`}
                      status={tx.status as any}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📝"
                  title="No Transactions"
                  description="Your transactions will appear here"
                />
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div>
              {noticesLoading ? (
                <div className="text-center py-8">Loading alerts...</div>
              ) : graceNotices && graceNotices.length > 0 ? (
                <div className="space-y-2">
                  {graceNotices.map((notice: any) => (
                    <div key={notice.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium text-yellow-900">⚠️ {notice.notice_type.replace('_', ' ')}</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Expires: {new Date(notice.expires).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="✅"
                  title="All Clear"
                  description="No active alerts or grace periods"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AjoDashboardEnhanced;

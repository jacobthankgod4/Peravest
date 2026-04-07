import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import UserLayout from '../components/UserLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function AjoProfile() {
  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery(
    ['user-profile'],
    async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('Email', session.user.email)
        .single();

      return data;
    }
  );

  // Fetch reliability score
  const { data: score, isLoading: scoreLoading } = useQuery(
    ['reliability-score'],
    async () => {
      if (!profile) return null;

      const { data } = await supabase
        .from('ajo_member_scores')
        .select('*')
        .eq('user_id', profile.Id)
        .single();

      return data;
    },
    { enabled: !!profile }
  );

  // Fetch contribution history
  const { data: history, isLoading: historyLoading } = useQuery(
    ['contribution-history'],
    async () => {
      if (!profile) return null;

      const { data } = await supabase
        .from('ajo_member_history')
        .select('*')
        .eq('user_id', profile.Id)
        .order('contribution_due_date', { ascending: false })
        .limit(10);

      return data || [];
    },
    { enabled: !!profile }
  );

  const isLoading = profileLoading || scoreLoading || historyLoading;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      </UserLayout>
    );
  }

  if (!profile) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4">
          <Alert type="error" className="max-w-2xl mx-auto">
            Unable to load profile. Please try again.
          </Alert>
        </div>
      </UserLayout>
    );
  }

  const reliabilityScore = score?.reliability_score || 1.0;
  const scorePercentage = Math.round(reliabilityScore * 100);

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl font-bold text-primary-green mb-12 text-center">My Profile</h1>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.FirstName} {profile.LastName}</h2>
                <p className="text-gray-600">{profile.Email}</p>
                <p className="text-gray-600">{profile.PhoneNumber}</p>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-primary-green to-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {profile.FirstName?.charAt(0)}{profile.LastName?.charAt(0)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">KYC Status</p>
                <p className="text-lg font-semibold text-blue-600">
                  {profile.kyc_status || 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Reliability Score */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reliability Score</h2>

            <div className="flex items-center justify-between mb-8">
              <div className="flex-1">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="8"
                      strokeDasharray={`${scorePercentage * 2.83} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary-green">{scorePercentage}%</p>
                      <p className="text-xs text-gray-600">Trusted</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
                  <p className="text-2xl font-bold text-gray-900">{score?.total_contributions || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">On-Time Rate</p>
                  <p className="text-2xl font-bold text-green-600">{score?.on_time_percentage || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Defaults</p>
                  <p className="text-2xl font-bold text-red-600">{score?.defaulted_contributions || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 Your reliability score determines your eligibility to join groups and affects your borrowing limits.
              </p>
            </div>
          </div>

          {/* Contribution History */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Contributions</h2>

            {history && history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Days Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(item.contribution_due_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          ₦{item.amount_paid?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {item.days_late || 0} days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No contributions yet</p>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

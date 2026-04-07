import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { ajoGroupService } from '../services/ajoGroupService';
import { ajoPositionService } from '../services/ajoPositionService';
import UserLayout from '../components/UserLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

interface WithdrawalState {
  withdrawalType: 'full' | 'partial';
  amount: number;
  bankAccount: string;
  confirmationCode: string;
}

export default function AjoWithdraw() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<WithdrawalState>({
    withdrawalType: 'full',
    amount: 0,
    bankAccount: '',
    confirmationCode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch group details
  const { data: groupResponse, isLoading: groupLoading } = useQuery(
    ['group-detail', groupId],
    () => ajoGroupService.getGroupDetails(parseInt(groupId || '0'))
  );
  const group = groupResponse?.data;

  // Fetch current cycle
  const { data: cycleResponse, isLoading: cycleLoading } = useQuery(
    ['current-cycle', groupId],
    () => ajoGroupService.getCurrentCycle(parseInt(groupId || '0'))
  );
  const cycle = cycleResponse?.data;

  // Check eligibility
  const { data: eligibility, isLoading: eligibilityLoading, error: eligibilityError } = useQuery(
    ['withdrawal-eligibility', groupId],
    async () => {
      if (!cycle) return null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;
        
        const { data: userData } = await supabase
          .from('user_accounts')
          .select('Id')
          .eq('Email', session.user.email)
          .single();

        if (!userData) return null;

        return await ajoPositionService.isPayoutEligible(
          parseInt(groupId || '0'),
          userData.Id,
          cycle.id
        );
      } catch (err) {
        console.error('Eligibility check error:', err);
        return null;
      }
    },
    { enabled: !!cycle }
  );

  // Set default amount
  useEffect(() => {
    if (cycle?.payout_amount) {
      setState(prev => ({ ...prev, amount: cycle.payout_amount }));
    }
  }, [cycle]);

  const handleWithdrawal = async () => {
    setIsProcessing(true);
    try {
      // TODO: Process withdrawal via backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate(`/ajo/dashboard?success=withdrawal&groupId=${groupId}`);
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = groupLoading || cycleLoading || eligibilityLoading;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      </UserLayout>
    );
  }

  const groupData = group as any;
  const cycleData = cycle as any;

  const isEligible = eligibility?.eligible || false;
  const maxWithdrawal = cycleData?.payout_amount || 0;
  const penalty = state.withdrawalType === 'partial' ? Math.round(maxWithdrawal * 0.1) : 0;
  const finalAmount = state.amount - penalty;

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-primary-green mb-2">Withdraw Payout</h1>
          <p className="text-lg text-gray-600">{groupData.name}</p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Eligibility Status */}
          {!isEligible && (
            <Alert type="error" className="mb-8">
              ❌ You are not eligible for withdrawal at this time. {eligibility?.reason}
            </Alert>
          )}

          {isEligible && (
            <Alert type="success" className="mb-8">
              ✅ You are eligible for withdrawal! Your payout is ready.
            </Alert>
          )}

          {/* Payout Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Available Payout */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Available Payout</p>
              <p className="text-4xl font-bold text-primary-green">₦{maxWithdrawal.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">From completed cycle</p>
            </div>

            {/* Cycle Status */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Cycle Status</p>
              <p className="text-2xl font-bold text-blue-600 capitalize">{cycleData.status}</p>
              <p className="text-xs text-gray-500 mt-2">
                Completed: {new Date(cycleData?.payout_date || cycleData?.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Withdrawal Details</h2>

            {/* Withdrawal Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Withdrawal Type
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-green hover:bg-green-50 transition-all">
                  <input
                    type="radio"
                    name="type"
                    value="full"
                    checked={state.withdrawalType === 'full'}
                    onChange={(e) => setState({ ...state, withdrawalType: e.target.value as 'full' | 'partial' })}
                    className="w-4 h-4 text-primary-green"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Full Withdrawal</p>
                    <p className="text-xs text-gray-600">Withdraw entire payout amount</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-green hover:bg-green-50 transition-all">
                  <input
                    type="radio"
                    name="type"
                    value="partial"
                    checked={state.withdrawalType === 'partial'}
                    onChange={(e) => setState({ ...state, withdrawalType: e.target.value as 'full' | 'partial' })}
                    className="w-4 h-4 text-primary-green"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Partial Withdrawal</p>
                    <p className="text-xs text-gray-600">Withdraw custom amount (10% penalty)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Amount Input */}
            {state.withdrawalType === 'partial' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-2xl text-gray-400">₦</span>
                  <input
                    type="number"
                    value={state.amount}
                    onChange={(e) => setState({ ...state, amount: Math.min(parseInt(e.target.value) || 0, maxWithdrawal) })}
                    max={maxWithdrawal}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent text-lg"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxWithdrawal}
                  value={state.amount}
                  onChange={(e) => setState({ ...state, amount: parseInt(e.target.value) })}
                  className="w-full mt-3"
                />
              </div>
            )}

            {/* Bank Account */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Account
              </label>
              <input
                type="text"
                placeholder="Select your bank account"
                value={state.bankAccount}
                onChange={(e) => setState({ ...state, bankAccount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Funds will be transferred to your registered account
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Withdrawal Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payout Amount</span>
                  <span className="font-semibold text-gray-900">₦{state.amount.toLocaleString()}</span>
                </div>
                {penalty > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Early Withdrawal Penalty (10%)</span>
                    <span className="font-semibold">-₦{penalty.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">You Will Receive</span>
                  <span className="text-xl font-bold text-primary-green">
                    ₦{finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={isProcessing || !isEligible || !state.bankAccount || state.amount <= 0}
                className="flex-1 px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner className="w-4 h-4" />
                    Processing...
                  </>
                ) : (
                  'Confirm Withdrawal'
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Note</h3>
            <p className="text-sm text-blue-800">
              Withdrawals are processed within 24-48 hours. You'll receive a confirmation email once your funds are transferred.
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

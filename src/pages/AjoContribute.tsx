import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contributionPaymentService } from '../services/contributionPaymentService';
import { formatCurrency, getFrequencyLabel } from '../utils/ajoFormValidation';
import Alert from '../components/Alert';

interface PendingContribution {
  id: number;
  cycle_id: number;
  group_id: number;
  amount_due: number;
  contribution_due_date: string;
  ajo_cycles: {
    cycle_number: number;
    status: string;
  };
  ajo_groups: {
    name: string;
    frequency: string;
  };
}

export const AjoContribute: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingContributions, setPendingContributions] = useState<PendingContribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<PendingContribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingContributions();
  }, [user]);

  const fetchPendingContributions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const contributions = await contributionPaymentService.getPendingContributions(typeof user?.id === 'string' ? parseInt(user.id) : (user?.id || 0));
      setPendingContributions(contributions);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending contributions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayContribution = async (contribution: PendingContribution) => {
    if (!user) {
      setError('You must be logged in');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const paymentInit = await contributionPaymentService.initializeContributionPayment({
        userId: typeof user?.id === 'string' ? parseInt(user.id) : (user?.id || 0),
        groupId: contribution.group_id,
        cycleId: contribution.cycle_id,
        amount: contribution.amount_due,
        email: user.email,
        fullName: user?.email?.split('@')[0] || 'User',
        phoneNumber: '+234',
      });

      // Redirect to Flutterwave
      window.location.href = paymentInit.link;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin text-5xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">Loading your contributions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary-green mb-2">Make a Contribution</h1>
          <p className="text-lg text-gray-600">
            Pay your pending Ajo contributions to stay on track
          </p>
        </div>

        {error && <Alert type="error" className="mb-8">{error}</Alert>}
        {success && <Alert type="success" className="mb-8">{success}</Alert>}

        {pendingContributions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-600 mb-8">You have no pending contributions at the moment.</p>
            <button
              onClick={() => navigate('/ajo/dashboard')}
              className="px-8 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contributions List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Contributions</h2>
              {pendingContributions.map((contribution) => (
                <button
                  key={contribution.id}
                  onClick={() => setSelectedContribution(contribution)}
                  className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                    selectedContribution?.id === contribution.id
                      ? 'bg-green-50 border-primary-green'
                      : 'bg-white border-gray-200 hover:border-primary-green'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{contribution.ajo_groups.name}</p>
                      <p className="text-sm text-gray-600">
                        Cycle {contribution.ajo_cycles.cycle_number}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary-green">
                      {formatCurrency(contribution.amount_due)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(contribution.contribution_due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-semibold text-gray-900">
                        {getFrequencyLabel(contribution.ajo_groups.frequency)}
                      </span>
                    </div>
                  </div>

                  {new Date(contribution.contribution_due_date) < new Date() && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-semibold">
                      ⚠️ Overdue
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Payment Summary */}
            {selectedContribution && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h2>

                <div className="space-y-6 mb-8">
                  {/* Group Info */}
                  <div className="pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Group</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedContribution.ajo_groups.name}
                    </p>
                  </div>

                  {/* Cycle Info */}
                  <div className="pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Cycle</p>
                    <p className="text-xl font-bold text-gray-900">
                      Cycle {selectedContribution.ajo_cycles.cycle_number}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                    <p className="text-3xl font-bold text-primary-green">
                      {formatCurrency(selectedContribution.amount_due)}
                    </p>
                  </div>

                  {/* Due Date */}
                  <div className="pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Due Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(selectedContribution.contribution_due_date).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {new Date(selectedContribution.contribution_due_date) < new Date() && (
                      <p className="text-sm text-red-600 font-semibold mt-2">
                        ⚠️ This contribution is overdue
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">💡 Tip:</span> Pay on time to maintain your reliability score and stay in good standing with your group.
                  </p>
                </div>

                {/* Payment Button */}
                <button
                  onClick={() => handlePayContribution(selectedContribution)}
                  disabled={isProcessing}
                  className="w-full px-6 py-4 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-bold text-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      Pay {formatCurrency(selectedContribution.amount_due)}
                    </>
                  )}
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  By clicking Pay, you agree to our Terms of Service
                </p>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/ajo/dashboard')}
            className="text-primary-green hover:text-green-600 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AjoContribute;

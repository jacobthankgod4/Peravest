import React, { useState, useEffect } from 'react';
import { ajoJoinRequestService } from '../../services/ajoJoinRequestService';

interface ApprovalQueueProps {
  groupId: number;
  isOwner: boolean;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ groupId, isOwner }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
    subscribeToUpdates();
  }, [groupId]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await ajoJoinRequestService.getGroupJoinRequests(groupId);
      if (err) throw err;
      setRequests(data || []);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Failed to load join requests');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const subscription = ajoJoinRequestService.subscribeToJoinRequests(groupId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setRequests(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setRequests(prev =>
          prev.map(r => (r.id === payload.new.id ? payload.new : r))
        );
      } else if (payload.eventType === 'DELETE') {
        setRequests(prev => prev.filter(r => r.id !== payload.old.id));
      }
    });

    return () => subscription?.unsubscribe();
  };

  const handleApprove = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const { error: err } = await ajoJoinRequestService.approveJoinRequest(requestId, 0);
      if (err) throw err;
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const reason = rejectionReason[requestId] || 'Request rejected';
      const { error: err } = await ajoJoinRequestService.rejectJoinRequest(requestId, 0, reason);
      if (err) throw err;
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setShowRejectForm(null);
      setRejectionReason(prev => {
        const newReasons = { ...prev };
        delete newReasons[requestId];
        return newReasons;
      });
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOwner) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Only group owners can view join requests.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-green rounded-full" />
        </div>
        <p className="text-gray-600 mt-4">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">⚠️ {error}</p>
        <button
          onClick={loadRequests}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No pending join requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Pending Requests ({requests.length})
        </h3>
      </div>

      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {request.user_accounts?.FirstName} {request.user_accounts?.LastName}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {request.user_accounts?.Email}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Requested: {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              Pending
            </span>
          </div>

          {showRejectForm === request.id && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason (optional)
              </label>
              <textarea
                value={rejectionReason[request.id] || ''}
                onChange={(e) =>
                  setRejectionReason(prev => ({
                    ...prev,
                    [request.id]: e.target.value,
                  }))
                }
                placeholder="Explain why you're rejecting this request..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-3">
            {showRejectForm === request.id ? (
              <>
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={processingId === request.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition-colors"
                >
                  {processingId === request.id ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => setShowRejectForm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={processingId === request.id}
                  className="flex-1 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold transition-colors"
                >
                  {processingId === request.id ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectForm(request.id)}
                  disabled={processingId === request.id}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-semibold transition-colors"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalQueue;

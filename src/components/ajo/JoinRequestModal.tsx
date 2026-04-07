import React, { useState, useEffect } from 'react';
import { ajoJoinRequestService } from '../../services/ajoJoinRequestService';
import { ajoGroupBrowseService } from '../../services/ajoGroupBrowseService';

interface JoinRequestModalProps {
  isOpen: boolean;
  groupId: number;
  groupName: string;
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  isOpen,
  groupId,
  groupName,
  userId,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canJoin, setCanJoin] = useState(true);
  const [joinReason, setJoinReason] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      checkEligibility();
    }
  }, [isOpen, groupId, userId]);

  const checkEligibility = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if can join
      const eligibility = await ajoGroupBrowseService.canUserJoinGroup(userId, groupId);
      setCanJoin(eligibility.canJoin);
      if (!eligibility.canJoin) {
        setJoinReason(eligibility.reason);
      }

      // Check for existing request
      const request = await ajoJoinRequestService.getJoinRequestStatus(userId, groupId);
      if (request.data) {
        setExistingRequest(request.data);
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError('Failed to check eligibility');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ajoJoinRequestService.submitJoinRequest(userId, groupId);

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting join request:', err);
      setError('Failed to submit join request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!existingRequest) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await ajoJoinRequestService.cancelJoinRequest(existingRequest.id, userId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setExistingRequest(null);
      onClose();
    } catch (err) {
      console.error('Error cancelling request:', err);
      setError('Failed to cancel request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Join Group</h2>
          <p className="text-gray-600 mt-1">{groupName}</p>
        </div>

        {/* Loading State */}
        {isLoading && !existingRequest && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-green rounded-full" />
            </div>
            <p className="text-gray-600 mt-4">Checking eligibility...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Existing Request State */}
        {existingRequest && !isLoading && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 font-medium mb-2">Request Status</p>
              <p className="text-blue-800 text-sm">
                Your join request is currently{' '}
                <span className="font-semibold capitalize">{existingRequest.status}</span>
              </p>
              <p className="text-blue-700 text-xs mt-2">
                Submitted: {new Date(existingRequest.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelRequest}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-semibold transition-colors"
              >
                Cancel Request
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Eligibility Check */}
        {!isLoading && !existingRequest && (
          <div className="space-y-4">
            {!canJoin ? (
              <>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-900 font-medium mb-2">⚠️ Cannot Join</p>
                  <p className="text-yellow-800 text-sm">{joinReason}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">How to improve:</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✓ Complete your profile and KYC verification</li>
                    <li>✓ Make timely contributions to existing groups</li>
                    <li>✓ Maintain a good payment history</li>
                    <li>✓ Build your reliability score over time</li>
                  </ul>
                </div>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-900 font-medium mb-2">✓ You're eligible to join</p>
                  <p className="text-green-800 text-sm">
                    Your reliability score meets the group requirements
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-3">What happens next:</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex gap-3">
                      <span className="text-primary-green font-bold">1</span>
                      <span>Submit your join request</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary-green font-bold">2</span>
                      <span>Group owner reviews your request</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary-green font-bold">3</span>
                      <span>You'll be notified of approval</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary-green font-bold">4</span>
                      <span>Start contributing to the group</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitRequest}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold transition-colors"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestModal;

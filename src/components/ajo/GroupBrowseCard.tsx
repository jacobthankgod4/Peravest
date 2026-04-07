import React, { useState } from 'react';

interface GroupBrowseCardProps {
  id: number;
  name: string;
  description: string;
  frequency: string;
  contribution_amount: number;
  current_members: number;
  max_members: number;
  avg_reliability_score: number;
  next_payout_date: string;
  cycle_number: number;
  total_cycles: number;
  onJoinClick: () => void;
  onDetailsClick: () => void;
  isLoading?: boolean;
}

export const GroupBrowseCard: React.FC<GroupBrowseCardProps> = ({
  id,
  name,
  description,
  frequency,
  contribution_amount,
  current_members,
  max_members,
  avg_reliability_score,
  next_payout_date,
  cycle_number,
  total_cycles,
  onJoinClick,
  onDetailsClick,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const memberPercentage = (current_members / max_members) * 100;
  const scorePercentage = avg_reliability_score * 100;
  const trustLevel = scorePercentage >= 85 ? 'Excellent' : scorePercentage >= 70 ? 'Good' : 'Fair';
  const trustColor = scorePercentage >= 85 ? 'text-green-600' : scorePercentage >= 70 ? 'text-blue-600' : 'text-yellow-600';

  const frequencyLabel = {
    daily: '📅 Daily',
    weekly: '📆 Weekly',
    monthly: '📊 Monthly',
  }[frequency] || frequency;

  return (
    <div
      className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:border-green-400 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onDetailsClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-primary-green line-clamp-2">{name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
        </div>
        <div className="ml-2 flex-shrink-0">
          {current_members >= max_members ? (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
              Full
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              Open
            </span>
          )}
        </div>
      </div>

      {/* Frequency & Amount */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-gray-700">{frequencyLabel}</span>
        <span className="font-semibold text-primary-green">₦{contribution_amount.toLocaleString()}</span>
      </div>

      {/* Members Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Members</span>
          <span className="text-sm font-semibold text-gray-900">
            {current_members}/{max_members}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-primary-green to-green-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(memberPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Trust Score */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Trust Score</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${trustColor}`}>
              {scorePercentage.toFixed(0)}%
            </span>
            <span className="text-xs text-gray-600">{trustLevel}</span>
          </div>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-1.5 mt-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              scorePercentage >= 85
                ? 'bg-green-500'
                : scorePercentage >= 70
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>

      {/* Cycle Info */}
      <div className="mb-4 text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Cycle Progress:</span>
          <span className="font-semibold text-gray-900">
            {cycle_number}/{total_cycles}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Next Payout:</span>
          <span className="font-semibold text-gray-900">
            {new Date(next_payout_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetailsClick();
          }}
          className="flex-1 px-4 py-2 border border-primary-green text-primary-green rounded-lg hover:bg-green-50 transition-colors font-semibold text-sm"
        >
          Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoinClick();
          }}
          disabled={isLoading || current_members >= max_members}
          className="flex-1 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
        >
          {isLoading ? 'Loading...' : 'Join'}
        </button>
      </div>

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/5 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

export default GroupBrowseCard;

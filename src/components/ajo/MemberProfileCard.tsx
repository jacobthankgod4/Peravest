import React, { useState } from 'react';
import { KYCBadge } from './KYCBadge';

interface MemberProfileCardProps {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycVerifiedDate?: string;
  reliabilityScore: number;
  guarantorCount?: number;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  position?: number;
  onClick?: () => void;
  showDetails?: boolean;
}

export const MemberProfileCard: React.FC<MemberProfileCardProps> = ({
  memberId,
  firstName,
  lastName,
  email,
  photoUrl,
  kycStatus,
  kycVerifiedDate,
  reliabilityScore,
  guarantorCount = 0,
  paymentStatus = 'pending',
  position,
  onClick,
  showDetails = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);

  const scoreColor = reliabilityScore >= 0.85 ? 'text-green-600' : reliabilityScore >= 0.7 ? 'text-blue-600' : 'text-yellow-600';
  const scoreLabel = reliabilityScore >= 0.85 ? 'Excellent' : reliabilityScore >= 0.7 ? 'Good' : 'Fair';

  const paymentStatusConfig = {
    paid: { icon: '✓', color: 'text-green-600', bg: 'bg-green-50', label: 'Paid' },
    pending: { icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
    overdue: { icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' },
  };

  const paymentConfig = paymentStatusConfig[paymentStatus];

  // Mask email
  const maskedEmail = email.split('@')[0].substring(0, 3) + '***@' + email.split('@')[1];

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Header with Position */}
      {position && (
        <div className="absolute top-2 right-2 bg-primary-green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {position}
        </div>
      )}

      {/* Photo */}
      <div className="mb-3 flex justify-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary-green shadow-md"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-green to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-center font-bold text-gray-900 text-sm truncate">
        {firstName} {lastName}
      </h3>

      {/* Email */}
      <p
        className="text-center text-xs text-gray-600 truncate cursor-help"
        onMouseEnter={() => setShowFullEmail(true)}
        onMouseLeave={() => setShowFullEmail(false)}
        title={email}
      >
        {showFullEmail ? email : maskedEmail}
      </p>

      {/* KYC Badge */}
      <div className="flex justify-center mt-2 mb-3">
        <KYCBadge
          status={kycStatus}
          verifiedDate={kycVerifiedDate}
          size="sm"
          showTooltip={true}
        />
      </div>

      {/* Reliability Score */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-700">Trust Score</span>
          <span className={`text-xs font-bold ${scoreColor}`}>
            {(reliabilityScore * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              reliabilityScore >= 0.85
                ? 'bg-green-500'
                : reliabilityScore >= 0.7
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${reliabilityScore * 100}%` }}
          />
        </div>
        <p className={`text-xs mt-1 font-semibold ${scoreColor}`}>{scoreLabel}</p>
      </div>

      {/* Payment Status */}
      <div className={`flex items-center justify-center gap-1 p-2 rounded-lg ${paymentConfig.bg} mb-3`}>
        <span className={paymentConfig.color}>{paymentConfig.icon}</span>
        <span className={`text-xs font-semibold ${paymentConfig.color}`}>
          {paymentConfig.label}
        </span>
      </div>

      {/* Guarantor Badge */}
      {guarantorCount > 0 && (
        <div className="flex items-center justify-center gap-1 p-2 bg-blue-50 rounded-lg mb-3">
          <span className="text-blue-600">🤝</span>
          <span className="text-xs font-semibold text-blue-600">
            {guarantorCount} Guarantor{guarantorCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Details Button */}
      {showDetails && (
        <button className="w-full px-3 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-semibold">
          View Profile
        </button>
      )}

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/5 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

// Compact version for tables
export const MemberProfileCompact: React.FC<Omit<MemberProfileCardProps, 'showDetails'>> = ({
  firstName,
  lastName,
  photoUrl,
  kycStatus,
  reliabilityScore,
  paymentStatus,
  onClick,
}) => {
  const scoreColor = reliabilityScore >= 0.85 ? 'text-green-600' : reliabilityScore >= 0.7 ? 'text-blue-600' : 'text-yellow-600';

  return (
    <div
      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Photo */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-10 h-10 rounded-full object-cover border border-primary-green"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-green to-green-600 flex items-center justify-center text-white text-sm font-bold">
          {firstName.charAt(0)}{lastName.charAt(0)}
        </div>
      )}

      {/* Name & KYC */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {firstName} {lastName}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <KYCBadge status={kycStatus} size="sm" showTooltip={false} />
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className={`text-sm font-bold ${scoreColor}`}>
          {(reliabilityScore * 100).toFixed(0)}%
        </p>
        <p className="text-xs text-gray-500">
          {paymentStatus === 'paid' ? '✓' : paymentStatus === 'overdue' ? '⚠️' : '⏳'}
        </p>
      </div>
    </div>
  );
};

export default MemberProfileCard;

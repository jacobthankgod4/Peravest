import React, { useState } from 'react';

interface KYCBadgeProps {
  status: 'pending' | 'verified' | 'rejected';
  verifiedDate?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onClick?: () => void;
}

export const KYCBadge: React.FC<KYCBadgeProps> = ({
  status,
  verifiedDate,
  size = 'md',
  showTooltip = true,
  onClick,
}) => {
  const [showTooltipContent, setShowTooltipContent] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const statusConfig = {
    verified: {
      icon: '✓',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      label: 'KYC Verified',
      description: 'Identity verified and approved',
    },
    pending: {
      icon: '⏳',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300',
      label: 'KYC Pending',
      description: 'Verification in progress',
    },
    rejected: {
      icon: '✕',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      label: 'KYC Rejected',
      description: 'Verification failed. Please try again.',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="relative inline-block">
      {/* Badge */}
      <div
        className={`
          flex items-center justify-center
          ${sizeClasses[size]}
          ${config.bgColor}
          ${config.textColor}
          border-2 ${config.borderColor}
          rounded-full
          font-bold
          cursor-pointer
          hover:shadow-md
          transition-all
          ${onClick ? 'hover:scale-110' : ''}
        `}
        onClick={onClick}
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => setShowTooltipContent(false)}
        title={config.label}
      >
        {config.icon}
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-xs">
            <p className="font-semibold">{config.label}</p>
            <p className="text-gray-200">{config.description}</p>
            {verifiedDate && (
              <p className="text-gray-300 mt-1">
                {new Date(verifiedDate).toLocaleDateString()}
              </p>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Badge (for text)
export const KYCBadgeInline: React.FC<KYCBadgeProps> = ({
  status,
  verifiedDate,
  showTooltip = true,
}) => {
  const [showTooltipContent, setShowTooltipContent] = useState(false);

  const statusConfig = {
    verified: {
      icon: '✓',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      label: 'KYC Verified',
      description: 'Identity verified and approved',
    },
    pending: {
      icon: '⏳',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      label: 'KYC Pending',
      description: 'Verification in progress',
    },
    rejected: {
      icon: '✕',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      label: 'KYC Rejected',
      description: 'Verification failed. Please try again.',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="relative inline-block">
      <span
        className={`
          inline-flex items-center gap-1
          px-2 py-1
          ${config.bgColor}
          ${config.textColor}
          rounded-full
          text-xs font-semibold
          cursor-help
        `}
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => setShowTooltipContent(false)}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>

      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-xs">
            <p className="font-semibold">{config.label}</p>
            <p className="text-gray-200">{config.description}</p>
            {verifiedDate && (
              <p className="text-gray-300 mt-1">
                {new Date(verifiedDate).toLocaleDateString()}
              </p>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCBadge;

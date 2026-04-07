import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { calculateTotalContribution, formatCurrency, getFrequencyLabel } from '../../utils/ajoFormValidation';

export const GroupAjoForm: React.FC = () => {
  const { formData, errors, updateFormData, goBack, goNext } = useOnboarding();

  const totalPerCycle = (formData.contributionAmount || 0) * (formData.maxMembers || 1);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <div className="mb-8">
        <button
          onClick={goBack}
          className="text-primary-green hover:text-green-600 font-semibold text-sm flex items-center gap-2"
        >
          ← Back to Type Selection
        </button>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Ajo Circle</h2>
      <p className="text-gray-600 mb-8">Set up a cooperative savings group with friends and community</p>

      <div className="space-y-8">
        {/* Group Information Section */}
        <div className="pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Group Information</h3>

          {/* Group Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Group Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.groupName || ''}
              onChange={(e) => updateFormData({ groupName: e.target.value })}
              placeholder="e.g., Market Women Circle, Office Savings Club"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all ${
                errors.groupName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.groupName && (
              <p className="text-red-500 text-sm mt-1">{errors.groupName}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">3-100 characters</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Group Description
            </label>
            <textarea
              value={formData.groupDescription || ''}
              onChange={(e) => updateFormData({ groupDescription: e.target.value })}
              placeholder="Tell members about your group, its purpose, and values..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">Optional - helps attract the right members</p>
          </div>
        </div>

        {/* Contribution Settings Section */}
        <div className="pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contribution Settings</h3>

          {/* Contribution Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Per Member Contribution (₦)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={formData.contributionAmount}
              onChange={(e) => updateFormData({ contributionAmount: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 5,000"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all ${
                errors.contributionAmount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contributionAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.contributionAmount}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Minimum: ₦1,000 | Maximum: ₦10,000,000</p>
          </div>

          {/* Frequency */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contribution Frequency
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => updateFormData({ frequency: freq as any })}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    formData.frequency === freq
                      ? 'bg-primary-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getFrequencyLabel(freq)}
                </button>
              ))}
            </div>
            {errors.frequency && (
              <p className="text-red-500 text-sm mt-2">{errors.frequency}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cycle Duration (months)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="60"
                value={formData.duration}
                onChange={(e) => updateFormData({ duration: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-green"
              />
              <span className="text-lg font-bold text-primary-green min-w-12">{formData.duration}m</span>
            </div>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-2">{errors.duration}</p>
            )}
          </div>
        </div>

        {/* Group Settings Section */}
        <div className="pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Group Settings</h3>

          {/* Max Members */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Members
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="50"
                value={formData.maxMembers || 10}
                onChange={(e) => updateFormData({ maxMembers: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-green"
              />
              <span className="text-lg font-bold text-primary-green min-w-12">{formData.maxMembers || 10}</span>
            </div>
            {errors.maxMembers && (
              <p className="text-red-500 text-sm mt-2">{errors.maxMembers}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">2-50 members</p>
          </div>

          {/* Reliability Threshold */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Trust Score (0-1)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.reliabilityThreshold || 0.7}
                onChange={(e) => updateFormData({ reliabilityThreshold: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-green"
              />
              <span className="text-lg font-bold text-primary-green min-w-12">
                {((formData.reliabilityThreshold || 0.7) * 100).toFixed(0)}%
              </span>
            </div>
            {errors.reliabilityThreshold && (
              <p className="text-red-500 text-sm mt-2">{errors.reliabilityThreshold}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Only members with this score can join</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
          <h3 className="font-semibold text-gray-900 mb-4">Group Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Per Member:</span>
              <span className="font-bold text-primary-green">{formatCurrency(formData.contributionAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Max Members:</span>
              <span className="font-bold text-gray-900">{formData.maxMembers || 10}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Per Cycle Total:</span>
              <span className="font-bold text-orange-600">{formatCurrency(totalPerCycle)}</span>
            </div>
            <div className="border-t border-orange-200 pt-3 flex justify-between items-center">
              <span className="text-gray-900 font-semibold">Payout per Member:</span>
              <span className="text-2xl font-bold text-primary-green">{formatCurrency(totalPerCycle)}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 How it works:</span> Each member contributes {formatCurrency(formData.contributionAmount)} {getFrequencyLabel(formData.frequency).toLowerCase()}. After each cycle, one member receives the full pool.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={goBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Back
        </button>
        <button
          onClick={goNext}
          className="flex-1 px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { calculateTotalContribution, formatCurrency, getFrequencyLabel } from '../../utils/ajoFormValidation';

export const PersonalAjoForm: React.FC = () => {
  const { formData, errors, updateFormData, goBack, goNext } = useOnboarding();

  const totalContribution = calculateTotalContribution(
    formData.contributionAmount,
    formData.frequency,
    formData.duration
  );

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

      <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Ajo Details</h2>
      <p className="text-gray-600 mb-8">Set up your personal savings plan with flexible terms</p>

      <div className="space-y-6 mb-8">
        {/* Contribution Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contribution Amount (₦)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            value={formData.contributionAmount}
            onChange={(e) => updateFormData({ contributionAmount: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 10,000"
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
        <div>
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
            Duration (months)
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

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormData({ startDate: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 mb-8 border border-green-200">
        <h3 className="font-semibold text-gray-900 mb-4">Your Savings Plan</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Per {getFrequencyLabel(formData.frequency).toLowerCase()}:</span>
            <span className="font-bold text-primary-green">{formatCurrency(formData.contributionAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Duration:</span>
            <span className="font-bold text-gray-900">{formData.duration} months</span>
          </div>
          <div className="border-t border-green-200 pt-3 flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Total Savings:</span>
            <span className="text-2xl font-bold text-primary-green">{formatCurrency(totalContribution)}</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Your savings will be locked until the end of your plan. You can withdraw early with a penalty.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
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

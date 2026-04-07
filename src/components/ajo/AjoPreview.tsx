import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { calculateTotalContribution, formatCurrency, getFrequencyLabel } from '../../utils/ajoFormValidation';

export const AjoPreview: React.FC = () => {
  const { formData, goBack, goNext } = useOnboarding();

  const isPersonal = formData.type === 'personal';
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
          ← Back to Edit
        </button>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Ajo</h2>
      <p className="text-gray-600 mb-8">Please review all details before proceeding to payment</p>

      {/* Type Badge */}
      <div className="mb-8">
        <div className="inline-block">
          <span className={`px-4 py-2 rounded-full font-semibold text-white ${
            isPersonal ? 'bg-primary-green' : 'bg-orange-500'
          }`}>
            {isPersonal ? '👤 Personal Ajo' : '👥 Group Ajo'}
          </span>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Contribution Amount</p>
              <p className="text-3xl font-bold text-primary-green">
                {formatCurrency(formData.contributionAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per {getFrequencyLabel(formData.frequency).toLowerCase()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Frequency</p>
              <p className="text-xl font-semibold text-gray-900">
                {getFrequencyLabel(formData.frequency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-xl font-semibold text-gray-900">
                {formData.duration} months
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Start Date</p>
              <p className="text-xl font-semibold text-gray-900">
                {new Date(formData.startDate).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right Column - Group Info or Total */}
          {isPersonal ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Total Savings</p>
                <p className="text-3xl font-bold text-primary-green mb-4">
                  {formatCurrency(totalContribution)}
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold">Locked Period:</span> {formData.duration} months
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Early Withdrawal:</span> 10% penalty
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Interest Rate:</span> 0% (savings only)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Group Name</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">
                  {formData.groupName}
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold">Max Members:</span> {formData.maxMembers}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Per Cycle Pool:</span> {formatCurrency((formData.contributionAmount || 0) * (formData.maxMembers || 1))}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Trust Score Required:</span> {((formData.reliabilityThreshold || 0.7) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Details */}
      {!isPersonal && formData.groupDescription && (
        <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold mb-2">Group Description</p>
          <p className="text-blue-900">{formData.groupDescription}</p>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="bg-amber-50 rounded-lg p-6 mb-8 border border-amber-200">
        <p className="text-sm text-amber-900 font-semibold mb-3">⚠️ Important Terms</p>
        <ul className="space-y-2 text-sm text-amber-900">
          <li>✓ Your contribution will be locked for the specified duration</li>
          <li>✓ {isPersonal ? 'Early withdrawal incurs a 10% penalty' : 'Members must contribute on time to maintain group trust'}</li>
          <li>✓ All transactions are recorded and cannot be reversed</li>
          <li>✓ You agree to our Terms of Service and Privacy Policy</li>
        </ul>
      </div>

      {/* Confirmation Checkbox */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="mt-1 w-5 h-5 accent-primary-green rounded"
          />
          <span className="text-sm text-gray-700">
            I have reviewed all details and agree to proceed with this {isPersonal ? 'Personal Ajo' : 'Group Ajo'} setup
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={goBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Back to Edit
        </button>
        <button
          onClick={goNext}
          className="flex-1 px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <span>Proceed to Payment</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ajoService } from '../services/ajoService';
import UserLayout from '../components/UserLayout';
import Alert from '../components/Alert';
import { AjoFormData } from '../types/ajo';

type AjoType = 'personal' | 'group';

interface FormData {
  type: AjoType;
  contributionAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  duration: number;
  startDate: string;
  groupName?: string;
  groupDescription?: string;
  maxMembers?: number;
  reliabilityThreshold?: number;
}

export default function AjoOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'type' | 'form' | 'preview'>('type');
  const [formData, setFormData] = useState<AjoFormData>({
    type: 'personal',
    contributionAmount: 10000,
    frequency: 'monthly',
    duration: 12,
    startDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (type: AjoType) => {
    setFormData({ ...formData, type });
    setStep('form');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const result = await ajoService.createAjo(formData as any);
      navigate('/ajo/dashboard?success=created');
    } catch (err: any) {
      setError(err.message || 'Failed to create Ajo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl font-bold text-primary-green mb-2 text-center">Start Your Ajo</h1>
          <p className="text-lg text-gray-600 text-center mb-12">
            Create a personal savings plan or start a group circle
          </p>

          {error && <Alert type="error" className="mb-8">{error}</Alert>}

          {/* Step 1: Type Selection */}
          {step === 'type' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Option */}
              <button
                onClick={() => handleTypeSelect('personal')}
                className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-primary-green hover:shadow-xl transition-all text-left"
              >
                <div className="text-5xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Ajo</h2>
                <p className="text-gray-600 mb-6">
                  Save money on your own with flexible terms and full control
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Set your own amount</li>
                  <li>✓ Choose frequency</li>
                  <li>✓ Flexible duration</li>
                  <li>✓ Full control</li>
                </ul>
              </button>

              {/* Group Option */}
              <button
                onClick={() => handleTypeSelect('group')}
                className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-primary-green hover:shadow-xl transition-all text-left"
              >
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Ajo</h2>
                <p className="text-gray-600 mb-6">
                  Create a cooperative circle with friends and community members
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Invite members</li>
                  <li>✓ Set group rules</li>
                  <li>✓ Shared responsibility</li>
                  <li>✓ Community trust</li>
                </ul>
              </button>
            </div>
          )}

          {/* Step 2: Form */}
          {step === 'form' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="mb-8">
                <button
                  onClick={() => setStep('type')}
                  className="text-primary-green hover:text-green-600 font-semibold text-sm"
                >
                  ← Back to Type Selection
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {formData.type === 'personal' ? 'Personal Ajo Details' : 'Group Ajo Details'}
              </h2>

              {/* Common Fields */}
              <div className="space-y-6 mb-8">
                {/* Contribution Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contribution Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.contributionAmount}
                    onChange={(e) => handleFormChange('contributionAmount', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleFormChange('frequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                    min="1"
                    max="60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>
              </div>

              {/* Group-Specific Fields */}
              {formData.type === 'group' && (
                <div className="space-y-6 mb-8 pb-8 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Group Information</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={formData.groupName || ''}
                      onChange={(e) => handleFormChange('groupName', e.target.value)}
                      placeholder="e.g., Market Women Circle"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.groupDescription || ''}
                      onChange={(e) => handleFormChange('groupDescription', e.target.value)}
                      placeholder="Tell members about your group..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Members
                    </label>
                    <input
                      type="number"
                      value={formData.maxMembers || 10}
                      onChange={(e) => handleFormChange('maxMembers', parseInt(e.target.value))}
                      min="2"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Trust Score (0-1)
                    </label>
                    <input
                      type="number"
                      value={formData.reliabilityThreshold || 0.7}
                      onChange={(e) => handleFormChange('reliabilityThreshold', parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Type:</span> <span className="font-semibold capitalize">{formData.type}</span></p>
                  <p><span className="text-gray-600">Amount:</span> <span className="font-semibold">₦{formData.contributionAmount.toLocaleString()}</span></p>
                  <p><span className="text-gray-600">Frequency:</span> <span className="font-semibold capitalize">{formData.frequency}</span></p>
                  <p><span className="text-gray-600">Duration:</span> <span className="font-semibold">{formData.duration} months</span></p>
                  {formData.type === 'group' && (
                    <>
                      <p><span className="text-gray-600">Group:</span> <span className="font-semibold">{formData.groupName}</span></p>
                      <p><span className="text-gray-600">Max Members:</span> <span className="font-semibold">{formData.maxMembers}</span></p>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('type')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
                >
                  {isSubmitting ? 'Creating...' : 'Create Ajo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

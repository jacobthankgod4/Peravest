import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useInvestment } from '../hooks/useInvestment';
import { useInvestmentCalculator } from '../hooks/useInvestmentCalculator';
import { investmentService } from '../services/investmentService';
import { AlertCircle, Calculator, TrendingUp } from 'lucide-react';

const InvestNow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { setInvestmentData } = useInvestment();
  const { calculateReturns, validateAmount } = useInvestmentCalculator();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(6);
  const [showCalculator, setShowCalculator] = useState(false);
  const [validationError, setValidationError] = useState('');

  const propertyId = searchParams.get('property_id');
  const identity = searchParams.get('identity');
  const cost = searchParams.get('cost');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    checkInvestmentEligibility();
  }, [isAuthenticated, propertyId, navigate, location]);

  const checkInvestmentEligibility = async () => {
    if (!propertyId) {
      setError('Invalid property selection');
      setChecking(false);
      return;
    }

    try {
      const isDuplicate = await investmentService.checkDuplicateInvestment(propertyId);
      
      if (isDuplicate) {
        setError('You already have an active investment in this property');
        setChecking(false);
        return;
      }

      setChecking(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setChecking(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const validation = validateAmount(Number(value));
    setValidationError(validation.error || '');
  };

  const handleInvest = () => {
    const validation = validateAmount(Number(amount));
    if (!validation.isValid) {
      setValidationError(validation.error || '');
      return;
    }

    navigate('/checkout', {
      state: {
        type: 'property',
        propertyId: propertyId || '',
        amount: Number(amount),
        duration: period,
        roi: period === 6 ? 15 : period === 12 ? 25 : period === 24 ? 45 : 80,
        firstPayment: Number(amount),
        identity: identity || '',
        cost: cost || amount
      }
    });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying investment eligibility...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/listings')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Other Properties
          </button>
        </div>
      </div>
    );
  }

  const calculation = amount ? calculateReturns(Number(amount), period) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Invest Now</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter amount (minimum ₦5,000)"
              />
              {validationError && (
                <p className="mt-2 text-sm text-red-600">{validationError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={6}>6 Months (15% ROI)</option>
                <option value={12}>12 Months (25% ROI)</option>
                <option value={24}>24 Months (45% ROI)</option>
                <option value={60}>60 Months (80% ROI)</option>
              </select>
            </div>

            {calculation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">Investment Returns</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Principal Amount:</p>
                    <p className="font-semibold text-gray-900">₦{(calculation.principal || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Interest Earned:</p>
                    <p className="font-semibold text-green-600">₦{(calculation.interest || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Returns:</p>
                    <p className="font-bold text-green-700 text-lg">₦{calculation.totalReturns.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ROI:</p>
                    <p className="font-semibold text-green-600">{calculation.roi}%</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleInvest}
                disabled={!amount || !!validationError}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Proceed to Payment
              </button>
              <button
                onClick={() => navigate('/listings')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestNow;

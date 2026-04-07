import React, { createContext, useContext, useState } from 'react';
import { AjoFormData } from '../types/ajo';

interface OnboardingContextType {
  formData: AjoFormData;
  setFormData: (data: AjoFormData) => void;
  updateFormData: (updates: Partial<AjoFormData>) => void;
  goBack: () => void;
  goNext: () => void;
  currentStep: number;
  resetForm: () => void;
  errors: { [key: string]: string };
  setErrors: (errors: { [key: string]: string }) => void;
}

const defaultFormData: AjoFormData = {
  type: 'personal',
  contributionAmount: 10000,
  frequency: 'monthly',
  duration: 12,
  startDate: new Date().toISOString().split('T')[0],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<AjoFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const goBack = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const goNext = () => setCurrentStep(prev => prev + 1);
  const updateFormData = (updates: Partial<AjoFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  const resetForm = () => {
    setFormData(defaultFormData);
    setCurrentStep(0);
    setErrors({});
  };

  return (
    <OnboardingContext.Provider value={{ formData, setFormData, updateFormData, goBack, goNext, currentStep, resetForm, errors, setErrors }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

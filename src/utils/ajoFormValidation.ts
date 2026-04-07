export const calculateTotalContribution = (amount: number, frequency: string, duration: number): number => {
  const frequencyMultiplier: { [key: string]: number } = {
    daily: 30,
    weekly: 4,
    monthly: 1,
    yearly: 1 / 12,
  };

  const multiplier = frequencyMultiplier[frequency] || 1;
  return amount * multiplier * duration;
};

export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getFrequencyLabel = (frequency: string): string => {
  const labels: { [key: string]: string } = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };
  return labels[frequency] || frequency;
};

export const validateAjoForm = (formData: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.name || formData.name.trim() === '') {
    errors.push('Group name is required');
  }

  if (!formData.amount || formData.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!formData.frequency) {
    errors.push('Frequency is required');
  }

  if (!formData.duration || formData.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

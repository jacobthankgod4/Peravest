export const validators = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
  },

  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email address';
    }
  },

  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
  },

  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
  },

  phone: (value: string) => {
    if (value && !/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
      return 'Invalid phone number';
    }
  },

  password: (value: string) => {
    if (value && value.length < 8) {
      return 'Password must be at least 8 characters';
    }
  },

  numeric: (value: string) => {
    if (value && !/^\d+$/.test(value)) {
      return 'Must be a number';
    }
  },

  amount: (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return 'Must be a valid amount greater than 0';
    }
  }
};

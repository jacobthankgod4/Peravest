import { z } from 'zod';

// Property Form Schema
export const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location is required'),
  price: z.number().positive('Price must be positive'),
  roi_percentage: z.number().min(0).max(100, 'ROI must be between 0-100%'),
  duration_months: z.number().int().positive(),
  total_shares: z.number().int().positive(),
  available_shares: z.number().int().positive(),
  property_type: z.string().min(1, 'Property type is required'),
  status: z.enum(['available', 'sold_out', 'coming_soon'])
});

// User Form Schema
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  user_type: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive']).optional()
});

// KYC Form Schema
export const kycSchema = z.object({
  document_type: z.enum(['national_id', 'passport', 'drivers_license', 'utility_bill']),
  document_url: z.string().url('Invalid document URL')
});

// Withdrawal Form Schema
export const withdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  bank_name: z.string().min(2, 'Bank name is required'),
  account_number: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
  account_name: z.string().min(2, 'Account name is required')
});

// Message Form Schema
export const messageSchema = z.object({
  recipient: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000)
});

// Settings Form Schema
export const settingsSchema = z.object({
  setting_key: z.string().min(1, 'Setting key is required'),
  setting_value: z.string().min(1, 'Setting value is required'),
  setting_type: z.enum(['string', 'number', 'boolean', 'json'])
});

// Export types
export type PropertyFormData = z.infer<typeof propertySchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type KYCFormData = z.infer<typeof kycSchema>;
export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;

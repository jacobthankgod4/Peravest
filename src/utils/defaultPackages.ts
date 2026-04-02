// =====================================================
// DEFAULT PACKAGE CREATOR
// =====================================================
// Automatically creates 10 default packages for a property
// =====================================================

import { supabase } from '../lib/supabase';

export const DEFAULT_PACKAGE_AMOUNTS = [
  { amount: 5000, name: '₦5K Package', roi: { 3: 9.5, 6: 12, 9: 15, 12: 19 } },
  { amount: 10000, name: '₦10K Package', roi: { 3: 10, 6: 13, 9: 16, 12: 20 } },
  { amount: 30000, name: '₦30K Package', roi: { 3: 11, 6: 14, 9: 18, 12: 22 } },
  { amount: 50000, name: '₦50K Package', roi: { 3: 12, 6: 16, 9: 20, 12: 24 } },
  { amount: 100000, name: '₦100K Package', roi: { 3: 14, 6: 18, 9: 22, 12: 26 } },
  { amount: 500000, name: '₦500K Package', roi: { 3: 16, 6: 20, 9: 24, 12: 28 } },
  { amount: 1000000, name: '₦1M Package', roi: { 3: 18, 6: 22, 9: 26, 12: 30 } },
  { amount: 5000000, name: '₦5M Package', roi: { 3: 20, 6: 24, 9: 28, 12: 32 } },
  { amount: 10000000, name: '₦10M Package', roi: { 3: 22, 6: 26, 9: 30, 12: 33 } },
  { amount: 50000000, name: '₦50M Package', roi: { 3: 24, 6: 28, 9: 32, 12: 35 } }
];

export const createDefaultPackages = async (propertyId: number): Promise<void> => {
  try {
    const packages = DEFAULT_PACKAGE_AMOUNTS.map((pkg, index) => ({
      property_id: propertyId,
      package_name: pkg.name,
      investment_amount: pkg.amount,
      min_investment: pkg.amount,
      max_investment: pkg.amount,
      duration_months: 6,
      interest_rate: 10,
      roi_percentage: pkg.roi[6], // Use 6-month ROI
      max_investors: 100,
      display_order: index + 1,
      is_active: true
    }));

    const { error } = await supabase
      .from('investment_packages')
      .insert(packages);

    if (error) {
      console.error('[DefaultPackages] Error creating packages:', error);
      throw error;
    }

    console.log(`[DefaultPackages] Created ${packages.length} packages for property ${propertyId}`);
  } catch (error) {
    console.error('[DefaultPackages] Failed to create default packages:', error);
    throw error;
  }
};

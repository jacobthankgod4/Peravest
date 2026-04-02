// =====================================================
// INVESTMENT PACKAGE SERVICE
// =====================================================
// Version: 1.0.0
// Description: API service for investment package operations
// =====================================================

import { supabase } from '../lib/supabase';
import { InvestmentPackage, CreatePackageDTO, UpdatePackageDTO } from '../types/package.types';

export const packageService = {
  /**
   * Get all active packages for a property
   */
  async getPackagesByProperty(propertyId: number): Promise<InvestmentPackage[]> {
    const { data, error } = await supabase
      .from('investment_packages')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[PackageService] Error fetching packages:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a single package by ID
   */
  async getPackageById(packageId: number): Promise<InvestmentPackage | null> {
    const { data, error } = await supabase
      .from('investment_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (error) {
      console.error('[PackageService] Error fetching package:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new package
   */
  async createPackage(packageData: CreatePackageDTO): Promise<InvestmentPackage> {
    const { data, error } = await supabase
      .from('investment_packages')
      .insert(packageData)
      .select()
      .single();

    if (error) {
      console.error('[PackageService] Error creating package:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update an existing package
   */
  async updatePackage(packageId: number, updates: UpdatePackageDTO): Promise<InvestmentPackage> {
    const { data, error } = await supabase
      .from('investment_packages')
      .update(updates)
      .eq('id', packageId)
      .select()
      .single();

    if (error) {
      console.error('[PackageService] Error updating package:', error);
      throw error;
    }

    return data;
  },

  /**
   * Soft delete a package
   */
  async deletePackage(packageId: number): Promise<void> {
    const { error } = await supabase
      .from('investment_packages')
      .update({ is_active: false })
      .eq('id', packageId);

    if (error) {
      console.error('[PackageService] Error deleting package:', error);
      throw error;
    }
  },

  /**
   * Reorder packages
   */
  async reorderPackages(packageOrders: { id: number; display_order: number }[]): Promise<void> {
    const updates = packageOrders.map(({ id, display_order }) =>
      supabase
        .from('investment_packages')
        .update({ display_order })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('[PackageService] Error reordering packages:', errors);
      throw new Error('Failed to reorder packages');
    }
  },

  /**
   * Validate package data
   */
  validatePackage(packageData: Partial<CreatePackageDTO>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (packageData.min_investment && packageData.min_investment <= 0) {
      errors.push('Minimum investment must be greater than 0');
    }

    if (packageData.max_investment && packageData.min_investment && 
        packageData.max_investment < packageData.min_investment) {
      errors.push('Maximum investment must be greater than or equal to minimum investment');
    }

    if (packageData.duration_months && packageData.duration_months <= 0) {
      errors.push('Duration must be greater than 0 months');
    }

    if (packageData.interest_rate && (packageData.interest_rate < 0 || packageData.interest_rate > 100)) {
      errors.push('Interest rate must be between 0 and 100');
    }

    if (packageData.roi_percentage && packageData.roi_percentage < 0) {
      errors.push('ROI percentage must be greater than or equal to 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// =====================================================
// INVESTMENT PACKAGE TYPES
// =====================================================
// Version: 1.0.0
// Description: TypeScript interfaces for investment packages
// =====================================================

export interface InvestmentPackage {
  id: number;
  property_id: number;
  package_name: string;
  investment_amount: number;  // Fixed amount (e.g., 5000, 10000, etc.)
  min_investment: number;     // Kept for backward compatibility
  max_investment: number;     // Kept for backward compatibility
  duration_months: number;
  interest_rate: number;
  roi_percentage: number;
  max_investors: number;
  current_investors: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageDTO {
  property_id: number;
  package_name: string;
  investment_amount: number;  // Fixed amount
  min_investment?: number;    // Optional for backward compatibility
  max_investment?: number;    // Optional for backward compatibility
  duration_months: number;
  interest_rate: number;
  roi_percentage: number;
  max_investors?: number;
  display_order?: number;
}

export interface UpdatePackageDTO {
  package_name?: string;
  min_investment?: number;
  max_investment?: number;
  duration_months?: number;
  interest_rate?: number;
  roi_percentage?: number;
  max_investors?: number;
  is_active?: boolean;
  display_order?: number;
}

export interface PackageValidationError {
  field: string;
  message: string;
}

export interface PackageValidationResult {
  isValid: boolean;
  errors: PackageValidationError[];
}

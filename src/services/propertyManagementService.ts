import { supabase } from './supabaseClient';
import { fileValidator } from '../utils/fileValidator';
import { errorHandler } from '../utils/errorHandler';

export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price: number;
  roi_percentage: number;
  duration_months: number;
  total_shares: number;
  available_shares: number;
  property_type: string;
  status: 'available' | 'sold_out' | 'coming_soon';
}

class PropertyManagementService {
  async createProperty(propertyData: PropertyFormData, adminId: number) {
    const { data, error } = await supabase
      .from('properties')
      .insert({ ...propertyData, created_by: adminId })
      .select()
      .single();

    return { data, error };
  }

  async updateProperty(propertyId: number, updates: Partial<PropertyFormData>) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();

    return { data, error };
  }

  async deleteProperty(propertyId: number) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    return { error };
  }

  async uploadPropertyImage(file: File, propertyId: number): Promise<string | null> {
    // Validate file
    const validation = fileValidator.validateImage(file);
    if (!validation.valid) {
      errorHandler.handleError(new Error(validation.error));
      return null;
    }

    // Validate dimensions
    const dimensionValidation = await fileValidator.validateImageDimensions(file);
    if (!dimensionValidation.valid) {
      errorHandler.handleError(new Error(dimensionValidation.error));
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const sanitizedName = fileValidator.sanitizeFileName(file.name);
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) {
      errorHandler.handleError(uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async getPropertyPerformance(propertyId: number) {
    const { data: investments } = await supabase
      .from('investments')
      .select('amount, status')
      .eq('property_id', propertyId);

    const totalInvested = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    const activeInvestors = investments?.filter(inv => inv.status === 'active').length || 0;

    return { totalInvested, activeInvestors, totalInvestments: investments?.length || 0 };
  }
}

export const propertyManagementService = new PropertyManagementService();

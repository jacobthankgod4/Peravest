import { supabase } from '../lib/supabase';

export interface Property {
  Id?: number;
  Title: string;
  Type: string;
  Address: string;
  City: string;
  State: string;
  Zip_Code: string;
  Images: string;
  Video: string;
  Description: string;
  Price: number;
  Area: string;
  Bedroom: number;
  Bathroom: number;
  Built_Year: number;
  Ammenities: string;
  Status: string;
  created_at?: string;
}

export const propertyServiceV2 = {
  create: async (property: Partial<Property>, imageFile?: File): Promise<Property> => {
    try {
      let imageUrl = '';
      
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, imageFile);
        
        if (error) throw new Error(`Image upload failed: ${error.message}`);
        imageUrl = data?.path || '';
      }

      const insertData: Property = {
        Title: property.Title || 'Untitled',
        Type: property.Type || 'Residential',
        Address: property.Address || '',
        City: property.City || '',
        State: property.State || '',
        Zip_Code: property.Zip_Code || '',
        Images: imageUrl,
        Video: property.Video || '',
        Description: property.Description || '',
        Price: property.Price || 0,
        Area: property.Area || '',
        Bedroom: property.Bedroom || 0,
        Bathroom: property.Bathroom || 0,
        Built_Year: property.Built_Year || new Date().getFullYear(),
        Ammenities: property.Ammenities || '',
        Status: 'active'
      };

      const { data, error } = await supabase
        .from('property')
        .insert([insertData])
        .select()
        .single();

      if (error) throw new Error(`Database insert failed: ${error.message}`);
      return data;
    } catch (err) {
      throw err;
    }
  },

  getAll: async (): Promise<Property[]> => {
    const { data, error } = await supabase
      .from('property')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Fetch failed: ${error.message}`);
    return data || [];
  },

  getById: async (id: number): Promise<Property> => {
    const { data, error } = await supabase
      .from('property')
      .select('*')
      .eq('Id', id)
      .single();

    if (error) throw new Error(`Fetch failed: ${error.message}`);
    return data;
  },

  update: async (id: number, property: Partial<Property>): Promise<Property> => {
    const { data, error } = await supabase
      .from('property')
      .update(property)
      .eq('Id', id)
      .select()
      .single();

    if (error) throw new Error(`Update failed: ${error.message}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('property')
      .delete()
      .eq('Id', id);

    if (error) throw new Error(`Delete failed: ${error.message}`);
  }
};

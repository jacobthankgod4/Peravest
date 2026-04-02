import { supabase } from '../lib/supabase';
import { PropertyWithInvestment } from '../types/property';

export interface Property {
  Id?: number;
  Title: string;
  Type: string;
  Address: string;
  City: string;
  State: string;
  LGA?: string;
  Zip_Code: string;
  Images: string;
  Video: string;
  Description: string;
  Price: number;
  Area: number;
  Bedroom: number;
  Bathroom: number;
  Built_Year: number;
  Amenities: string;
  Status: string;
  User_Id?: number;
  created_at?: string;
  updated_at?: string;
  
  // Multi-Asset Support
  Asset_Type: 'Real Estate' | 'Agriculture';
  
  // Agriculture Fields
  Farm_Size_Hectares?: number;
  Crop_Type?: string;
  Harvest_Cycle_Months?: number;
  Expected_Yield?: string;
  Farming_Method?: string;
  Soil_Type?: string;
  Water_Source?: string;
  Farm_Equipment?: string;
  Insurance_Status?: string;
  Farm_Manager?: string;
}

export interface InvestmentPackage {
  Id?: number;
  Property_Id: number;
  Share_Cost: number;
  Interest_Rate: number;
  Period_Months: number;
  Max_Investors: number;
  created_at?: string;
  updated_at?: string;
}

const mapToPropertyWithInvestment = (prop: any, investmentPkg?: InvestmentPackage): PropertyWithInvestment => {
  const images: string[] = [];
  if (prop.property_image && Array.isArray(prop.property_image) && prop.property_image.length > 0) {
    images.push(...prop.property_image.sort((a: any, b: any) => a.Display_Order - b.Display_Order).map((img: any) => img.Image_Url));
  } else if (prop.Images) {
    images.push(prop.Images);
  }
  
  return {
    id: prop.Id || 0,
    title: prop.Title,
    type: prop.Type,
    address: prop.Address,
    city: prop.City,
    state: prop.State,
    zipCode: prop.Zip_Code,
    images,
    video: prop.Video,
    description: prop.Description,
    price: prop.Price,
    area: typeof prop.Area === 'string' ? parseInt(prop.Area) || 0 : prop.Area || 0,
    bedroom: prop.Bedroom,
    bathroom: prop.Bathroom,
    builtYear: prop.Built_Year?.toString(),
    amenities: prop.Amenities,
    status: prop.Status,
    interestRate: investmentPkg?.Interest_Rate || 25,
    shareCost: investmentPkg?.Share_Cost || 5000,
    expectedInvestment: prop.Price,
    currentInvestment: 0,
    investorCount: 0,
    fundingPercent: 0
  };
};

const uploadImages = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    try {
      const fileName = `${Date.now()}-${Math.random()}-${file.name}`;
      console.log('[uploadImages] Uploading:', fileName);
      const { data, error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: false });
      if (error) {
        console.error('[uploadImages] Upload error:', error);
        continue;
      }
      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
      if (urlData?.publicUrl) {
        console.log('[uploadImages] URL generated:', urlData.publicUrl);
        urls.push(urlData.publicUrl);
      }
    } catch (err) {
      console.error('[uploadImages] Error:', err);
    }
  }
  console.log('[uploadImages] Total URLs:', urls.length);
  return urls;
};

const insertPropertyImages = async (propertyId: number, imageUrls: string[]): Promise<void> => {
  if (!imageUrls || imageUrls.length === 0) {
    console.log('[insertPropertyImages] No images to insert');
    return;
  }
  try {
    const images = imageUrls.map((url, idx) => ({ Property_Id: propertyId, Image_Url: url, Display_Order: idx }));
    console.log('[insertPropertyImages] Inserting', images.length, 'images for property', propertyId);
    const { error } = await supabase.from('property_image').insert(images);
    if (error) {
      console.error('[insertPropertyImages] Insert error:', error);
      throw new Error(`Failed to save images: ${error.message}`);
    }
    console.log('[insertPropertyImages] Success - all images inserted');
  } catch (err) {
    console.error('[insertPropertyImages] Error:', err);
    throw err;
  }
};

export const propertyService = {
  create: async (property: Partial<Property> | any, imageFiles?: File | File[]): Promise<PropertyWithInvestment> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('User not authenticated. Please login first.');

      let imageUrl = '';
      const imageUrls: string[] = [];

      if (imageFiles) {
        const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
        console.log('[create] Uploading', files.length, 'images');
        const urls = await uploadImages(files);
        imageUrl = urls[0] || '';
        imageUrls.push(...urls);
        console.log('[create] Got', imageUrls.length, 'image URLs');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User ID not found. Please login again.');

      const insertData: any = {
        Title: String(property.Title || property.title || '').trim(),
        Type: String(property.Type || property.type || 'Residential').trim(),
        Address: String(property.Address || property.address || '').trim(),
        City: String(property.City || property.city || '').trim(),
        State: String(property.State || property.state || '').trim(),
        LGA: String(property.LGA || property.lga || '').trim(),
        Zip_Code: String(property.Zip_Code || property.zipCode || '').trim(),
        Images: imageUrl,
        Video: String(property.Video || property.video || '').trim(),
        Description: String(property.Description || property.description || '').trim(),
        Price: parseFloat(String(property.Price || property.price || 0)),
        Area: parseFloat(String(property.Area || property.area || 0)),
        Bedroom: parseInt(String(property.Bedroom || property.bedroom || 0)) || 0,
        Bathroom: parseInt(String(property.Bathroom || property.bathroom || 0)) || 0,
        Built_Year: parseInt(String(property.Built_Year || property.builtYear || new Date().getFullYear())) || new Date().getFullYear(),
        Amenities: String(property.Amenities || property.amenities || '').trim(),
        Status: 'active',
        User_Id: parseInt(user.id) || 0,
        Asset_Type: String(property.Asset_Type || 'Real Estate').trim()
      };
      
      // Add Agriculture fields if Asset_Type is Agriculture
      if (insertData.Asset_Type === 'Agriculture') {
        insertData.Farm_Size_Hectares = property.Farm_Size_Hectares ? parseFloat(String(property.Farm_Size_Hectares)) : null;
        insertData.Crop_Type = String(property.Crop_Type || '').trim() || null;
        insertData.Harvest_Cycle_Months = property.Harvest_Cycle_Months ? parseInt(String(property.Harvest_Cycle_Months)) : null;
        insertData.Expected_Yield = String(property.Expected_Yield || '').trim() || null;
        insertData.Farming_Method = String(property.Farming_Method || '').trim() || null;
        insertData.Soil_Type = String(property.Soil_Type || '').trim() || null;
        insertData.Water_Source = String(property.Water_Source || '').trim() || null;
        insertData.Farm_Equipment = String(property.Farm_Equipment || '').trim() || null;
        insertData.Insurance_Status = String(property.Insurance_Status || '').trim() || null;
        insertData.Farm_Manager = String(property.Farm_Manager || '').trim() || null;
      }

      if (!insertData.Title) throw new Error('Title is required');
      if (!insertData.Address) throw new Error('Address is required');
      if (!insertData.City) throw new Error('City is required');
      if (!insertData.State) throw new Error('State is required');
      if (!insertData.Description) throw new Error('Description is required');

      console.log('[create] Inserting property');
      const { data, error } = await supabase.from('property').insert([insertData]).select().single();
      if (error) throw new Error(`Database error: ${error.message}`);
      if (!data) throw new Error('No data returned from insert');

      console.log('[create] Property created with ID:', data.Id);

      if (imageUrls.length > 0) {
        try {
          console.log('[create] Inserting', imageUrls.length, 'images');
          await insertPropertyImages(data.Id, imageUrls);
          console.log('[create] Images inserted successfully');
        } catch (imgErr) {
          console.error('[create] Image insertion failed:', imgErr);
          throw imgErr;
        }
      }

      if (property.share_cost || property.interest_rate) {
        const investmentPkg = {
          Property_Id: data.Id,
          Share_Cost: parseFloat(String(property.share_cost || 5000)),
          Interest_Rate: parseFloat(String(property.interest_rate || 25)),
          Period_Months: parseInt(String(property.period_months || 6)),
          Max_Investors: parseInt(String(property.max_investors || 100))
        };
        await supabase.from('investment_package').insert([investmentPkg]);
      }

      console.log('[create] Property creation complete');
      return mapToPropertyWithInvestment(data);
    } catch (err) {
      console.error('[propertyService] Property creation error:', err);
      throw err;
    }
  },

  getAll: async (): Promise<PropertyWithInvestment[]> => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*, investment_package(*), property_image(*)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('getAll error:', error.message);
        return [];
      }
      
      return (data || []).map((prop: any) => mapToPropertyWithInvestment(prop, prop.investment_package?.[0]));
    } catch (err) {
      console.error('getAll exception:', err);
      return [];
    }
  },

  getById: async (id: number | string): Promise<PropertyWithInvestment> => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*, investment_package(*), property_image(*)')
        .eq('Id', parseInt(String(id)))
        .eq('is_deleted', false)
        .single();

      if (error) throw new Error(`Fetch failed: ${error.message}`);
      if (!data) throw new Error('Property not found');
      
      return mapToPropertyWithInvestment(data, data.investment_package?.[0]);
    } catch (err) {
      console.error('getById error:', err);
      throw err;
    }
  },

  getPropertyById: async (id: number | string): Promise<PropertyWithInvestment> => {
    return propertyService.getById(id);
  },

  update: async (id: number | string, property: Partial<Property> | any, imageFiles?: File | File[]): Promise<PropertyWithInvestment> => {
    try {
      let imageUrl = '';
      const imageUrls: string[] = [];

      if (imageFiles) {
        const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
        console.log('[update] Uploading', files.length, 'images');
        const urls = await uploadImages(files);
        imageUrl = urls[0] || '';
        imageUrls.push(...urls);
        console.log('[update] Got', imageUrls.length, 'image URLs');
      }

      const updateData: Partial<Property> = {
        updated_at: new Date().toISOString()
      };
      
      if (property.Title || property.title) updateData.Title = property.Title || property.title;
      if (property.Type || property.type) updateData.Type = property.Type || property.type;
      if (property.Address || property.address) updateData.Address = property.Address || property.address;
      if (property.City || property.city) updateData.City = property.City || property.city;
      if (property.State || property.state) updateData.State = property.State || property.state;
      if (property.LGA || property.lga) updateData.LGA = property.LGA || property.lga;
      if (property.Zip_Code || property.zipCode) updateData.Zip_Code = property.Zip_Code || property.zipCode;
      if (property.Description || property.description) updateData.Description = property.Description || property.description;
      if (property.Price || property.price) updateData.Price = property.Price || property.price;
      if (property.Area || property.area) updateData.Area = parseFloat(String(property.Area || property.area));
      if (property.Bedroom || property.bedroom) updateData.Bedroom = property.Bedroom || property.bedroom;
      if (property.Bathroom || property.bathroom) updateData.Bathroom = property.Bathroom || property.bathroom;
      if (property.Built_Year || property.builtYear) updateData.Built_Year = property.Built_Year || parseInt(property.builtYear);
      if (property.Amenities || property.amenities) updateData.Amenities = property.Amenities || property.amenities;
      if (property.Video || property.video) updateData.Video = property.Video || property.video;
      if (property.Status || property.status) updateData.Status = property.Status || property.status;
      if (imageUrl) updateData.Images = imageUrl;
      if (property.Asset_Type) updateData.Asset_Type = property.Asset_Type;
      
      // Update Agriculture fields if Asset_Type is Agriculture
      if (property.Asset_Type === 'Agriculture') {
        if (property.Farm_Size_Hectares !== undefined) updateData.Farm_Size_Hectares = parseFloat(String(property.Farm_Size_Hectares));
        if (property.Crop_Type) updateData.Crop_Type = property.Crop_Type;
        if (property.Harvest_Cycle_Months !== undefined) updateData.Harvest_Cycle_Months = parseInt(String(property.Harvest_Cycle_Months));
        if (property.Expected_Yield) updateData.Expected_Yield = property.Expected_Yield;
        if (property.Farming_Method) updateData.Farming_Method = property.Farming_Method;
        if (property.Soil_Type) updateData.Soil_Type = property.Soil_Type;
        if (property.Water_Source) updateData.Water_Source = property.Water_Source;
        if (property.Farm_Equipment) updateData.Farm_Equipment = property.Farm_Equipment;
        if (property.Insurance_Status) updateData.Insurance_Status = property.Insurance_Status;
        if (property.Farm_Manager) updateData.Farm_Manager = property.Farm_Manager;
      }

      console.log('[update] Updating property', id);
      const { data, error } = await supabase
        .from('property')
        .update(updateData)
        .eq('Id', parseInt(String(id)))
        .select()
        .single();

      if (error) throw new Error(`Update failed: ${error.message}`);
      if (!data) throw new Error('No data returned from update');

      if (imageUrls.length > 0) {
        try {
          console.log('[update] Inserting', imageUrls.length, 'images');
          await insertPropertyImages(data.Id, imageUrls);
          console.log('[update] Images inserted successfully');
        } catch (imgErr) {
          console.error('[update] Image insertion failed:', imgErr);
          throw imgErr;
        }
      }

      console.log('[update] Property update complete');
      return mapToPropertyWithInvestment(data);
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  },

  delete: async (id: number | string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('property')
        .delete()
        .eq('Id', parseInt(String(id)));

      if (error) throw new Error(`Delete failed: ${error.message}`);
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  }
};

import { api } from '../utils/api';

export interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  images: string[];
  packages: PropertyPackage[];
  status: 'active' | 'inactive' | 'sold';
  totalInvestors: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyPackage {
  id: number;
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
  currentInvestors: number;
  availableShares: number;
}

export interface PropertyFilters {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: 'price' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class PropertyService {
  async getAll(filters?: PropertyFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return api.get(`/properties?${params.toString()}`);
  }

  async getById(id: number) {
    return api.get(`/properties/${id}`);
  }

  async create(propertyData: FormData) {
    return api.post('/properties', propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async update(id: number, propertyData: FormData) {
    return api.put(`/properties/${id}`, propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async delete(id: number) {
    return api.delete(`/properties/${id}`);
  }

  async updateStatus(id: number, status: string) {
    return api.patch(`/properties/${id}/status`, { status });
  }

  async getFeatured() {
    return api.get('/properties/featured');
  }

  async getByLocation(city: string, state: string) {
    return api.get(`/properties/location/${state}/${city}`);
  }

  async searchProperties(query: string) {
    return api.get(`/properties/search?q=${encodeURIComponent(query)}`);
  }

  async getPropertyPackages(propertyId: number) {
    return api.get(`/properties/${propertyId}/packages`);
  }

  async addPropertyPackage(propertyId: number, packageData: Omit<PropertyPackage, 'id' | 'currentInvestors' | 'availableShares'>) {
    return api.post(`/properties/${propertyId}/packages`, packageData);
  }

  async updatePropertyPackage(propertyId: number, packageId: number, packageData: Partial<PropertyPackage>) {
    return api.put(`/properties/${propertyId}/packages/${packageId}`, packageData);
  }

  async deletePropertyPackage(propertyId: number, packageId: number) {
    return api.delete(`/properties/${propertyId}/packages/${packageId}`);
  }

  async getPropertyStats(propertyId: number) {
    return api.get(`/properties/${propertyId}/stats`);
  }

  async uploadPropertyImages(propertyId: number, images: File[]) {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    
    return api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async deletePropertyImage(propertyId: number, imageId: number) {
    return api.delete(`/properties/${propertyId}/images/${imageId}`);
  }
}

export const propertyService = new PropertyService();

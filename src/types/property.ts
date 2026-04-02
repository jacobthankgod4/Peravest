export interface Property {
  id: number;
  title: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  images: string[];
  video?: string;
  description?: string;
  price: number;
  area: number;
  bedroom: number;
  bathroom: number;
  builtYear?: string;
  amenities?: string;
  status: string;
  created_at?: string;
  packages?: any[];
}

export interface Investment {
  interest: number;
  shareCost: number;
  expectedInvestment: number;
  currentInvestment: number;
  propertyId: number;
}

export interface PropertyWithInvestment extends Property {
  interestRate: number;
  shareCost: number;
  expectedInvestment: number;
  currentInvestment: number;
  investorCount: number;
  fundingPercent: number;
}

export interface CreatePropertyResponse {
  success: boolean;
  data?: PropertyWithInvestment;
  error?: string;
}

import { api } from '../utils/api';

export interface Investment {
  id: number;
  propertyId: number;
  packageId: number;
  userId: number;
  amount: number;
  shares: number;
  expectedReturn: number;
  currentReturn: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  startDate: string;
  maturityDate: string;
  progress: number;
  property: {
    title: string;
    address: string;
    images: string[];
  };
  package: {
    interestRate: number;
    periodMonths: number;
  };
}

export interface InvestmentRequest {
  propertyId: number;
  packageId: number;
  shares: number;
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
}

class InvestmentService {
  async getUserInvestments(userId?: number) {
    const url = userId ? `/investments/user/${userId}` : '/investments/my';
    return api.get(url);
  }

  async getInvestmentById(id: number) {
    return api.get(`/investments/${id}`);
  }

  async createInvestment(investmentData: InvestmentRequest) {
    return api.post('/investments', investmentData);
  }

  async cancelInvestment(id: number) {
    return api.patch(`/investments/${id}/cancel`);
  }

  async getInvestmentReturns(id: number) {
    return api.get(`/investments/${id}/returns`);
  }

  async calculateInvestmentProjection(propertyId: number, packageId: number, shares: number) {
    return api.post('/investments/calculate', {
      propertyId,
      packageId,
      shares
    });
  }

  async getInvestmentHistory(filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return api.get(`/investments/history?${params.toString()}`);
  }

  async getInvestmentStats() {
    return api.get('/investments/stats');
  }

  async processInvestmentReturn(id: number) {
    return api.post(`/investments/${id}/process-return`);
  }

  async getInvestmentDocuments(id: number) {
    return api.get(`/investments/${id}/documents`);
  }

  async downloadInvestmentCertificate(id: number) {
    return api.get(`/investments/${id}/certificate`, {
      responseType: 'blob'
    });
  }

  async checkDuplicate(propertyId: number): Promise<boolean> {
    try {
      const response = await api.get(`/investments/check/${propertyId}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking duplicate investment:', error);
      return false;
    }
  }
  
  async getUserStats() {
    const response = await api.get('/investments/user/stats');
    return response.data;
  }

  async getStats() {
    return api.get('/investments/stats');
  }

  async getRecentActivity(limit: number = 10) {
    return api.get(`/investments/recent?limit=${limit}`);
  }
}

export const investmentService = new InvestmentService();
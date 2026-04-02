import React, { createContext, useState, useCallback } from 'react';
import { propertyService } from '../services/propertyService';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';

interface DashboardData {
  totalProperties: number;
  totalUsers: number;
  totalInvestments: number;
  pendingWithdrawals: number;
  recentInvestments?: any[];
}

interface AdminContextType {
  properties: any[];
  subscribers: any[];
  loading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  fetchSubscribers: () => Promise<void>;
  addProperty: (data: FormData) => Promise<any>;
  updateProperty: (id: string, data: FormData) => Promise<any>;
  deleteProperty: (id: string) => Promise<void>;
  dashboardData: DashboardData | null;
  fetchDashboardData: () => Promise<void>;
  deleteSubscriber: (id: string) => Promise<void>;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export { AdminContext as default };

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await propertyService.getAll();
      setProperties(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getSubscribers();
      setSubscribers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProperty = async (data: FormData) => {
    try {
      const result = await propertyService.create(data);
      setProperties([...properties, result]);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProperty = async (id: string, data: FormData) => {
    try {
      const result = await adminService.updateProperty(id, data);
      setProperties(properties.map((p) => (p.id === id ? result : p)));
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await adminService.deleteProperty(id);
      setProperties(properties.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, recentInvestments] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentInvestments()
      ]);
      
      setDashboardData({
        ...stats,
        recentInvestments
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
    try {
      setSubscribers(subscribers.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        properties,
        subscribers,
        loading,
        error,
        fetchProperties,
        fetchSubscribers,
        addProperty,
        updateProperty,
        deleteProperty,
        dashboardData,
        fetchDashboardData,
        deleteSubscriber
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

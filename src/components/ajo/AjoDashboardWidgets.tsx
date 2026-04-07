import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  color?: 'green' | 'orange' | 'blue' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, trend, color = 'green' }) => {
  const colorMap = {
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
  };

  return (
    <div className={`p-6 rounded-lg border ${colorMap[color]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-semibold mt-3 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
};

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface LineChartWidgetProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  height?: number;
}

export const LineChartWidget: React.FC<LineChartWidgetProps> = ({ title, data, dataKey, height = 300 }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
        <Line type="monotone" dataKey={dataKey} stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

interface BarChartWidgetProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  height?: number;
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({ title, data, dataKey, height = 300 }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
        <Bar dataKey={dataKey} fill="#ea580c" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'green' | 'orange' | 'blue';
}

export const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, color = 'green' }) => {
  const colorMap = {
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-lg ${colorMap[color]} transition-colors`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <span className="text-sm font-medium text-center">{label}</span>
    </button>
  );
};

interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  onClick?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({ title, subtitle, value, status, onClick }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {value && <p className="font-semibold text-gray-900">{value}</p>}
        {status && <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>{status}</span>}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="text-5xl mb-4 opacity-50">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-center mb-6 max-w-sm">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        {action.label}
      </button>
    )}
  </div>
);

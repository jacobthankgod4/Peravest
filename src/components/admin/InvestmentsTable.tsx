import React from 'react';
import InvestmentTracking from './InvestmentTracking';
import { InvestorData } from '../../services/adminDashboardService';

interface InvestmentsTableProps {
  investments: InvestorData[];
}

const InvestmentsTable: React.FC<InvestmentsTableProps> = ({ investments }) => {
  return <InvestmentTracking />;
};

export default InvestmentsTable;
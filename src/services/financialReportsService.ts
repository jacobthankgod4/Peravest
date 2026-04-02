// @ts-nocheck
import { supabase } from './supabaseClient';
import { investmentCalculationService } from './investmentCalculationService';

export interface FinancialReport {
  reportType: 'investment' | 'revenue' | 'payout' | 'tax';
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  transactions: any[];
  summary: Record<string, any>;
}

class FinancialReportsService {
  async generateInvestmentReport(startDate: Date, endDate: Date): Promise<FinancialReport> {
    const { data: investments } = await supabase
      .from('investments')
      .select('*, properties(title), users(email, full_name)')
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString());

    const totalAmount = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    const totalInterest = investments?.reduce((sum, inv) => {
      const details = investmentCalculationService.calculateInvestmentDetails(
        inv.amount,
        inv.duration_months,
        new Date(inv.start_date)
      );
      return sum + details.accruedInterest;
    }, 0) || 0;

    return {
      reportType: 'investment',
      startDate,
      endDate,
      totalAmount,
      transactions: investments || [],
      summary: {
        totalInvestments: investments?.length || 0,
        totalPrincipal: totalAmount,
        totalInterest,
        averageInvestment: totalAmount / (investments?.length || 1)
      }
    };
  }

  async generateRevenueReport(startDate: Date, endDate: Date): Promise<FinancialReport> {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'investment')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const totalAmount = transactions?.reduce((sum, txn) => sum + txn.amount, 0) || 0;

    return {
      reportType: 'revenue',
      startDate,
      endDate,
      totalAmount,
      transactions: transactions || [],
      summary: {
        totalTransactions: transactions?.length || 0,
        averageTransaction: totalAmount / (transactions?.length || 1)
      }
    };
  }

  async generatePayoutReport(startDate: Date, endDate: Date): Promise<FinancialReport> {
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('*, users(email, full_name)')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const totalAmount = withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

    return {
      reportType: 'payout',
      startDate,
      endDate,
      totalAmount,
      transactions: withdrawals || [],
      summary: {
        totalPayouts: withdrawals?.length || 0,
        averagePayout: totalAmount / (withdrawals?.length || 1)
      }
    };
  }

  exportToCSV(report: FinancialReport): string {
    const headers = Object.keys(report.transactions[0] || {}).join(',');
    const rows = report.transactions.map(t => Object.values(t).join(','));
    return `${headers}\n${rows.join('\n')}`;
  }
}

export const financialReportsService = new FinancialReportsService();

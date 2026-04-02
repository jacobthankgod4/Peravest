import { supabase } from '../lib/supabase';

// Interest rate tiers based on investment amount and duration
const INTEREST_RATES = {
  TIER_1: { // <= ₦500,000
    6: 9.25,   // 6 months: 9.25% p.a.
    12: 18.5,  // 12 months: 18.5% p.a.
    24: 37,    // 24 months: 37% p.a.
    60: 92.5   // 60 months: 92.5% p.a.
  },
  TIER_2: { // >= ₦500,000
    6: 8.8,    // 6 months: 8.8% p.a.
    12: 16,    // 12 months: 16% p.a.
    24: 33,    // 24 months: 33% p.a.
    60: 65     // 60 months: 65% p.a.
  }
};

export interface Investment {
  id: number;
  user_id: number;
  property_id: number;
  package_id: number;
  share_cost: number;
  start_date: string;
  period: number;
  interest: number;
  status: string;
}

export interface InvestmentWithCalculations extends Investment {
  days_elapsed: number;
  current_interest: number;
  current_value: number;
  maturity_date: string;
  maturity_amount: number;
  interest_rate: number;
}

export const investmentCalculationService = {
  
  // Calculate days elapsed since investment start
  calculateDaysElapsed(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Get interest rate based on amount and duration
  getInterestRate(amount: number, durationMonths: number): number {
    const tier = amount <= 500000 ? INTEREST_RATES.TIER_1 : INTEREST_RATES.TIER_2;
    return tier[durationMonths as keyof typeof tier] || 0;
  },

  // Calculate current interest accrued
  calculateCurrentInterest(
    amount: number,
    durationMonths: number,
    startDate: string
  ): number {
    const daysElapsed = this.calculateDaysElapsed(startDate);
    const rate = this.getInterestRate(amount, durationMonths);
    const totalDays = durationMonths * 30;
    
    // Formula: (days_elapsed * (amount * rate%) / total_days)
    const interest = (daysElapsed * (amount * (rate / 100))) / totalDays;
    
    return Math.max(0, interest);
  },

  // Calculate current value (principal + accrued interest)
  calculateCurrentValue(
    amount: number,
    durationMonths: number,
    startDate: string
  ): number {
    const interest = this.calculateCurrentInterest(amount, durationMonths, startDate);
    return amount + interest;
  },

  // Calculate maturity date
  calculateMaturityDate(startDate: string, durationMonths: number): string {
    const start = new Date(startDate);
    const maturity = new Date(start);
    maturity.setMonth(maturity.getMonth() + durationMonths);
    return maturity.toISOString();
  },

  // Calculate maturity amount (principal + full interest)
  calculateMaturityAmount(amount: number, durationMonths: number): number {
    const rate = this.getInterestRate(amount, durationMonths);
    const interest = amount * (rate / 100);
    return amount + interest;
  },

  // Get investment with all calculations
  calculateInvestmentDetails(investment: Investment): InvestmentWithCalculations {
    const daysElapsed = this.calculateDaysElapsed(investment.start_date);
    const currentInterest = this.calculateCurrentInterest(
      investment.share_cost,
      investment.period,
      investment.start_date
    );
    const currentValue = this.calculateCurrentValue(
      investment.share_cost,
      investment.period,
      investment.start_date
    );
    const maturityDate = this.calculateMaturityDate(
      investment.start_date,
      investment.period
    );
    const maturityAmount = this.calculateMaturityAmount(
      investment.share_cost,
      investment.period
    );
    const interestRate = this.getInterestRate(
      investment.share_cost,
      investment.period
    );

    return {
      ...investment,
      days_elapsed: daysElapsed,
      current_interest: currentInterest,
      current_value: currentValue,
      maturity_date: maturityDate,
      maturity_amount: maturityAmount,
      interest_rate: interestRate
    };
  },

  // Batch calculate for multiple investments
  calculateBatchInvestments(investments: Investment[]): InvestmentWithCalculations[] {
    return investments.map(inv => this.calculateInvestmentDetails(inv));
  },

  // Get interest rate tier info
  getInterestRateTier(amount: number): 'TIER_1' | 'TIER_2' {
    return amount <= 500000 ? 'TIER_1' : 'TIER_2';
  },

  // Get all available rates for an amount
  getAvailableRates(amount: number): Record<number, number> {
    return amount <= 500000 ? INTEREST_RATES.TIER_1 : INTEREST_RATES.TIER_2;
  }
};
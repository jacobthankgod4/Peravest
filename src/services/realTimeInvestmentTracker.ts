// @ts-nocheck
import { supabase } from './supabaseClient';
import { investmentCalculationService } from './investmentCalculationService';

export interface InvestmentStatus {
  id: number;
  currentValue: number;
  accruedInterest: number;
  daysElapsed: number;
  daysRemaining: number;
  maturityDate: Date;
  status: 'active' | 'matured' | 'withdrawn';
  progressPercentage: number;
}

class RealTimeInvestmentTracker {
  private subscriptions: Map<string, any> = new Map();

  async trackInvestment(investmentId: number): Promise<InvestmentStatus | null> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .single();

    if (error || !data) return null;

    const details = investmentCalculationService.calculateInvestmentDetails(
      data.amount,
      data.duration_months,
      new Date(data.start_date)
    );

    return {
      id: data.id,
      currentValue: details.currentValue,
      accruedInterest: details.accruedInterest,
      daysElapsed: details.daysElapsed,
      daysRemaining: details.daysRemaining,
      maturityDate: details.maturityDate,
      status: details.isMatured ? 'matured' : 'active',
      progressPercentage: details.progressPercentage
    };
  }

  subscribeToInvestment(investmentId: number, callback: (status: InvestmentStatus) => void) {
    const channel = supabase
      .channel(`investment-${investmentId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'investments', filter: `id=eq.${investmentId}` },
        () => this.trackInvestment(investmentId).then(status => status && callback(status))
      )
      .subscribe();

    this.subscriptions.set(`investment-${investmentId}`, channel);
  }

  unsubscribe(investmentId: number) {
    const key = `investment-${investmentId}`;
    const channel = this.subscriptions.get(key);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(key);
    }
  }

  async checkMaturedInvestments(): Promise<number[]> {
    const { data } = await supabase
      .from('investments')
      .select('id, start_date, duration_months')
      .eq('status', 'active');

    return (data || [])
      .filter(inv => {
        const maturityDate = new Date(inv.start_date);
        maturityDate.setMonth(maturityDate.getMonth() + inv.duration_months);
        return new Date() >= maturityDate;
      })
      .map(inv => inv.id);
  }
}

export const realTimeInvestmentTracker = new RealTimeInvestmentTracker();

export interface InvestmentTier {
  interest: number;
  shareCost: number;
  expectedInvestment: number;
  currentInvestment: number;
}

export const INVESTMENT_TIERS: InvestmentTier[] = [
  { interest: 15.5, shareCost: 5000, expectedInvestment: 150000000, currentInvestment: 40000000 },
  { interest: 15.5, shareCost: 15000, expectedInvestment: 450000000, currentInvestment: 80000000 },
  { interest: 15.5, shareCost: 30000, expectedInvestment: 450000000, currentInvestment: 10000000 },
  { interest: 15.5, shareCost: 100000, expectedInvestment: 1500000000, currentInvestment: 400000000 },
  { interest: 15.5, shareCost: 500000, expectedInvestment: 5000000000, currentInvestment: 900000000 },
  { interest: 15.5, shareCost: 1000000, expectedInvestment: 5000000000, currentInvestment: 40000000 },
  { interest: 15.5, shareCost: 2000000, expectedInvestment: 5000000000, currentInvestment: 40000000 },
  { interest: 15.5, shareCost: 5000000, expectedInvestment: 5000000000, currentInvestment: 40000000 }
];

export const calculateInterestRate = (shareCost: number): number => {
  return shareCost <= 500000 ? 18.5 : 16;
};

export const calculateInvestorCount = (currentInv: number, shareCost: number): number => {
  return Math.round(currentInv / shareCost);
};

export const calculateFundingPercent = (currentInv: number, expectedInv: number): number => {
  return Math.round((currentInv / expectedInv) * 100);
};

export const createInvestmentTiers = (propertyId: number) => {
  return INVESTMENT_TIERS.map(tier => ({
    ...tier,
    propertyId
  }));
};

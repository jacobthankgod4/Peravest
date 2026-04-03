const { Investment, InvestmentPackage, Property, Portfolio, Transaction } = require('../models');
const { Op } = require('sequelize');

class InvestmentEngine {
  static calculateReturns(amount, interestRate, periodMonths) {
    const monthlyRate = interestRate / 100 / 12;
    const expectedReturn = amount * (1 + (monthlyRate * periodMonths));
    return {
      principal: amount,
      interest: expectedReturn - amount,
      total: expectedReturn
    };
  }

  static async validateInvestment(userId, packageId, amount) {
    const package = await InvestmentPackage.findByPk(packageId, {
      include: [{ model: Property, as: 'property' }]
    });

    if (!package || !package.is_active) {
      throw new Error('Investment package not available');
    }

    if (amount < package.share_cost) {
      throw new Error(`Minimum investment is ₦${package.share_cost.toLocaleString()}`);
    }

    if (amount % package.share_cost !== 0) {
      throw new Error('Investment amount must be in multiples of share cost');
    }

    if (package.max_investors && package.current_investors >= package.max_investors) {
      throw new Error('Investment package is fully subscribed');
    }

    return package;
  }

  static async createInvestment(userId, packageId, amount, paymentReference) {
    const package = await this.validateInvestment(userId, packageId, amount);
    const shares = Math.floor(amount / package.share_cost);
    const returns = this.calculateReturns(amount, package.interest_rate, package.period_months);

    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + package.period_months);

    const investment = await Investment.create({
      user_id: userId,
      property_id: package.property_id,
      amount: amount,
      shares: shares,
      investment_period: package.period_months,
      roi_percentage: package.interest_rate,
      expected_return: returns.total,
      payment_reference: paymentReference,
      start_date: startDate,
      maturity_date: maturityDate,
      total_amount: amount
    });

    return investment;
  }

  static async activateInvestment(investmentId) {
    const investment = await Investment.findByPk(investmentId, {
      include: [{ model: Property, as: 'property' }]
    });

    if (!investment) {
      throw new Error('Investment not found');
    }

    await investment.update({
      status: 'active',
      payment_status: 'successful'
    });

    // Update property funding
    await Property.increment('currentFunding', {
      by: investment.amount,
      where: { id: investment.property_id }
    });

    // Update package investor count
    await InvestmentPackage.increment('current_investors', {
      by: 1,
      where: { property_id: investment.property_id }
    });

    // Update user portfolio
    await this.updatePortfolio(investment.user_id, investment.amount);

    return investment;
  }

  static async updatePortfolio(userId, amount) {
    const [portfolio] = await Portfolio.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        total_invested: 0,
        total_returns: 0,
        available_balance: 0,
        active_investments: 0
      }
    });

    await portfolio.increment({
      total_invested: amount,
      active_investments: 1
    });

    return portfolio;
  }

  static async getUserPortfolio(userId) {
    const portfolio = await Portfolio.findOne({
      where: { user_id: userId }
    });

    const investments = await Investment.findAll({
      where: { user_id: userId },
      include: [
        { model: Property, as: 'property' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      portfolio: portfolio || {
        total_invested: 0,
        total_returns: 0,
        available_balance: 0,
        active_investments: 0
      },
      investments
    };
  }
}

module.exports = InvestmentEngine;
const User = require('./User');
const Property = require('./Property');
const Investment = require('./Investment');
const InvestmentPackage = require('./InvestmentPackage');
const Transaction = require('./Transaction');
const Portfolio = require('./Portfolio');

// User associations
User.hasMany(Investment, { foreignKey: 'user_id', as: 'investments' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
User.hasOne(Portfolio, { foreignKey: 'user_id', as: 'portfolio' });

// Property associations
Property.hasMany(Investment, { foreignKey: 'property_id', as: 'investments' });
Property.hasMany(InvestmentPackage, { foreignKey: 'property_id', as: 'packages' });

// Investment associations
Investment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Investment.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
Investment.hasMany(Transaction, { foreignKey: 'investment_id', as: 'transactions' });

// InvestmentPackage associations
InvestmentPackage.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Transaction.belongsTo(Investment, { foreignKey: 'investment_id', as: 'investment' });

// Portfolio associations
Portfolio.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Property,
  Investment,
  InvestmentPackage,
  Transaction,
  Portfolio
};
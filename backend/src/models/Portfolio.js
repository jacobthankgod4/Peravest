const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  total_invested: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  total_returns: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  active_investments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  portfolio_value: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'portfolios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Portfolio;
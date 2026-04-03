const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  total_invested: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  total_returns: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  available_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  active_investments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'portfolios',
  timestamps: true
});

module.exports = Portfolio;
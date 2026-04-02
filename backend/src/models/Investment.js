const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Investment = sequelize.define('Investment', {
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
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  shares_purchased: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount_invested: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  vat_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  investment_period: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Investment period in months'
  },
  expected_return: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  maturity_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'matured', 'cancelled'),
    defaultValue: 'active'
  }
}, {
  tableName: 'investments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Investment;
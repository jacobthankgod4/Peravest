const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  shares: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  investment_period: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Investment period in months'
  },
  roi_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  expected_return: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  payment_reference: {
    type: DataTypes.STRING(100),
    unique: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'successful', 'failed'),
    defaultValue: 'pending'
  },
  start_date: {
    type: DataTypes.DATE
  },
  maturity_date: {
    type: DataTypes.DATE
  },
  vat_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
}, {
  tableName: 'investments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Investment;
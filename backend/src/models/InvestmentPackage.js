const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InvestmentPackage = sequelize.define('InvestmentPackage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  share_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  period_months: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_investors: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  current_investors: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'investment_packages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InvestmentPackage;
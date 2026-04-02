const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
  investment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'investments',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('investment', 'withdrawal', 'refund', 'fee'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  gateway: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  gateway_response: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Transaction;
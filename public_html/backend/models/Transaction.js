const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('investment', 'withdrawal', 'return'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'successful', 'failed'),
    defaultValue: 'pending'
  },
  gateway: {
    type: DataTypes.STRING,
    defaultValue: 'paystack'
  },
  gateway_response: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;
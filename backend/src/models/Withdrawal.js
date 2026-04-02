const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Withdrawal = sequelize.define('Withdrawal', {
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
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  account_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  account_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'withdrawals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Withdrawal;
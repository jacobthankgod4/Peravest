const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

User.activateAccount = async function(email) {
  return await this.update({ isActive: true, activationToken: null }, { where: { email } });
};

User.updateResetToken = async function(id, token) {
  return await this.update({ resetToken: token }, { where: { id } });
};

User.updatePassword = async function(id, password) {
  return await this.update({ password }, { where: { id } });
};

module.exports = User;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  share_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  total_shares: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  available_shares: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  investment_period: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Investment period in months'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'sold_out'),
    defaultValue: 'active'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  }
}, {
  tableName: 'properties',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Virtual field for funding progress
Property.prototype.getFundingProgress = function() {
  const soldShares = this.total_shares - this.available_shares;
  return Math.round((soldShares / this.total_shares) * 100);
};

// Define associations
Property.associate = function(models) {
  Property.hasMany(models.InvestmentPackage, {
    foreignKey: 'property_id',
    as: 'packages'
  });
  Property.hasMany(models.Investment, {
    foreignKey: 'property_id',
    as: 'investments'
  });
};

module.exports = Property;
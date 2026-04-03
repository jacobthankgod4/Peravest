const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  shareCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currentFunding: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  videos: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'funded', 'inactive'),
    defaultValue: 'active'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'properties',
  timestamps: true
});

Property.findAll = async function(options = {}) {
  const { page = 1, limit = 10, search } = options;
  const offset = (page - 1) * limit;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { address: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  return await this.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
};

Property.updateFunding = async function(id, amount) {
  return await this.increment('currentFunding', { by: amount, where: { id } });
};

module.exports = Property;
const Property = require('../models/Property');
const InvestmentPackage = require('../models/InvestmentPackage');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { Op } = require('sequelize');

// Admin Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const totalProperties = await Property.count();
    const totalUsers = await User.count();
    const totalInvestments = await Investment.sum('amount') || 0;
    const pendingWithdrawals = await Investment.count({
      where: { status: 'pending_withdrawal' }
    });

    const recentInvestments = await Investment.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, attributes: ['first_name', 'last_name'] },
        { model: Property, attributes: ['title'] }
      ]
    });

    res.json({
      totalProperties,
      totalUsers,
      totalInvestments,
      pendingWithdrawals,
      recentInvestments: recentInvestments.map(inv => ({
        id: inv.id,
        userName: `${inv.User.first_name} ${inv.User.last_name}`,
        propertyName: inv.Property.title,
        amount: inv.amount,
        date: inv.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Property with Investment Packages
exports.createPropertyWithPackages = async (req, res) => {
  const transaction = await Property.sequelize.transaction();
  
  try {
    const { packages, ...propertyData } = req.body;
    
    // Handle file uploads
    if (req.files && req.files.images) {
      propertyData.images = req.files.images.map(file => file.filename);
    }
    
    // Create property
    const property = await Property.create(propertyData, { transaction });
    
    // Create investment packages
    if (packages && packages.length > 0) {
      const packageData = packages.map(pkg => ({
        ...pkg,
        property_id: property.id
      }));
      await InvestmentPackage.bulkCreate(packageData, { transaction });
    }
    
    await transaction.commit();
    
    // Fetch complete property with packages
    const completeProperty = await Property.findByPk(property.id, {
      include: [{ model: InvestmentPackage, as: 'packages' }]
    });
    
    res.status(201).json(completeProperty);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

// Get Single Property
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{ 
        model: InvestmentPackage, 
        as: 'packages'
      }]
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Property
exports.updateProperty = async (req, res) => {
  try {
    const [updated] = await Property.update(
      req.body,
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = await Property.findByPk(req.params.id);
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Properties for Admin (with packages)
exports.getAdminProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const properties = await Property.findAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ 
        model: InvestmentPackage, 
        as: 'packages',
        where: { is_active: true },
        required: false
      }]
    });

    const total = await Property.count();

    res.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Property Status
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await Property.update(
      { status },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Property Analytics
exports.getPropertyAnalytics = async (req, res) => {
  try {
    const propertyId = req.params.id;
    
    const property = await Property.findByPk(propertyId, {
      include: [
        { model: InvestmentPackage, as: 'packages' },
        { model: Investment, as: 'investments' }
      ]
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const totalInvested = property.investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const totalInvestors = property.investments.length;
    const averageInvestment = totalInvestors > 0 ? totalInvested / totalInvestors : 0;

    res.json({
      property: property.title,
      totalInvested,
      totalInvestors,
      averageInvestment,
      packages: property.packages.map(pkg => ({
        id: pkg.id,
        shareCost: pkg.share_cost,
        interestRate: pkg.interest_rate,
        periodMonths: pkg.period_months,
        currentInvestors: pkg.current_investors,
        maxInvestors: pkg.max_investors
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
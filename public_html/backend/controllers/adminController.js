const { User, Property, Investment } = require('../models');
const bcrypt = require('bcryptjs');

const adminController = {
  // Get dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const totalUsers = await User.count();
      const totalProperties = await Property.count();
      const totalInvestments = await Investment.count();
      const totalInvestmentAmount = await Investment.sum('amount') || 0;

      const recentInvestments = await Investment.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email'] },
          { model: Property, attributes: ['title'] }
        ]
      });

      res.json({
        totalUsers,
        totalProperties,
        totalInvestments,
        totalInvestmentAmount,
        recentInvestments
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all investments
  getAllInvestments: async (req, res) => {
    try {
      const investments = await Investment.findAll({
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email'] },
          { model: Property, attributes: ['title', 'location'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user status
  updateUserStatus: async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      await User.update(
        { isActive },
        { where: { id: userId } }
      );

      res.json({ message: 'User status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update investment status
  updateInvestmentStatus: async (req, res) => {
    try {
      const { investmentId } = req.params;
      const { status } = req.body;

      await Investment.update(
        { status },
        { where: { id: investmentId } }
      );

      res.json({ message: 'Investment status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = adminController;
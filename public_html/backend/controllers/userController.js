const { User, Investment, Property } = require('../models');
const bcrypt = require('bcryptjs');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phone, address } = req.body;
      
      await User.update(
        { firstName, lastName, phone, address },
        { where: { id: req.user.id } }
      );
      
      const updatedUser = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findByPk(req.user.id);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.update(
        { password: hashedPassword },
        { where: { id: req.user.id } }
      );
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get dashboard data
  getDashboard: async (req, res) => {
    try {
      const investments = await Investment.findAll({
        where: { userId: req.user.id },
        include: [{ model: Property, attributes: ['title', 'images'] }],
        limit: 5,
        order: [['createdAt', 'DESC']]
      });
      
      const stats = await Investment.findOne({
        where: { userId: req.user.id },
        attributes: [
          [Investment.sequelize.fn('COUNT', Investment.sequelize.col('id')), 'totalInvestments'],
          [Investment.sequelize.fn('SUM', Investment.sequelize.col('amount')), 'totalInvested'],
          [Investment.sequelize.fn('SUM', Investment.sequelize.col('expectedReturns')), 'expectedReturns']
        ]
      });
      
      res.json({ investments, stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
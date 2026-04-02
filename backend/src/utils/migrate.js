const { sequelize } = require('../config/database');
const User = require('../models/User');
const Property = require('../models/Property');
const Investment = require('../models/Investment');

// Define model associations
User.hasMany(Investment, { foreignKey: 'user_id' });
Investment.belongsTo(User, { foreignKey: 'user_id' });

Property.hasMany(Investment, { foreignKey: 'property_id' });
Investment.belongsTo(Property, { foreignKey: 'property_id' });

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    // Sync all models
    await sequelize.sync({ force: false });
    
    console.log('Database migration completed successfully!');
    
    // Create default admin user if not exists
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      await User.create({
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        phone: '+1234567890',
        password: 'admin123',
        is_verified: true,
        is_admin: true
      });
      console.log('Default admin user created');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
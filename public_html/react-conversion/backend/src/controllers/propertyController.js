const Property = require('../models/Property');
const upload = require('../middleware/upload');

// Get all properties with pagination
exports.getProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const properties = await Property.findAll({
      limit,
      offset,
      order: [['created_at', 'DESC']]
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

// Get single property by ID
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new property (admin only)
exports.createProperty = async (req, res) => {
  try {
    const propertyData = { ...req.body };
    
    // Handle file uploads
    if (req.files) {
      const images = req.files.images ? req.files.images.map(file => file.filename) : [];
      const videos = req.files.videos ? req.files.videos.map(file => file.filename) : [];
      
      propertyData.images = images;
      if (videos.length > 0) {
        propertyData.videos = videos;
      }
    }
    
    const property = await Property.create(propertyData);
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update property (admin only)
exports.updateProperty = async (req, res) => {
  try {
    const [updated] = await Property.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = await Property.findByPk(req.params.id);
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete property (admin only)
exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
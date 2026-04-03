const pool = require('../config/database');

const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, 
        COALESCE(json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT pp.*) FILTER (WHERE pp.id IS NOT NULL), '[]') as packages
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      LEFT JOIN property_packages pp ON p.id = pp.property_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.address ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json({ success: true, properties: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT p.*, 
        COALESCE(json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT pp.*) FILTER (WHERE pp.id IS NOT NULL), '[]') as packages
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      LEFT JOIN property_packages pp ON p.id = pp.property_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    res.json({ success: true, property: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createProperty = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { title, address, city, state, price, area, bedrooms, bathrooms, description, packages } = req.body;
    
    const propertyQuery = `
      INSERT INTO properties (title, address, city, state, price, area, bedrooms, bathrooms, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const propertyResult = await client.query(propertyQuery, [
      title, address, city, state, price, area, bedrooms, bathrooms, description
    ]);
    
    const propertyId = propertyResult.rows[0].id;
    
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const imageQuery = `
          INSERT INTO property_images (property_id, image_url, is_primary)
          VALUES ($1, $2, $3)
        `;
        await client.query(imageQuery, [propertyId, req.files[i].path, i === 0]);
      }
    }
    
    if (packages) {
      const pkgs = JSON.parse(packages);
      for (const pkg of pkgs) {
        const packageQuery = `
          INSERT INTO property_packages (property_id, share_cost, interest_rate, period_months, max_investors)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(packageQuery, [
          propertyId, pkg.shareCost, pkg.interestRate, pkg.periodMonths, pkg.maxInvestors
        ]);
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json({ success: true, property: propertyResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, address, city, state, price, area, bedrooms, bathrooms, description, status } = req.body;
    
    const query = `
      UPDATE properties 
      SET title = $1, address = $2, city = $3, state = $4, price = $5, 
          area = $6, bedrooms = $7, bathrooms = $8, description = $9, 
          status = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, address, city, state, price, area, bedrooms, bathrooms, description, status, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    res.json({ success: true, property: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};
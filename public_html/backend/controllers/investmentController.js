const pool = require('../config/database');
const PaystackService = require('../services/PaystackService');

const investmentController = {
  createInvestment: async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { propertyId, packageId, amount, shares } = req.body;
      const userId = req.user.userId;
      
      await client.query('BEGIN');
      
      const packageQuery = 'SELECT * FROM property_packages WHERE id = $1';
      const packageResult = await client.query(packageQuery, [packageId]);
      
      if (packageResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Package not found' });
      }
      
      const pkg = packageResult.rows[0];
      
      if (pkg.current_investors >= pkg.max_investors) {
        return res.status(400).json({ success: false, error: 'Package is fully subscribed' });
      }
      
      const paymentData = await PaystackService.initializePayment({
        email: req.user.email,
        amount: amount * 100,
        metadata: { userId, propertyId, packageId, type: 'investment' }
      });
      
      const investmentQuery = `
        INSERT INTO investments (user_id, property_id, package_id, amount, shares, payment_reference, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *
      `;
      
      const investmentResult = await client.query(investmentQuery, [
        userId, propertyId, packageId, amount, shares, paymentData.reference
      ]);
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        investment: investmentResult.rows[0],
        paymentUrl: paymentData.authorization_url,
        reference: paymentData.reference
      });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, error: error.message });
    } finally {
      client.release();
    }
  },

  getUserInvestments: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const query = `
        SELECT i.*, p.title, p.address, pp.interest_rate, pp.period_months,
               (i.amount * (1 + pp.interest_rate / 100)) as expected_returns
        FROM investments i
        JOIN properties p ON i.property_id = p.id
        JOIN property_packages pp ON i.package_id = pp.id
        WHERE i.user_id = $1
        ORDER BY i.created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      res.json({ success: true, investments: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  verifyPayment: async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { reference } = req.params;
      
      const verification = await PaystackService.verifyPayment(reference);
      
      if (!verification.success) {
        return res.status(400).json({ success: false, error: 'Payment verification failed' });
      }
      
      await client.query('BEGIN');
      
      const investmentQuery = 'SELECT * FROM investments WHERE payment_reference = $1';
      const investmentResult = await client.query(investmentQuery, [reference]);
      
      if (investmentResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Investment not found' });
      }
      
      const investment = investmentResult.rows[0];
      
      const updateQuery = `
        UPDATE investments 
        SET status = 'active', 
            start_date = CURRENT_TIMESTAMP,
            maturity_date = CURRENT_TIMESTAMP + (SELECT period_months FROM property_packages WHERE id = $1) * INTERVAL '1 month'
        WHERE id = $2
        RETURNING *
      `;
      
      await client.query(updateQuery, [investment.package_id, investment.id]);
      
      const packageUpdateQuery = `
        UPDATE property_packages 
        SET current_investors = current_investors + 1 
        WHERE id = $1
      `;
      
      await client.query(packageUpdateQuery, [investment.package_id]);
      
      await client.query('COMMIT');
      
      res.json({ success: true, message: 'Payment verified and investment activated' });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, error: error.message });
    } finally {
      client.release();
    }
  },

  getInvestmentStats: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const query = `
        SELECT 
          COUNT(*) as total_investments,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(SUM(amount * (1 + (SELECT interest_rate FROM property_packages WHERE id = package_id) / 100)), 0) as expected_returns
        FROM investments
        WHERE user_id = $1 AND status = 'active'
      `;
      
      const result = await pool.query(query, [userId]);
      res.json({ success: true, stats: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = investmentController;

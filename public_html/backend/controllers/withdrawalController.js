const pool = require('../config/database');

const withdrawalController = {
  createWithdrawal: async (req, res) => {
    try {
      const { amount, bankName, accountNumber, accountName } = req.body;
      const userId = req.user.userId;
      
      const reference = 'WD' + Date.now() + Math.random().toString(36).substr(2, 9);
      
      const query = `
        INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name, reference, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *
      `;
      
      const result = await pool.query(query, [userId, amount, bankName, accountNumber, accountName, reference]);
      
      res.status(201).json({ success: true, withdrawal: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getUserWithdrawals: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const query = `
        SELECT * FROM withdrawals 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      res.json({ success: true, withdrawals: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getAllWithdrawals: async (req, res) => {
    try {
      const { status } = req.query;
      
      let query = 'SELECT * FROM withdrawals';
      const params = [];
      
      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json({ success: true, withdrawals: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateWithdrawalStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const query = `
        UPDATE withdrawals 
        SET status = $1, processed_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await pool.query(query, [status, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Withdrawal not found' });
      }
      
      res.json({ success: true, withdrawal: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = withdrawalController;

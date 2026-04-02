// Example backend implementation (Node.js/Express)
// File: backend/routes/blogRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL connection

// Admin Routes
router.get('/admin/blogs', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM blogs';
    const params = [];
    
    if (status && status !== 'all') {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/blogs', async (req, res) => {
  try {
    const { title, slug, excerpt, content, image_url, author_name, author_email } = req.body;
    
    const result = await pool.query(
      `INSERT INTO blogs (title, slug, excerpt, content, image_url, author_name, author_email, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
       RETURNING *`,
      [title, slug, excerpt, content, image_url, author_name, author_email]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, image_url, author_name, author_email } = req.body;
    
    const result = await pool.query(
      `UPDATE blogs 
       SET title = $1, slug = $2, excerpt = $3, content = $4, 
           image_url = $5, author_name = $6, author_email = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, slug, excerpt, content, image_url, author_name, author_email, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/blogs/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE blogs SET status = 'published', published_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/blogs/:id/unpublish', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE blogs SET status = 'draft' WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Routes
router.get('/blogs', async (req, res) => {
  try {
    const { limit } = req.query;
    let query = `SELECT * FROM blogs WHERE status = 'published' ORDER BY published_at DESC`;
    
    if (limit) {
      query += ` LIMIT $1`;
      const result = await pool.query(query, [limit]);
      return res.json(result.rows);
    }
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/blogs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT * FROM blogs WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

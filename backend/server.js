require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/properties', require('./src/routes/properties'));
app.use('/api/investments', require('./src/routes/investments'));
// app.use('/api/payments', require('./src/routes/payments'));
// app.use('/api/users', require('./src/routes/users'));
app.use('/api/admin', require('./src/routes/admin'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

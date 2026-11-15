
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const userRoute = require('./routes/userRoute');
const stockRoute = require('./routes/stockRoute');
const orderRoute = require('./routes/orderRoute');
const transactionRoute = require('./routes/transactionRoute');

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Parse JSON requests
app.use(express.json());

// Connect MongoDB before processing API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);

    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SB Stocks API is running',
  });
});

// API routes
app.use('/api/users', userRoute);
app.use('/api/stocks', stockRoute);
app.use('/api/orders', orderRoute);
app.use('/api/transactions', transactionRoute);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Local development server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export Express app for Vercel
module.exports = app;

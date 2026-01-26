const path = require('path');
const dotenv = require('dotenv');

// 1. Determine exact path
const envPath = path.join(__dirname, '.env');

// 2. Load and capture result
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ DOTENV ERROR:', result.error.message);
} else {
  console.log('✅ .env loaded from:', envPath);
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingRoutes = require('./routes/settingRoutes');

// Connect to Database
connectDB();

const app = express();

/**
 * Standard Middlewares
 */
app.use(
  cors({
    origin: [
      'https://nammamart.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.options("*",cors());
 // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON data

/**
 * API Endpoints
 */
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingRoutes);

/**
 * Static Folder for Uploaded Images
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('NammaMart API is running...');
});

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

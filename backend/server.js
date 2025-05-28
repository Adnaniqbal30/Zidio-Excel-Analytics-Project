require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // ✅ Import CORS here only once
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Verify environment variables
console.log('\n=== Environment Variables Check ===');
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('✅ All required environment variables are set');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 5000);
console.log('=====================================\n');

const app = express();

// Debug startup
console.log('\n=== Server Starting ===');
console.log('Node Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 5000);

// ✅ Use official CORS middleware (after app is created)
app.use(cors({
  origin: ['https://deft-hotteok-2a2a6f.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add explicit OPTIONS handling for preflight requests
app.options('*', cors());

// Add CORS error handling
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    return res.status(403).json({
      error: 'CORS error',
      message: 'Not allowed by CORS'
    });
  }
  next(err);
});

// Debug logging
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

// Add detailed request logging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('======================\n');
  next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('\n=== Error Occurred ===');
  console.error('Time:', new Date().toISOString());
  console.error('Method:', req.method);
  console.error('URL:', req.url);
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('=====================\n');

  if (err.name === 'CORSError') {
    return res.status(403).json({
      error: 'CORS error',
      message: 'Not allowed by CORS',
      details: err.message
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Middleware
app.use(express.json());

// API Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/excel', require('./routes/excel'));
app.use('/api/admin', adminRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(health);
});

// Add catch-all route for debugging
app.use('*', (req, res) => {
  console.log('\n=== 404 Not Found ===');
  console.log('Requested URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('====================\n');
  
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/test',
      '/api/auth/login',
      '/api/auth/register',
      '/api/users',
      '/api/excel',
      '/api/admin'
    ]
  });
});

// Log all registered routes
console.log('\n=== Registered Routes ===');
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
});
console.log('========================\n');

// Connect to MongoDB and start server
console.log('\n=== MongoDB Connection ===');
console.log('Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=== Server Status ===');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('=====================\n');
  });
}).catch(err => {
  console.error('\n❌ MongoDB connection error:');
  console.error('Error details:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});

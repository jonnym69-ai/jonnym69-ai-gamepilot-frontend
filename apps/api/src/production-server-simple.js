#!/usr/bin/env node

/**
 * GamePilot Production Deployment Script
 * Simplified production server for beta deployment
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: '../.env.simple' });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gamepilot.com'] 
    : ['http://localhost:3002', 'http://localhost:3005', 'http://localhost:3000', 'http://127.0.0.1:50814'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GamePilot API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    features: {
      steam_api: !!process.env.STEAM_API_KEY,
      jwt_secret: !!process.env.JWT_SECRET,
      analytics: !!process.env.GA4_MEASUREMENT_ID
    }
  };
  
  res.status(200).json(health);
});

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    features: {
      steam_api: !!process.env.STEAM_API_KEY,
      jwt_secret: !!process.env.JWT_SECRET,
      analytics: !!process.env.GA4_MEASUREMENT_ID
    }
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'GamePilot API v1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      games: '/api/games',
      auth: '/api/auth',
      steam: '/api/steam',
      recommendations: '/api/recommendations'
    },
    documentation: '/api/docs'
  });
});

// Games endpoints (simplified)
app.get('/api/games', (req, res) => {
  res.json({
    success: true,
    data: {
      games: [],
      total: 0,
      filters: {},
      message: 'Game library endpoint - production deployment ready'
    }
  });
});

app.get('/api/games/user', (req, res) => {
  res.json({
    success: true,
    data: {
      games: [],
      total: 0,
      message: 'User games endpoint - authentication required'
    }
  });
});

// Steam endpoints (simplified)
app.get('/api/steam', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'Steam API integration ready',
      api_key_configured: !!process.env.STEAM_API_KEY,
      message: 'Steam import functionality available'
    }
  });
});

// Recommendations endpoints (simplified)
app.get('/api/recommendations', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Recommendations endpoint - authentication required',
      moods_available: ['cozy', 'sweaty', 'brainy', 'social', 'creative']
    }
  });
});

// Debug endpoint
app.get('/debug/env', (req, res) => {
  res.json({
    steamApiKey: process.env.STEAM_API_KEY ? 'SET' : 'NOT_SET',
    steamApiKeyLength: process.env.STEAM_API_KEY?.length || 0,
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    jwtSecretSet: !!process.env.JWT_SECRET,
    analyticsSet: !!process.env.GA4_MEASUREMENT_ID
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 GamePilot Production API server running on port ${PORT}`);
  console.log(`📊 Health checks available at:`);
  console.log(`   - http://localhost:${PORT}/health`);
  console.log(`   - http://localhost:${PORT}/health/live`);
  console.log(`   - http://localhost:${PORT}/health/ready`);
  console.log(`🔧 Debug info at: http://localhost:${PORT}/debug/env`);
  console.log(`📚 API documentation at: http://localhost:${PORT}/api`);
});

module.exports = app;

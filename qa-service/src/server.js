const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Import clients
const esClient = require('./config/elasticsearch');
const openaiClient = require('./config/openai');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sapor');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Initialize services
 */
const initializeServices = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Elasticsearch
        await esClient.connect();

        // Initialize OpenAI (will warn if not configured)
        openaiClient.initialize();

        console.log('✅ All services initialized');
    } catch (error) {
        console.error('❌ Service initialization failed:', error.message);
        // Don't exit - allow partial functionality
    }
};

// Initialize services
initializeServices();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logging
}

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/qa', limiter);

// Import routes
const qaRoutes = require('./routes/qa');

// Mount routes
app.use('/api/qa', qaRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'SAPOR Q&A Microservice',
        version: '1.0.0',
        description: 'RAG-based Q&A system for meal recommendations',
        endpoints: {
            health: 'GET /api/qa/health',
            ask: 'POST /api/qa/ask',
            index: 'POST /api/qa/index',
            suggestions: 'GET /api/qa/suggestions',
            stats: 'GET /api/qa/stats'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('⚠️  SIGTERM received, shutting down gracefully...');
    await esClient.close();
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('⚠️  SIGINT received, shutting down gracefully...');
    await esClient.close();
    await mongoose.connection.close();
    process.exit(0);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 Q&A Service running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

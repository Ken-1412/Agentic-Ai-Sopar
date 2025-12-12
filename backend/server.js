const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sapor');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Start server only after DB connection
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();


// Middleware
app.use(helmet()); // Security headers
app.use(cors());
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
app.use('/api', limiter);

// Import API routes
const mealsApi = require('./api/meals');
const feedbackApi = require('./api/feedback');
const authApi = require('./api/auth');
const usersApi = require('./api/users');
const trainingApi = require('./api/training');
const plannerApi = require('./api/planner'); // Added planner API import
const llmApi = require('./api/llm'); // AI/LLM API routes
const recipesApi = require('./api/recipes'); // Recipe analysis API
const codebaseApi = require('./api/codebase'); // Codebase analysis API

// Routes
app.use('/api/meals', mealsApi);
app.post('/api/feedback', feedbackApi);
app.use('/api/auth', authApi);
app.use('/api/users', usersApi);
app.use('/api/training', trainingApi);
app.use('/api/llm', llmApi); // AI/LLM endpoints
app.use('/api/recipes', recipesApi); // Recipe analysis endpoints
app.use('/api/codebase', codebaseApi); // Codebase analysis endpoints

const agentsApi = require('./api/agents');
app.use('/api/agents', agentsApi);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SAPOR Backend is running',
        db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
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

// Server started in connectDB


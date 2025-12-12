// Serverless function wrapper for Vercel
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your existing server setup
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (reuse existing connections in serverless)
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const db = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    cachedDb = db;
    return db;
}

// Import routes
const mealsRouter = require('../api/meals');
const feedbackRouter = require('../api/feedback');
const recommendRouter = require('../api/recommend');
const llmRouter = require('../api/llm');
const recipesRouter = require('../api/recipes');
const codebaseRouter = require('../api/codebase');

// Use routes
app.use('/api/meals', mealsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/llm', llmRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/codebase', codebaseRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = async (req, res) => {
    await connectToDatabase();
    return app(req, res);
};

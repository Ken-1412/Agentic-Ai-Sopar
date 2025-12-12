#!/usr/bin/env node

/**
 * Meal Indexing Script
 * Run this script to index meals from MongoDB to Elasticsearch
 * Usage: npm run index-data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const esClient = require('../config/elasticsearch');
const { createMealIndex, indexMeals } = require('../services/indexer');

async function runIndexing() {
    console.log('🚀 Starting meal indexing process...\n');

    try {
        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sapor');
        console.log('✅ MongoDB connected\n');

        // Connect to Elasticsearch
        console.log('🔍 Connecting to Elasticsearch...');
        await esClient.connect();
        console.log('✅ Elasticsearch connected\n');

        // Create index
        console.log('📋 Creating Elasticsearch index...');
        await createMealIndex();
        console.log('✅ Index ready\n');

        // Index meals
        console.log('📊 Indexing meals...');
        const count = await indexMeals();
        console.log(`✅ Successfully indexed ${count} meals\n`);

        // Close connections
        await mongoose.connection.close();
        await esClient.close();

        console.log('✨ Indexing complete!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Indexing failed:', error.message);
        console.error(error.stack);

        // Close connections
        try {
            await mongoose.connection.close();
            await esClient.close();
        } catch (closeError) {
            // Ignore close errors
        }

        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runIndexing();
}

module.exports = runIndexing;

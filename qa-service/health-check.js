#!/usr/bin/env node

/**
 * Quick health check script for Q&A service
 * Tests basic connectivity without full service startup
 */

const mongoose = require('mongoose');
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

async function healthCheck() {
    console.log('🏥 Q&A Service Health Check\n');
    console.log('='.repeat(50));

    let allHealthy = true;

    // Check MongoDB
    console.log('\n📦 Checking MongoDB...');
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sapor';
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB: Connected');
        await mongoose.connection.close();
    } catch (error) {
        console.log('❌ MongoDB: Not connected');
        console.log(`   Error: ${error.message}`);
        allHealthy = false;
    }

    // Check Elasticsearch
    console.log('\n🔍 Checking Elasticsearch...');
    try {
        const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
        const client = new Client({ node: esUrl, requestTimeout: 5000 });
        const info = await client.info();
        console.log('✅ Elasticsearch: Connected');
        console.log(`   Version: ${info.version.number}`);
        await client.close();
    } catch (error) {
        console.log('❌ Elasticsearch: Not connected');
        console.log(`   Error: ${error.message}`);
        allHealthy = false;
    }

    // Check OpenAI Config
    console.log('\n🤖 Checking OpenAI Configuration...');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'sk-proj-your-OpenAI-API-KEY') {
        console.log('⚠️  OpenAI: Not configured (optional)');
        console.log('   AI responses will use fallback templates');
    } else {
        console.log('✅ OpenAI: API key configured');
    }

    // Results
    console.log('\n' + '='.repeat(50));
    if (allHealthy) {
        console.log('\n✨ All core services are healthy!');
        console.log('   Run `npm run dev` to start the Q&A service');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some services are not available');
        console.log('   Please check the errors above');
        console.log('\n   Quick fixes:');
        console.log('   - MongoDB: docker run -d -p 27017:27017 mongo:latest');
        console.log('   - Elasticsearch: See docker-compose-full.yml');
        process.exit(1);
    }
}

healthCheck().catch(error => {
    console.error('\n❌ Health check failed:', error.message);
    process.exit(1);
});

const OpenAI = require('openai');
require('dotenv').config();

/**
 * OpenAI client configuration
 * Handles AI-powered response generation for Q&A
 */
class OpenAIClient {
    constructor() {
        this.client = null;
        this.isConfigured = false;
    }

    /**
     * Initialize OpenAI client
     */
    initialize() {
        if (this.client) {
            return this.client;
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey || apiKey === 'sk-proj-your-OpenAI-API-KEY') {
            console.warn('⚠️  OpenAI API key not configured. AI responses will be disabled.');
            this.isConfigured = false;
            return null;
        }

        try {
            this.client = new OpenAI({
                apiKey: apiKey
            });

            this.isConfigured = true;
            console.log('✅ OpenAI Client Initialized');

            return this.client;
        } catch (error) {
            console.error('❌ OpenAI Initialization Error:', error.message);
            this.isConfigured = false;
            return null;
        }
    }

    /**
     * Get client instance
     */
    getClient() {
        if (!this.client) {
            this.initialize();
        }
        return this.client;
    }

    /**
     * Check if OpenAI is configured
     */
    isReady() {
        return this.isConfigured && this.client !== null;
    }

    /**
     * Get configuration settings
     */
    getConfig() {
        return {
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
            temperature: 0.7
        };
    }

    /**
     * Health check
     */
    async healthCheck() {
        if (!this.isReady()) {
            return {
                configured: false,
                error: 'API key not configured'
            };
        }

        try {
            // Make a minimal API call to test connectivity
            const response = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            });

            return {
                configured: true,
                model: this.getConfig().model,
                status: 'operational'
            };
        } catch (error) {
            return {
                configured: true,
                error: error.message
            };
        }
    }
}

// Export singleton instance
const openaiClient = new OpenAIClient();
module.exports = openaiClient;

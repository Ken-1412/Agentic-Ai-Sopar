// LLM Configuration Management
// Supports both local (Ollama) and online (HuggingFace) deployments

require('dotenv').config();

const llmConfig = {
    // Deployment mode: 'local' (Ollama) or 'online' (HuggingFace)
    deploymentMode: process.env.LLM_DEPLOYMENT_MODE || 'online',

    // Ollama configuration (Local AI)
    ollama: {
        url: process.env.OLLAMA_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3.2',
        timeout: parseInt(process.env.OLLAMA_TIMEOUT || '60000'),
    },

    // HuggingFace configuration (Online AI)
    huggingface: {
        apiUrl: 'https://api-inference.huggingface.co/models',
        model: process.env.HF_MODEL || 'meta-llama/Llama-3.2-3B-Instruct',
        timeout: parseInt(process.env.HF_TIMEOUT || '60000'),
        // HuggingFace Inference API is free (no API key needed for public models)
        apiKey: process.env.HF_API_KEY || null,
    },

    // Redis configuration (Caching)
    redis: {
        enabled: process.env.REDIS_ENABLED === 'true', // Disabled by default
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        ttl: {
            recipes: 60 * 60 * 24 * 7,      // 7 days for recipe analysis
            userPrefs: 60 * 60,               // 1 hour for user preferences
            mealPlans: 60 * 60 * 24,          // 24 hours for meal plans
            agentPerf: 0,                     // No cache for agent performance
        },
    },

    // Generation parameters
    generation: {
        maxTokens: parseInt(process.env.MAX_TOKENS || '1024'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        topP: parseFloat(process.env.TOP_P || '0.9'),
    },

    // Fallback behavior
    fallback: {
        enabled: true,
        useTemplates: true,
        logFailures: true,
    },

    // Rate limiting
    rateLimit: {
        enabled: true,
        maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MIN || '10'),
        maxRequestsPerHour: parseInt(process.env.MAX_REQUESTS_PER_HOUR || '100'),
    },
};

// Validate configuration
function validateConfig() {
    if (llmConfig.deploymentMode === 'local' && !llmConfig.ollama.url) {
        throw new Error('OLLAMA_URL must be set for local deployment mode');
    }

    if (llmConfig.deploymentMode === 'online' && !llmConfig.huggingface.model) {
        throw new Error('HF_MODEL must be set for online deployment mode');
    }

    console.log(`✅ LLM Configuration loaded: ${llmConfig.deploymentMode} mode`);
    console.log(`   Model: ${llmConfig.deploymentMode === 'local' ? llmConfig.ollama.model : llmConfig.huggingface.model}`);
    console.log(`   Cache: ${llmConfig.redis.enabled ? 'Enabled' : 'Disabled'}`);
}

validateConfig();

module.exports = llmConfig;

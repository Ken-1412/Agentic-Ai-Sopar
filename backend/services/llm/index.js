// Universal LLM Service - Main orchestrator
// Intelligently routes to Ollama/HuggingFace with caching and fallbacks

const OllamaClient = require('./ollama-client');
const HuggingFaceClient = require('./huggingface-client');
const promptTemplates = require('./prompt-templates');
const llmConfig = require('../../config/llm-config');
const Redis = require('ioredis');
const crypto = require('crypto');

class LLMService {
    constructor() {
        this.mode = llmConfig.deploymentMode;
        this.ollamaClient = new OllamaClient();
        this.hfClient = new HuggingFaceClient();

        // Initialize Redis for caching
        this.cache = llmConfig.redis.enabled
            ? new Redis(llmConfig.redis.url)
            : null;

        this.templates = promptTemplates;

        // Statistics tracking
        this.stats = {
            requests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            ollamaRequests: 0,
            hfRequests: 0,
            fallbackUses: 0,
            errors: 0,
        };

        console.log(`🤖 LLM Service initialized in ${this.mode} mode`);
    }

    /**
     * Generate text using configured AI model with caching
     * @param {string} prompt - The input prompt
     * @param {object} options - Generation options
     * @returns {Promise<object>} Generated response with metadata
     */
    async generate(prompt, options = {}) {
        this.stats.requests++;

        try {
            // Check cache first
            if (this.cache && options.cacheKey) {
                const cached = await this.getCached(options.cacheKey);
                if (cached) {
                    this.stats.cacheHits++;
                    return {
                        text: cached,
                        source: 'cache',
                        cached: true,
                    };
                }
                this.stats.cacheMisses++;
            }

            // Generate using configured mode
            let result;
            let source;

            if (this.mode === 'local') {
                result = await this.generateWithOllama(prompt, options);
                source = 'ollama';
                this.stats.ollamaRequests++;
            } else {
                result = await this.generateWithHuggingFace(prompt, options);
                source = 'huggingface';
                this.stats.hfRequests++;
            }

            // Cache the result
            if (this.cache && options.cacheKey && options.cacheTTL) {
                await this.setCached(options.cacheKey, result, options.cacheTTL);
            }

            return {
                text: result,
                source: source,
                cached: false,
            };
        } catch (error) {
            console.error('LLM generation error:', error.message);
            this.stats.errors++;

            // Fallback to template-based response if enabled
            if (llmConfig.fallback.enabled && options.fallbackData) {
                this.stats.fallbackUses++;
                const fallbackText = this.templates.fallbackAnalysis(
                    options.fallbackType || 'generic',
                    options.fallbackData
                );
                return {
                    text: fallbackText,
                    source: 'fallback',
                    cached: false,
                    error: error.message,
                };
            }

            throw error;
        }
    }

    /**
     * Generate using Ollama with fallback to HuggingFace
     */
    async generateWithOllama(prompt, options) {
        try {
            return await this.ollamaClient.generate(prompt, options);
        } catch (error) {
            console.warn('Ollama failed, attempting HuggingFace fallback...');
            return await this.hfClient.generateWithRetry(prompt, options);
        }
    }

    /**
     * Generate using HuggingFace with fallback to Ollama
     */
    async generateWithHuggingFace(prompt, options) {
        try {
            return await this.hfClient.generateWithRetry(prompt, options);
        } catch (error) {
            console.warn('HuggingFace failed, attempting Ollama fallback...');
            return await this.ollamaClient.generate(prompt, options);
        }
    }

    /**
     * Analyze recipe health using AI
     * @param {object} recipe - Recipe data
     * @returns {Promise<object>} Analysis results
     */
    async analyzeRecipe(recipe) {
        const prompt = this.templates.recipeAnalysis(recipe);
        const cacheKey = this.createCacheKey('recipe', recipe.id || recipe.name);

        const response = await this.generate(prompt, {
            cacheKey: cacheKey,
            cacheTTL: llmConfig.redis.ttl.recipes,
            fallbackType: 'recipe',
            fallbackData: recipe,
            temperature: 0.7,
        });

        // Try to parse JSON response
        try {
            const parsed = JSON.parse(response.text);
            return {
                ...parsed,
                metadata: {
                    source: response.source,
                    cached: response.cached,
                },
            };
        } catch (e) {
            // If not JSON, return as plain text
            return {
                analysis: response.text,
                metadata: {
                    source: response.source,
                    cached: response.cached,
                },
            };
        }
    }

    /**
     * Generate meal plan using AI
     * @param {object} userProfile - User preferences
     * @returns {Promise<object>} Meal plan
     */
    async generateMealPlan(userProfile) {
        const prompt = this.templates.mealPlanGeneration(userProfile);
        const cacheKey = this.createCacheKey('mealplan', JSON.stringify(userProfile));

        const response = await this.generate(prompt, {
            cacheKey: cacheKey,
            cacheTTL: llmConfig.redis.ttl.mealPlans,
            maxTokens: 2048, // Longer response for full week plan
            temperature: 0.8, // More creative
        });

        try {
            return JSON.parse(response.text);
        } catch (e) {
            return { plan: response.text };
        }
    }

    /**
     * Suggest ingredient substitutions
     * @param {string} ingredient - Ingredient to replace
     * @param {string} reason - Reason for replacement
     * @returns {Promise<object>} Substitution suggestions
     */
    async suggestSubstitution(ingredient, reason) {
        const prompt = this.templates.ingredientSubstitution(ingredient, reason);
        const cacheKey = this.createCacheKey('substitution', `${ingredient}-${reason}`);

        const response = await this.generate(prompt, {
            cacheKey: cacheKey,
            cacheTTL: llmConfig.redis.ttl.recipes,
            temperature: 0.6, // Moderate creativity
        });

        return {
            suggestions: response.text,
            metadata: {
                source: response.source,
                cached: response.cached,
            },
        };
    }

    /**
     * Analyze agent performance and suggest improvements
     * @param {string} agentName - Name of the agent
     * @param {array} failures - Recent failures
     * @returns {Promise<object>} Analysis and improvement suggestions
     */
    async analyzeAgentPerformance(agentName, failures) {
        const prompt = this.templates.agentPerformanceAnalysis(agentName, failures);

        const response = await this.generate(prompt, {
            cacheKey: null, // Don't cache agent analysis (always fresh)
            fallbackType: 'agent',
            fallbackData: {
                successRate: 70,
                avgTime: 4.5,
                failures: failures,
            },
            temperature: 0.5, // More deterministic for analysis
        });

        return {
            analysis: response.text,
            metadata: {
                source: response.source,
            },
        };
    }

    /**
     * Analyze codebase health
     * @param {object} codeSnapshot - Code analysis data
     * @returns {Promise<object>} Health analysis
     */
    async analyzeCodebase(codeSnapshot) {
        const prompt = this.templates.codebaseAnalysis(codeSnapshot);

        const response = await this.generate(prompt, {
            cacheKey: null, // Don't cache codebase analysis
            fallbackType: 'codebase',
            fallbackData: codeSnapshot,
            temperature: 0.4, // Very deterministic for code analysis
            maxTokens: 1536,
        });

        return {
            analysis: response.text,
            metadata: {
                source: response.source,
            },
        };
    }

    /**
     * Create cache key from type and data
     * @private
     */
    createCacheKey(type, data) {
        const hash = crypto.createHash('md5').update(data).digest('hex');
        return `llm:${type}:${hash}`;
    }

    /**
     * Get cached value
     * @private
     */
    async getCached(key) {
        if (!this.cache) return null;
        try {
            return await this.cache.get(key);
        } catch (error) {
            console.error('Cache read error:', error.message);
            return null;
        }
    }

    /**
     * Set cached value
     * @private
     */
    async setCached(key, value, ttl) {
        if (!this.cache) return;
        try {
            if (ttl) {
                await this.cache.setex(key, ttl, value);
            } else {
                await this.cache.set(key, value);
            }
        } catch (error) {
            console.error('Cache write error:', error.message);
        }
    }

    /**
     * Health check for LLM service
     * @returns {Promise<object>} Health status
     */
    async healthCheck() {
        const status = {
            mode: this.mode,
            healthy: false,
            ollama: false,
            huggingface: false,
            redis: false,
            stats: this.stats,
        };

        // Check Ollama
        if (this.mode === 'local' || true) { // Always check both
            status.ollama = await this.ollamaClient.healthCheck();
        }

        // Check HuggingFace
        status.huggingface = await this.hfClient.healthCheck();

        // Check Redis
        if (this.cache) {
            try {
                await this.cache.ping();
                status.redis = true;
            } catch (e) {
                status.redis = false;
            }
        }

        // Overall health
        status.healthy = this.mode === 'local'
            ? status.ollama || status.huggingface
            : status.huggingface || status.ollama;

        return status;
    }

    /**
     * Get service statistics
     */
    getStats() {
        return {
            ...this.stats,
            cacheHitRate: this.stats.requests > 0
                ? ((this.stats.cacheHits / this.stats.requests) * 100).toFixed(2) + '%'
                : '0%',
            errorRate: this.stats.requests > 0
                ? ((this.stats.errors / this.stats.requests) * 100).toFixed(2) + '%'
                : '0%',
        };
    }
}

// Export singleton instance
module.exports = new LLMService();

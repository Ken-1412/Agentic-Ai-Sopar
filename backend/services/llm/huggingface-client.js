// HuggingFace Client - Cloud AI Model Interface
// Provides scalable, zero-setup AI inference

const { HfInference } = require('@huggingface/inference');
const axios = require('axios');
const llmConfig = require('../../config/llm-config');

class HuggingFaceClient {
    constructor() {
        this.apiUrl = llmConfig.huggingface.apiUrl;
        this.model = llmConfig.huggingface.model;
        this.timeout = llmConfig.huggingface.timeout;
        this.apiKey = llmConfig.huggingface.apiKey;

        // Initialize HF Inference client
        this.client = this.apiKey
            ? new HfInference(this.apiKey)
            : new HfInference(); // Free tier (no API key)
    }

    /**
     * Generate text completion using HuggingFace
     * @param {string} prompt - The input prompt
     * @param {object} options - Generation options
     * @returns {Promise<string>} Generated text
     */
    async generate(prompt, options = {}) {
        try {
            const response = await this.client.textGeneration({
                model: this.model,
                inputs: prompt,
                parameters: {
                    max_new_tokens: options.maxTokens || llmConfig.generation.maxTokens,
                    temperature: options.temperature || llmConfig.generation.temperature,
                    top_p: options.topP || llmConfig.generation.topP,
                    return_full_text: false,
                },
            });

            if (response && response.generated_text) {
                return response.generated_text.trim();
            }

            throw new Error('Invalid response format from HuggingFace');
        } catch (error) {
            // Handle specific HF errors
            if (error.message.includes('503')) {
                throw new Error('Model is loading. Please try again in a few seconds.');
            }

            if (error.message.includes('429')) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            if (error.message.includes('401')) {
                throw new Error('Invalid API key. Please check HF_API_KEY.');
            }

            console.error('HuggingFace generation error:', error.message);
            throw error;
        }
    }

    /**
     * Generate text with retry logic for rate limits
     * @param {string} prompt - The input prompt
     * @param {object} options - Generation options
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise<string>} Generated text
     */
    async generateWithRetry(prompt, options = {}, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.generate(prompt, options);
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }

                // Exponential backoff for 503 (model loading) and 429 (rate limit)
                if (error.message.includes('503') || error.message.includes('429')) {
                    const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                    console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Check if HuggingFace API is available
     * @returns {Promise<boolean>} API availability status
     */
    async healthCheck() {
        try {
            // Simple ping to check API availability
            await axios.get('https://huggingface.co', {
                timeout: 5000,
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get model info from HuggingFace
     * @returns {Promise<object>} Model information
     */
    async getModelInfo() {
        try {
            const response = await axios.get(
                `https://huggingface.co/api/models/${this.model}`
            );
            return {
                name: response.data.modelId,
                downloads: response.data.downloads,
                likes: response.data.likes,
                tags: response.data.tags,
            };
        } catch (error) {
            console.error('Error fetching model info:', error.message);
            return null;
        }
    }
}

module.exports = HuggingFaceClient;

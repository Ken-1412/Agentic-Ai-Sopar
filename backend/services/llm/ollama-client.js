// Ollama Client - Local AI Model Interface
// Provides privacy-focused, offline-capable AI inference

const axios = require('axios');
const llmConfig = require('../../config/llm-config');

class OllamaClient {
    constructor() {
        this.baseUrl = llmConfig.ollama.url;
        this.model = llmConfig.ollama.model;
        this.timeout = llmConfig.ollama.timeout;
    }

    /**
     * Generate text completion using Ollama
     * @param {string} prompt - The input prompt
     * @param {object} options - Generation options
     * @returns {Promise<string>} Generated text
     */
    async generate(prompt, options = {}) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/generate`,
                {
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: options.temperature || llmConfig.generation.temperature,
                        top_p: options.topP || llmConfig.generation.topP,
                        num_predict: options.maxTokens || llmConfig.generation.maxTokens,
                    },
                },
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.response) {
                return response.data.response.trim();
            }

            throw new Error('Invalid response format from Ollama');
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Ollama server is not running. Please start Ollama.');
            }

            if (error.code === 'ETIMEDOUT') {
                throw new Error('Ollama request timed out. The prompt may be too complex.');
            }

            console.error('Ollama generation error:', error.message);
            throw error;
        }
    }

    /**
     * Check if Ollama server is available
     * @returns {Promise<boolean>} Server availability status
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`, {
                timeout: 5000,
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    /**
     * List available models
     * @returns {Promise<string[]>} List of model names
     */
    async listModels() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`);
            return response.data.models.map(m => m.name);
        } catch (error) {
            console.error('Error listing Ollama models:', error.message);
            return [];
        }
    }

    /**
     * Pull a model from Ollama registry
     * @param {string} modelName - Name of the model to pull
     * @returns {Promise<boolean>} Success status
     */
    async pullModel(modelName) {
        try {
            await axios.post(`${this.baseUrl}/api/pull`, {
                name: modelName,
            });
            return true;
        } catch (error) {
            console.error(`Error pulling model ${modelName}:`, error.message);
            return false;
        }
    }
}

module.exports = OllamaClient;

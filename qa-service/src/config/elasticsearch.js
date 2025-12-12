const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

/**
 * Elasticsearch client configuration
 * Connects to Elasticsearch instance for meal data indexing and search
 */
class ElasticsearchClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Initialize Elasticsearch client
     */
    async connect() {
        if (this.client) {
            return this.client;
        }

        const elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

        try {
            this.client = new Client({
                node: elasticsearchUrl,
                maxRetries: 5,
                requestTimeout: 60000,
                sniffOnStart: false
            });

            // Test connection
            const info = await this.client.info();
            console.log('✅ Elasticsearch Connected:', info.version.number);
            this.isConnected = true;

            return this.client;
        } catch (error) {
            console.error('❌ Elasticsearch Connection Error:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Get client instance
     */
    getClient() {
        if (!this.client) {
            throw new Error('Elasticsearch client not initialized. Call connect() first.');
        }
        return this.client;
    }

    /**
     * Check connection status
     */
    async healthCheck() {
        try {
            if (!this.client) {
                return { connected: false, error: 'Client not initialized' };
            }

            const health = await this.client.cluster.health();
            return {
                connected: true,
                status: health.status,
                cluster: health.cluster_name
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Close connection
     */
    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.isConnected = false;
            console.log('🔌 Elasticsearch connection closed');
        }
    }
}

// Export singleton instance
const esClient = new ElasticsearchClient();
module.exports = esClient;

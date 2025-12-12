const esClient = require('../config/elasticsearch');
const { INDEX_NAME } = require('./indexer');

/**
 * Elasticsearch Search Service
 * Handles semantic search queries for meal data
 */

/**
 * Search meals based on natural language query
 * @param {string} query - User's search query
 * @param {object} filters - Optional filters (dietary, cuisine, cost, carbon)
 * @returns {Promise<Array>} - Array of matching meals
 */
async function searchMeals(query, filters = {}) {
    const client = esClient.getClient();
    const maxResults = parseInt(process.env.MAX_SEARCH_RESULTS || '5');

    try {
        // Build Elasticsearch query
        const esQuery = {
            bool: {
                must: {
                    multi_match: {
                        query: query,
                        fields: [
                            'name^3',           // Boost name matches
                            'description^2',    // Boost description matches
                            'dietary',
                            'cuisine'
                        ],
                        type: 'best_fields',
                        fuzziness: 'AUTO'
                    }
                },
                filter: []
            }
        };

        // Apply filters
        if (filters.dietary && filters.dietary.length > 0) {
            const dietaryArray = Array.isArray(filters.dietary) ? filters.dietary : [filters.dietary];
            esQuery.bool.filter.push({
                terms: { dietary: dietaryArray }
            });
        }

        if (filters.cuisine) {
            esQuery.bool.filter.push({
                term: { cuisine: filters.cuisine }
            });
        }

        if (filters.maxCost) {
            esQuery.bool.filter.push({
                range: { cost: { lte: parseFloat(filters.maxCost) } }
            });
        }

        if (filters.maxCarbon) {
            esQuery.bool.filter.push({
                range: { carbon: { lte: parseFloat(filters.maxCarbon) } }
            });
        }

        if (filters.minProtein) {
            esQuery.bool.filter.push({
                range: { protein: { gte: parseInt(filters.minProtein) } }
            });
        }

        if (filters.minCalories) {
            esQuery.bool.filter.push({
                range: { calories: { gte: parseInt(filters.minCalories) } }
            });
        }

        if (filters.maxCalories) {
            esQuery.bool.filter.push({
                range: { calories: { lte: parseInt(filters.maxCalories) } }
            });
        }

        // Execute search
        const result = await client.search({
            index: INDEX_NAME,
            body: {
                size: maxResults,
                query: esQuery,
                sort: [
                    { _score: { order: 'desc' } },
                    { rating: { order: 'desc' } }
                ]
            }
        });

        // Format results
        const meals = result.hits.hits.map(hit => ({
            id: hit._id,
            score: hit._score,
            ...hit._source
        }));

        console.log(`🔍 Found ${meals.length} meals for query: "${query}"`);

        return meals;
    } catch (error) {
        console.error('❌ Search error:', error.message);

        // Return empty array on error instead of throwing
        if (error.meta?.statusCode === 404) {
            console.warn('⚠️  Index not found. Please run indexing first.');
        }

        return [];
    }
}

/**
 * Get meal suggestions (random popular meals)
 * Used when query is too vague or no results found
 */
async function getSuggestions(limit = 5) {
    const client = esClient.getClient();

    try {
        const result = await client.search({
            index: INDEX_NAME,
            body: {
                size: limit,
                query: {
                    function_score: {
                        query: { match_all: {} },
                        random_score: {},
                        boost_mode: 'replace'
                    }
                },
                sort: [
                    { rating: { order: 'desc' } }
                ]
            }
        });

        return result.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source
        }));
    } catch (error) {
        console.error('❌ Error getting suggestions:', error.message);
        return [];
    }
}

/**
 * Search by specific field (e.g., cuisine, dietary)
 */
async function searchByField(field, value, limit = 10) {
    const client = esClient.getClient();

    try {
        const result = await client.search({
            index: INDEX_NAME,
            body: {
                size: limit,
                query: {
                    term: { [field]: value }
                },
                sort: [
                    { rating: { order: 'desc' } },
                    { cost: { order: 'asc' } }
                ]
            }
        });

        return result.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source
        }));
    } catch (error) {
        console.error(`❌ Error searching by ${field}:`, error.message);
        return [];
    }
}

module.exports = {
    searchMeals,
    getSuggestions,
    searchByField
};

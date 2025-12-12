const mongoose = require('mongoose');
const esClient = require('../config/elasticsearch');

/**
 * Elasticsearch Indexing Service
 * Handles meal data indexing from MongoDB to Elasticsearch
 */

const INDEX_NAME = 'meal_questions';

/**
 * Create Elasticsearch index with proper mappings
 */
async function createMealIndex() {
    const client = esClient.getClient();

    try {
        // Check if index exists
        const exists = await client.indices.exists({ index: INDEX_NAME });

        if (exists) {
            console.log(`ℹ️  Index "${INDEX_NAME}" already exists`);
            return;
        }

        // Create index with mappings
        await client.indices.create({
            index: INDEX_NAME,
            body: {
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 0,
                    analysis: {
                        analyzer: {
                            meal_analyzer: {
                                type: 'standard',
                                stopwords: '_english_'
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        name: {
                            type: 'text',
                            analyzer: 'meal_analyzer',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        description: {
                            type: 'text',
                            analyzer: 'meal_analyzer'
                        },
                        cost: { type: 'float' },
                        carbon: { type: 'float' },
                        calories: { type: 'integer' },
                        protein: { type: 'integer' },
                        cuisine: { type: 'keyword' },
                        dietary: { type: 'keyword' },
                        rating: { type: 'float' },
                        imageUrl: { type: 'keyword', index: false },
                        createdAt: { type: 'date' }
                    }
                }
            }
        });

        console.log(`✅ Created index "${INDEX_NAME}"`);
    } catch (error) {
        console.error('❌ Error creating index:', error.message);
        throw error;
    }
}

/**
 * Index meals from MongoDB to Elasticsearch
 */
async function indexMeals() {
    const client = esClient.getClient();

    try {
        // Import Meal model
        const Meal = require('../models/Meal');

        // Fetch all meals from MongoDB
        const meals = await Meal.find({}).lean();

        if (meals.length === 0) {
            console.log('⚠️  No meals found in MongoDB');
            return 0;
        }

        // Prepare bulk operations
        const operations = meals.flatMap(meal => [
            { index: { _index: INDEX_NAME, _id: meal._id.toString() } },
            {
                name: meal.name,
                description: meal.description,
                cost: meal.cost,
                carbon: meal.carbon,
                calories: meal.calories || 0,
                protein: meal.protein || 0,
                cuisine: meal.cuisine || 'Other',
                dietary: meal.dietary || [],
                rating: meal.rating || 0,
                imageUrl: meal.imageUrl || '',
                createdAt: meal.createdAt || new Date()
            }
        ]);

        // Bulk index
        const result = await client.bulk({
            body: operations,
            refresh: true
        });

        if (result.errors) {
            const erroredDocuments = [];
            result.items.forEach((action, i) => {
                const operation = Object.keys(action)[0];
                if (action[operation].error) {
                    erroredDocuments.push({
                        status: action[operation].status,
                        error: action[operation].error
                    });
                }
            });
            console.error('❌ Bulk indexing errors:', erroredDocuments);
        }

        const indexed = meals.length;
        console.log(`✅ Indexed ${indexed} meals to Elasticsearch`);

        return indexed;
    } catch (error) {
        console.error('❌ Error indexing meals:', error.message);
        throw error;
    }
}

/**
 * Delete and recreate index (full reindex)
 */
async function reindexMeals() {
    const client = esClient.getClient();

    try {
        // Delete index if exists
        const exists = await client.indices.exists({ index: INDEX_NAME });
        if (exists) {
            await client.indices.delete({ index: INDEX_NAME });
            console.log(`🗑️  Deleted existing index "${INDEX_NAME}"`);
        }

        // Create fresh index
        await createMealIndex();

        // Index all meals
        const count = await indexMeals();

        return count;
    } catch (error) {
        console.error('❌ Error reindexing:', error.message);
        throw error;
    }
}

/**
 * Get index statistics
 */
async function getIndexStats() {
    const client = esClient.getClient();

    try {
        const stats = await client.indices.stats({ index: INDEX_NAME });
        const count = await client.count({ index: INDEX_NAME });

        return {
            index: INDEX_NAME,
            documentCount: count.count,
            sizeInBytes: stats._all.total.store.size_in_bytes,
            health: stats._shards.failed === 0 ? 'healthy' : 'degraded'
        };
    } catch (error) {
        if (error.meta?.statusCode === 404) {
            return {
                index: INDEX_NAME,
                exists: false,
                error: 'Index not found'
            };
        }
        throw error;
    }
}

module.exports = {
    INDEX_NAME,
    createMealIndex,
    indexMeals,
    reindexMeals,
    getIndexStats
};

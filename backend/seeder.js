const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Meal = require('./models/Meal');

dotenv.config();

// Enhanced sample meal data with realistic values
const sampleMeals = [
    {
        name: 'Grilled Chicken Salad',
        cost: 8.50,
        carbon: 2.1,
        rating: 4.2,
        description: 'Fresh greens with grilled chicken breast and balsamic vinaigrette',
        calories: 350,
        protein: 30,
        cuisine: 'American',
        dietary: ['Gluten-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    {
        name: 'Vegetable Stir Fry',
        cost: 6.00,
        carbon: 1.2,
        rating: 4.0,
        description: 'Colorful vegetables with tofu in savory sauce',
        calories: 280,
        protein: 12,
        cuisine: 'Chinese',
        dietary: ['Vegetarian', 'Vegan'],
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'
    },
    {
        name: 'Quinoa Buddha Bowl',
        cost: 9.00,
        carbon: 1.8,
        rating: 4.5,
        description: 'Quinoa with roasted vegetables, chickpeas, and tahini dressing',
        calories: 400,
        protein: 14,
        cuisine: 'Mediterranean',
        dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400'
    },
    {
        name: 'Lentil Curry',
        cost: 5.50,
        carbon: 0.9,
        rating: 4.1,
        description: 'Spiced lentils in creamy tomato sauce with basmati rice',
        calories: 320,
        protein: 18,
        cuisine: 'Indian',
        dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'
    },
    {
        name: 'Grilled Salmon',
        cost: 12.00,
        carbon: 3.5,
        rating: 4.3,
        description: 'Fresh Atlantic salmon with lemon and herbs',
        calories: 450,
        protein: 40,
        cuisine: 'Mediterranean',
        dietary: ['Gluten-Free', 'Dairy-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'
    },
    {
        name: 'Black Bean Burrito',
        cost: 7.00,
        carbon: 1.5,
        rating: 4.0,
        description: 'Whole wheat tortilla with black beans, rice, and fresh salsa',
        calories: 380,
        protein: 15,
        cuisine: 'Mexican',
        dietary: ['Vegetarian'],
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'
    },
    {
        name: 'Pasta Primavera',
        cost: 8.00,
        carbon: 2.0,
        rating: 3.9,
        description: 'Whole grain pasta with seasonal vegetables and olive oil',
        calories: 420,
        protein: 10,
        cuisine: 'Italian',
        dietary: ['Vegetarian'],
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'
    },
    {
        name: 'Chickpea Hummus Wrap',
        cost: 6.50,
        carbon: 1.1,
        rating: 4.2,
        description: 'Whole wheat wrap with homemade hummus and crunchy vegetables',
        calories: 310,
        protein: 12,
        cuisine: 'Middle Eastern',
        dietary: ['Vegetarian', 'Vegan'],
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400'
    },
    {
        name: 'Mushroom Risotto',
        cost: 10.00,
        carbon: 1.7,
        rating: 4.4,
        description: 'Creamy arborio rice with wild mushrooms',
        calories: 520,
        protein: 14,
        cuisine: 'Italian',
        dietary: ['Vegetarian'],
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-c0e224bc05e4?w=400'
    },
    {
        name: 'Thai Green Curry',
        cost: 9.50,
        carbon: 2.3,
        rating: 4.6,
        description: 'Spicy green curry with coconut milk and fresh basil',
        calories: 390,
        protein: 22,
        cuisine: 'Thai',
        dietary: ['Gluten-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400'
    },
    {
        name: 'Greek Salad Bowl',
        cost: 7.50,
        carbon: 1.4,
        rating: 4.3,
        description: 'Fresh tomatoes, cucumber, olives, and feta cheese',
        calories: 290,
        protein: 11,
        cuisine: 'Greek',
        dietary: ['Vegetarian', 'Gluten-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'
    },
    {
        name: 'Teriyaki Tofu Bowl',
        cost: 8.00,
        carbon: 1.6,
        rating: 4.1,
        description: 'Crispy tofu with vegetables in teriyaki sauce over rice',
        calories: 360,
        protein: 16,
        cuisine: 'Japanese',
        dietary: ['Vegetarian', 'Vegan'],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-d3a9b2c69333?w=400'
    },
    {
        name: 'Smoothie Bowl',
        cost: 6.00,
        carbon: 0.8,
        rating: 4.5,
        description: 'Acai and banana smoothie topped with granola and fresh berries',
        calories: 340,
        protein: 8,
        cuisine: 'American',
        dietary: ['Vegetarian', 'Vegan'],
        imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400'
    },
    {
        name: 'Falafel Plate',
        cost: 8.50,
        carbon: 1.3,
        rating: 4.4,
        description: 'Crispy falafel with tahini sauce, hummus, and pita',
        calories: 410,
        protein: 14,
        cuisine: 'Middle Eastern',
        dietary: ['Vegetarian', 'Vegan'],
        imageUrl: 'https://images.unsplash.com/photo-1593252719531-0f29bbea6b22?w=400'
    },
    {
        name: 'Beef Pho',
        cost: 11.00,
        carbon: 4.2,
        rating: 4.7,
        description: 'Vietnamese rice noodle soup with beef and fresh herbs',
        calories: 470,
        protein: 28,
        cuisine: 'Other',
        dietary: ['Dairy-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400'
    },
    {
        name: 'Caprese Panini',
        cost: 7.00,
        carbon: 1.9,
        rating: 4.2,
        description: 'Grilled sandwich with mozzarella, tomatoes, and basil',
        calories: 380,
        protein: 16,
        cuisine: 'Italian',
        dietary: ['Vegetarian'],
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400'
    },
    {
        name: 'Sweet Potato Curry',
        cost: 6.50,
        carbon: 1.0,
        rating: 4.3,
        description: 'Creamy sweet potato and spinach curry',
        calories: 330,
        protein: 10,
        cuisine: 'Indian',
        dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400'
    },
    {
        name: 'Sushi Roll Combo',
        cost: 13.00,
        carbon: 2.8,
        rating: 4.6,
        description: 'Assorted fresh sushi rolls with soy sauce and wasabi',
        calories: 420,
        protein: 24,
        cuisine: 'Japanese',
        dietary: ['Dairy-Free'],
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'
    },
    {
        name: 'Margherita Pizza',
        cost: 9.00,
        carbon: 2.5,
        rating: 4.5,
        description: 'Classic pizza with fresh mozzarella and basil',
        calories: 550,
        protein: 18,
        cuisine: 'Italian',
        dietary: ['Vegetarian'],
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
    },
    {
        name: 'Egg Avocado Toast',
        cost: 7.50,
        carbon: 1.2,
        rating: 4.4,
        description: 'Sourdough toast with smashed avocado and poached egg',
        calories: 340,
        protein: 14,
        cuisine: 'American',
        dietary: ['Vegetarian'],
        imageUrl: 'https://images.unsplash.com/photo-15 65299624946-e5a85a1b25c6?w=400'
    }
];

const seedData = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        // Use simpler connection without auth for local development
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sapor?authSource=admin';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Clear existing meals
        console.log('🧹 Clearing existing meals...');
        const deleteResult = await Meal.deleteMany();
        console.log(`✅ Deleted ${deleteResult.deletedCount} existing meals`);

        // Insert new meals
        console.log('📦 Inserting meal data...');
        const inserted = await Meal.insertMany(sampleMeals);
        console.log(`✅ Successfully imported ${inserted.length} meals`);

        // Display summary
        console.log('\n📊 Database Summary:');
        console.log(`   Total Meals: ${inserted.length}`);
        console.log(`   Cuisines: ${[...new Set(inserted.map(m => m.cuisine))].join(', ')}`);
        console.log(`   Dietary Options: ${[...new Set(inserted.flatMap(m => m.dietary))].join(', ')}`);
        console.log('\n🎉 Seeding complete!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedData();
}

module.exports = seedData;

/**
 * Lightweight smoke test for SAPOR backend.
 * Runs health, meals, and feedback endpoints to validate basic wiring.
 */
const fetch = global.fetch || require('node-fetch');

const BASE = process.env.BASE_URL || 'http://localhost:3001';

async function assertOk(resp, label) {
  if (!resp.ok) {
    const body = await resp.text();
    console.error('Error Body:', body);
    throw new Error(`${label} failed: ${resp.status} ${resp.statusText} - ${body}`);
  }
}

async function run() {
  console.log('🌡️  /api/health');
  let resp = await fetch(`${BASE}/api/health`);
  await assertOk(resp, 'Health');

  console.log('🥗 /api/meals');
  resp = await fetch(`${BASE}/api/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'budget', budget: 50, limit: 3 })
  });
  await assertOk(resp, 'Meals');
  const meals = await resp.json();
  if (!Array.isArray(meals.meals)) throw new Error('Meals response invalid');

  console.log('⭐ /api/feedback');
  const mealId = meals.meals[0]?.id || meals.meals[0]?._id;
  const mealName = meals.meals[0]?.name || 'Test Meal';

  if (!mealId) throw new Error('No meal ID found to rate');

  resp = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealId, mealName, rating: 4 })
  });
  await assertOk(resp, 'Feedback');

  console.log('✅ Smoke tests passed');
}

run().catch((err) => {
  console.error('❌ Smoke test failed', err);
  process.exit(1);
});









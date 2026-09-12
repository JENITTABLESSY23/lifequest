/**
 * LifeQuest — Phase 6 Reward Shop & Inventory Integration Test Suite
 *
 * Tests:
 *  A. Seed Setup — POST /api/rewards/seed creates the 3 canonical reward items
 *  B. Shop Retrieval — GET /api/rewards returns all shop items (public, no auth required)
 *  C. Successful Purchase — user with enough gold can buy; gold deducted by server-authoritative price
 *  D. Server-Authoritative Price — client-submitted price is completely ignored
 *  E. Fake Gold Manipulation — client cannot inflate gold via request body
 *  F. Fake UserId Manipulation — client cannot purchase on behalf of another user
 *  G. Insufficient Gold — purchase rejected with 400 when user has < item.price gold
 *  H. Duplicate Purchase Protection — buying same item twice is rejected with 400
 *  I. User Isolation — User B cannot see or purchase from User A's session
 *  J. Unauthenticated Access — protected routes return 401 without JWT
 *  K. Invalid Reward ID — non-existent or malformed ID returns 404
 *  L. Inventory Retrieval — GET /api/rewards/inventory returns owned items with full item details
 *
 * Run: node server/tests/testRewards.js  (from lifequest root)
 *   or: node tests/testRewards.js         (from server/ dir)
 */

const BASE = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
let rewardItems = [];   // populated after seed
let shopItemA = null;   // cheapest item (Shadow Mage Avatar, 500G)
let shopItemB = null;   // mid-price item (Midnight Realm Theme, 750G)
let shopItemC = null;   // most expensive (Quest Master Badge, 1000G)

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ' → ' + detail : ''}`);
    failed++;
  }
}

async function req(method, path, body, token) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function registerAndLogin(suffix = '') {
  const email = `reward_user_${Date.now()}_${Math.floor(Math.random() * 100000)}${suffix}@lifequest.io`;
  const password = 'Password123!';
  const name = `RewardTester_${suffix}`;
  await req('POST', '/auth/register', { name, email, password });
  const loginRes = await req('POST', '/auth/login', { email, password });
  return { token: loginRes.body.token, userId: loginRes.body.user?._id };
}

async function setGold(token, gold) {
  await req('PATCH', '/auth/test-set-gold', { gold }, token);
}

// ── A. Seed Setup ─────────────────────────────────────────────────────────────

async function testSeedSetup() {
  console.log('\n[ A ] Seed Setup — POST /api/rewards/seed');

  const { status, body } = await req('POST', '/rewards/seed');
  assert(status === 200, 'Seed returns 200', `got ${status}`);
  assert(body.success === true, 'body.success is true', JSON.stringify(body));
  assert(body.count === 3, `Seeded exactly 3 items`, `got count=${body.count}`);

  const expectedNames = ['Shadow Mage Avatar', 'Midnight Realm Theme', 'Quest Master Badge'];
  for (const name of expectedNames) {
    assert(
      Array.isArray(body.items) && body.items.includes(name),
      `Seeded item: "${name}"`,
      `items=${JSON.stringify(body.items)}`
    );
  }

  // Re-seed is idempotent (no duplicates)
  const { status: s2, body: b2 } = await req('POST', '/rewards/seed');
  assert(s2 === 200 && b2.count === 3, 'Re-seed is idempotent — still 3 items', `count=${b2.count}`);
}

// ── B. Shop Retrieval ────────────────────────────────────────────────────────

async function testShopRetrieval() {
  console.log('\n[ B ] Shop Retrieval — GET /api/rewards (public)');

  const { status, body } = await req('GET', '/rewards');
  assert(status === 200, 'GET /rewards returns 200', `got ${status}`);
  assert(body.success === true, 'body.success is true');
  assert(Array.isArray(body.rewards), 'body.rewards is an array');
  assert(body.rewards.length === 3, 'Shop contains exactly 3 items', `got ${body.rewards.length}`);

  // Store items for later tests
  rewardItems = body.rewards;
  shopItemA = rewardItems.find((i) => i.name === 'Shadow Mage Avatar');   // 500G
  shopItemB = rewardItems.find((i) => i.name === 'Midnight Realm Theme'); // 750G
  shopItemC = rewardItems.find((i) => i.name === 'Quest Master Badge');   // 1000G

  assert(shopItemA && shopItemA.price === 500, 'Shadow Mage Avatar price=500', JSON.stringify(shopItemA));
  assert(shopItemA && shopItemA.type === 'AVATAR', 'Shadow Mage Avatar type=AVATAR');
  assert(shopItemA && shopItemA.rarity === 'EPIC', 'Shadow Mage Avatar rarity=EPIC');

  assert(shopItemB && shopItemB.price === 750, 'Midnight Realm Theme price=750', JSON.stringify(shopItemB));
  assert(shopItemB && shopItemB.type === 'THEME', 'Midnight Realm Theme type=THEME');
  assert(shopItemB && shopItemB.rarity === 'RARE', 'Midnight Realm Theme rarity=RARE');

  assert(shopItemC && shopItemC.price === 1000, 'Quest Master Badge price=1000', JSON.stringify(shopItemC));
  assert(shopItemC && shopItemC.type === 'BADGE', 'Quest Master Badge type=BADGE');
  assert(shopItemC && shopItemC.rarity === 'LEGENDARY', 'Quest Master Badge rarity=LEGENDARY');

  // Public: no token needed
  const { status: noAuth } = await req('GET', '/rewards', null, null);
  assert(noAuth === 200, 'GET /rewards accessible without auth token', `got ${noAuth}`);
}

// ── C. Successful Purchase ───────────────────────────────────────────────────

async function testSuccessfulPurchase() {
  console.log('\n[ C ] Successful Purchase — Gold deducted by server price');

  if (!shopItemA) { console.log('  ⚠️  SKIP: shopItemA not seeded'); return; }

  const { token } = await registerAndLogin('_purchase');
  await setGold(token, 600); // enough for 500G item

  const { status, body } = await req('POST', `/rewards/${shopItemA._id}/purchase`, {}, token);
  assert(status === 200, 'Purchase returns 200', `got ${status}: ${JSON.stringify(body)}`);
  assert(body.success === true, 'body.success is true');
  assert(body.item?.name === 'Shadow Mage Avatar', 'Purchased item name is correct');
  assert(body.gold === 100, `Remaining gold = 600 - 500 = 100`, `got gold=${body.gold}`);
  assert(Array.isArray(body.inventory) && body.inventory.length === 1, 'Inventory has 1 item after purchase');
}

// ── D. Server-Authoritative Price ────────────────────────────────────────────

async function testServerAuthoritativePrice() {
  console.log('\n[ D ] Server-Authoritative Price — client price field ignored');

  if (!shopItemA) { console.log('  ⚠️  SKIP: shopItemA not seeded'); return; }

  const { token } = await registerAndLogin('_price');
  await setGold(token, 600);

  // Client sends a fake price of 1 (attempting to pay less)
  const { status, body } = await req(
    'POST',
    `/rewards/${shopItemA._id}/purchase`,
    { price: 1 },  // this should be completely ignored by server
    token
  );

  // Server should still deduct 500 (authoritative price)
  assert(status === 200, 'Purchase succeeds despite fake price in body', `got ${status}`);
  assert(body.gold === 100, `Server deducted authoritative price 500, not client price 1 (remaining=100)`, `got gold=${body.gold}`);
}

// ── E. Fake Gold Manipulation ─────────────────────────────────────────────────

async function testFakeGoldManipulation() {
  console.log('\n[ E ] Fake Gold Manipulation — client cannot inflate gold');

  if (!shopItemC) { console.log('  ⚠️  SKIP: shopItemC not seeded'); return; }

  const { token } = await registerAndLogin('_fakegold');
  await setGold(token, 500); // only 500G but item costs 1000G

  // Client sends fake gold=99999 in body hoping to bypass check
  const { status, body } = await req(
    'POST',
    `/rewards/${shopItemC._id}/purchase`,
    { gold: 99999 },  // server must ignore this entirely
    token
  );

  assert(status === 400, 'Purchase rejected: fake gold in body ignored, real gold insufficient', `got ${status}`);
  assert(body.message === 'Insufficient Gold', `Correct rejection message`, `got "${body.message}"`);
}

// ── F. Fake UserId Manipulation ────────────────────────────────────────────────

async function testFakeUserIdManipulation() {
  console.log('\n[ F ] Fake UserId Manipulation — JWT userId used, not client body');

  if (!shopItemA) { console.log('  ⚠️  SKIP: shopItemA not seeded'); return; }

  // User A — has gold, owns no items
  const userA = await registerAndLogin('_fakeuid_A');
  await setGold(userA.token, 600);

  // User B — no gold
  const userB = await registerAndLogin('_fakeuid_B');
  await setGold(userB.token, 0);

  // B tries to purchase by sending A's userId in the body
  const { status, body } = await req(
    'POST',
    `/rewards/${shopItemA._id}/purchase`,
    { userId: userA.userId }, // server must use JWT, not this field
    userB.token
  );

  assert(status === 400, 'B with 0 gold rejected even when sending A userId', `got ${status}: ${JSON.stringify(body)}`);
  assert(body.message === 'Insufficient Gold', `Correct insufficient gold rejection`, `got "${body.message}"`);

  // Verify A's gold untouched (A didn't purchase)
  const invA = await req('GET', '/rewards/inventory', null, userA.token);
  assert(invA.body.count === 0, `A's inventory still empty (purchase was by B's JWT)`, `count=${invA.body.count}`);
}

// ── G. Insufficient Gold ──────────────────────────────────────────────────────

async function testInsufficientGold() {
  console.log('\n[ G ] Insufficient Gold — rejected with 400');

  if (!shopItemA) { console.log('  ⚠️  SKIP: shopItemA not seeded'); return; }

  const { token } = await registerAndLogin('_nogold');
  await setGold(token, 0);  // zero gold

  const { status, body } = await req('POST', `/rewards/${shopItemA._id}/purchase`, {}, token);
  assert(status === 400, 'Purchase returns 400 with 0 gold', `got ${status}`);
  assert(body.message === 'Insufficient Gold', `Correct message`, `got "${body.message}"`);

  // Also test 1 gold below threshold
  await setGold(token, shopItemA.price - 1);  // 499G for a 500G item
  const { status: s2, body: b2 } = await req('POST', `/rewards/${shopItemA._id}/purchase`, {}, token);
  assert(s2 === 400, 'Purchase returns 400 with price-1 gold', `got ${s2}`);
  assert(b2.message === 'Insufficient Gold', `Correct message for price-1`, `got "${b2.message}"`);
}

// ── H. Duplicate Purchase Protection ─────────────────────────────────────────

async function testDuplicatePurchase() {
  console.log('\n[ H ] Duplicate Purchase Protection — 400 on second attempt');

  if (!shopItemA) { console.log('  ⚠️  SKIP: shopItemA not seeded'); return; }

  const { token } = await registerAndLogin('_dup');
  await setGold(token, 2000); // plenty of gold

  // First purchase — should succeed
  const { status: s1, body: b1 } = await req('POST', `/rewards/${shopItemA._id}/purchase`, {}, token);
  assert(s1 === 200, 'First purchase succeeds', `got ${s1}`);
  assert(b1.gold === 1500, 'Gold is 1500 after first purchase (2000 - 500)', `got ${b1.gold}`);

  // Second purchase of same item with client trying to bypass via { inventory: [] } — should fail
  const { status: s2, body: b2 } = await req('POST', `/rewards/${shopItemA._id}/purchase`, { inventory: [] }, token);
  assert(s2 === 400, 'Second purchase of same item returns 400', `got ${s2}`);
  assert(b2.message === 'Item already owned', `Correct duplicate message`, `got "${b2.message}"`);

  // Verify Gold was NOT deducted again on duplicate attempt
  const userMe = await req('GET', '/auth/me', null, token);
  assert(userMe.body.user?.gold === 1500, 'Gold remains 1500 — duplicate purchase deducted 0 gold', `got ${userMe.body.user?.gold}`);

  // Gold should only have been deducted once, and inventory has 1 item
  const invRes = await req('GET', '/rewards/inventory', null, token);
  const ownedCount = invRes.body.inventory?.filter(
    (i) => i.name === 'Shadow Mage Avatar'
  ).length;
  assert(ownedCount === 1, 'Inventory contains exactly 1 copy of item (no duplication)', `count=${ownedCount}`);
}

// ── I. User Isolation ─────────────────────────────────────────────────────────

async function testUserIsolation() {
  console.log('\n[ I ] User Isolation — User B inventory independent of User A');

  if (!shopItemA || !shopItemB) { console.log('  ⚠️  SKIP: items not seeded'); return; }

  const userA = await registerAndLogin('_iso_A');
  const userB = await registerAndLogin('_iso_B');
  await setGold(userA.token, 1000);
  await setGold(userB.token, 1000);

  // A buys item A
  await req('POST', `/rewards/${shopItemA._id}/purchase`, {}, userA.token);
  // B buys item B
  await req('POST', `/rewards/${shopItemB._id}/purchase`, {}, userB.token);

  const invA = await req('GET', '/rewards/inventory', null, userA.token);
  const invB = await req('GET', '/rewards/inventory', null, userB.token);

  assert(invA.body.count === 1, 'User A has 1 inventory item', `count=${invA.body.count}`);
  assert(invB.body.count === 1, 'User B has 1 inventory item', `count=${invB.body.count}`);

  const aOwnsA = invA.body.inventory?.some((i) => i.name === 'Shadow Mage Avatar');
  const bOwnsB = invB.body.inventory?.some((i) => i.name === 'Midnight Realm Theme');
  const aOwnsB = invA.body.inventory?.some((i) => i.name === 'Midnight Realm Theme');
  const bOwnsA = invB.body.inventory?.some((i) => i.name === 'Shadow Mage Avatar');

  assert(aOwnsA, 'User A owns Shadow Mage Avatar');
  assert(bOwnsB, 'User B owns Midnight Realm Theme');
  assert(!aOwnsB, 'User A does NOT own User B item');
  assert(!bOwnsA, 'User B does NOT own User A item');
}

// ── J. Unauthenticated Access ─────────────────────────────────────────────────

async function testUnauthenticatedAccess() {
  console.log('\n[ J ] Unauthenticated Access — protected routes return 401');

  if (!shopItemA) { console.log('  ⚠️  SKIP: shopItemA not seeded'); return; }

  const { status: s1 } = await req('POST', `/rewards/${shopItemA._id}/purchase`, {}, null);
  assert(s1 === 401, 'POST /rewards/:id/purchase without token returns 401', `got ${s1}`);

  const { status: s2 } = await req('GET', '/rewards/inventory', null, null);
  assert(s2 === 401, 'GET /rewards/inventory without token returns 401', `got ${s2}`);

  // Public browse should still work
  const { status: s3 } = await req('GET', '/rewards', null, null);
  assert(s3 === 200, 'GET /rewards (shop browse) still works without token', `got ${s3}`);
}

// ── K. Invalid Reward ID ──────────────────────────────────────────────────────

async function testInvalidRewardId() {
  console.log('\n[ K ] Invalid Reward ID — non-existent or malformed returns 404');

  const { token } = await registerAndLogin('_invalid');
  await setGold(token, 9999);

  // Malformed ObjectId
  const { status: s1, body: b1 } = await req('POST', '/rewards/not-an-id/purchase', {}, token);
  assert(s1 === 404, 'Malformed ObjectId returns 404', `got ${s1}: ${JSON.stringify(b1)}`);

  // Valid ObjectId format but non-existent
  const fakeId = '000000000000000000000001';
  const { status: s2, body: b2 } = await req('POST', `/rewards/${fakeId}/purchase`, {}, token);
  assert(s2 === 404, 'Non-existent valid ObjectId returns 404', `got ${s2}: ${JSON.stringify(b2)}`);
}

// ── L. Inventory Retrieval ────────────────────────────────────────────────────

async function testInventoryRetrieval() {
  console.log('\n[ L ] Inventory Retrieval — GET /api/rewards/inventory returns populated items');

  if (!shopItemA) { console.log('  ⚠️  SKIP: shopItemA not seeded'); return; }

  const { token } = await registerAndLogin('_inv');
  await setGold(token, 2000);

  // Empty inventory initially
  const emptyRes = await req('GET', '/rewards/inventory', null, token);
  assert(emptyRes.status === 200, 'GET /inventory returns 200', `got ${emptyRes.status}`);
  assert(emptyRes.body.count === 0, 'Empty inventory count=0', `got ${emptyRes.body.count}`);
  assert(Array.isArray(emptyRes.body.inventory) && emptyRes.body.inventory.length === 0,
    'Empty inventory array is empty');

  // Buy one item
  await req('POST', `/rewards/${shopItemA._id}/purchase`, {}, token);

  const filledRes = await req('GET', '/rewards/inventory', null, token);
  assert(filledRes.status === 200, 'GET /inventory returns 200 after purchase');
  assert(filledRes.body.count === 1, 'Inventory count=1 after 1 purchase', `got ${filledRes.body.count}`);

  const item = filledRes.body.inventory?.[0];
  assert(item?.name === 'Shadow Mage Avatar', 'Inventory item name populated', `got ${item?.name}`);
  assert(item?.type === 'AVATAR', 'Inventory item type populated', `got ${item?.type}`);
  assert(item?.rarity === 'EPIC', 'Inventory item rarity populated', `got ${item?.rarity}`);
  assert(item?.price === 500, 'Inventory item price populated', `got ${item?.price}`);
  assert(item?.purchasedAt != null, 'Inventory item purchasedAt populated');
}

// ── M. Production Seed Endpoint Protection ────────────────────────────────────

async function testProductionSeedProtection() {
  console.log('\n[ M ] Production Seed Protection — route blocked & unmounted in production');

  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';

    // Fresh import of rewardRoutes under NODE_ENV=production
    const mod = await import(`../routes/rewardRoutes.js?prod_test=${Date.now()}`);
    const prodRouter = mod.default;

    // Verify /seed route is NOT registered on the router in production
    const seedLayer = prodRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/seed'
    );
    assert(seedLayer === undefined, 'Seed route is NOT mounted when NODE_ENV=production');

    // Verify all legitimate routes are still mounted
    const registeredPaths = prodRouter.stack
      .filter((layer) => layer.route)
      .map((layer) => layer.route.path);

    assert(registeredPaths.includes('/'), 'GET / (shop browse) remains mounted in production');
    assert(registeredPaths.includes('/inventory'), 'GET /inventory remains mounted in production');
    assert(registeredPaths.includes('/:id/purchase'), 'POST /:id/purchase remains mounted in production');
    assert(!registeredPaths.includes('/seed'), 'POST /seed is strictly excluded in production');
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
}

// ── Main Runner ────────────────────────────────────────────────────────────────

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  LifeQuest Phase 6 — Reward Shop & Inventory Test Suite');
  console.log('══════════════════════════════════════════════════════════════');

  try {
    await testSeedSetup();
    await testShopRetrieval();
    await testSuccessfulPurchase();
    await testServerAuthoritativePrice();
    await testFakeGoldManipulation();
    await testFakeUserIdManipulation();
    await testInsufficientGold();
    await testDuplicatePurchase();
    await testUserIsolation();
    await testUnauthenticatedAccess();
    await testInvalidRewardId();
    await testInventoryRetrieval();
    await testProductionSeedProtection();
  } catch (err) {
    console.error('\n💥 Fatal test error:', err.message);
    failed++;
  }

  const total = passed + failed;
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

main();


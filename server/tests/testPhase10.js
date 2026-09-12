/**
 * LifeQuest — Phase 10 Robustness & Edge Cases Test Suite
 *
 * Test Groups:
 *  A. Authentication Edge Cases & Token Verification
 *  B. Quest Creation Input Validation & Malformed Payloads
 *  C. Quest Ownership & Privacy Enforcement
 *  D. Quest Update Edge Cases & Completed Quest Immutability
 *  E. Concurrent / Duplicate Quest Completion Atomic Protection
 *  F. Client Security & Progression Manipulation Immunity
 *  G. Reward Shop Edge Cases & Concurrent Purchase Protection
 *  H. Auth Registration & Login Edge Cases
 *  I. Database Health & Route Error Handling
 *
 * Run: node server/tests/testPhase10.js
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';


let passed = 0;
let failed = 0;

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
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function registerAndLogin(suffix = '') {
  const email = `phase10_${Date.now()}_${Math.floor(Math.random() * 1000000)}${suffix}@lifequest.io`;
  const password = 'Password123!';
  const name = `RobustHero_${suffix}`;
  await req('POST', '/auth/register', { name, email, password });
  const loginRes = await req('POST', '/auth/login', { email, password });
  return { token: loginRes.body.token, userId: loginRes.body.user?._id || loginRes.body.user?.id, email, name };
}

async function runPhase10Tests() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  LifeQuest Phase 10 — Robustness & Edge Cases Test Suite     ');
  console.log('══════════════════════════════════════════════════════════════\n');

  // Setup users
  const userA = await registerAndLogin('A');
  const userB = await registerAndLogin('B');

  // =========================================================================
  // [ A ] Authentication Edge Cases & Token Verification
  // =========================================================================
  console.log('[ A ] Authentication Edge Cases & Token Verification');

  const noHeader = await req('GET', '/profile');
  assert(noHeader.status === 401, 'Request with no Authorization header returns 401');
  assert(noHeader.body.success === false, 'noHeader body.success is false');

  const emptyBearer = await fetch(`${BASE}/profile`, {
    headers: { Authorization: 'Bearer' },
  });
  assert(emptyBearer.status === 401, 'Request with header "Bearer" (missing token) returns 401');

  const whitespaceBearer = await fetch(`${BASE}/profile`, {
    headers: { Authorization: 'Bearer    ' },
  });
  assert(whitespaceBearer.status === 401, 'Request with whitespace-only Bearer token returns 401');

  const basicHeader = await fetch(`${BASE}/profile`, {
    headers: { Authorization: 'Basic dXNlcjpwYXNz' },
  });
  assert(basicHeader.status === 401, 'Request with Basic auth header instead of Bearer returns 401');

  const invalidJwt = await fetch(`${BASE}/profile`, {
    headers: { Authorization: 'Bearer this.is.not.a.valid.jwt.token' },
  });
  assert(invalidJwt.status === 401, 'Request with random invalid JWT returns 401');

  // Expired token (expires 1 second in the past)
  const expiredToken = jwt.sign(
    { id: userA.userId },
    JWT_SECRET,
    { expiresIn: '-1s' }
  );
  const expiredRes = await req('GET', '/profile', undefined, expiredToken);
  assert(expiredRes.status === 401, 'Request with expired JWT returns 401');
  assert(expiredRes.body.message.includes('expired'), 'Expired token message indicates expiration');

  // Forged signature (signed with different secret)
  const forgedToken = jwt.sign(
    { id: userA.userId },
    'wrong_attacker_secret_key'
  );
  const forgedRes = await req('GET', '/profile', undefined, forgedToken);
  assert(forgedRes.status === 401, 'Request with forged secret signature returns 401');

  // JWT with non-existent user ID
  const nonExistentIdToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const nonExistentRes = await req('GET', '/profile', undefined, nonExistentIdToken);
  assert(nonExistentRes.status === 401, 'Request with non-existent user ID returns 401');

  // JWT with invalid/non-ObjectId payload
  const malformedPayloadToken = jwt.sign(
    { id: 'not_an_object_id_123' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const malformedPayloadRes = await req('GET', '/profile', undefined, malformedPayloadToken);
  assert(malformedPayloadRes.status === 401, 'Request with non-ObjectId token payload returns 401');

  // Ensure password hash is never exposed in profile or auth
  const meRes = await req('GET', '/auth/me', undefined, userA.token);
  assert(meRes.status === 200 && meRes.body.user.password === undefined, 'GET /api/auth/me does not expose password hash');

  console.log();

  // =========================================================================
  // [ B ] Quest Creation Input Validation & Malformed Payloads
  // =========================================================================
  console.log('[ B ] Quest Creation Input Validation & Malformed Payloads');

  // Empty/missing body
  const emptyBodyRes = await req('POST', '/quests', {}, userA.token);
  assert(emptyBodyRes.status === 400, 'Create quest with empty body returns 400');

  // Array body
  const arrayBodyRes = await req('POST', '/quests', [{ title: 'Quest' }], userA.token);
  assert(arrayBodyRes.status === 400, 'Create quest with array body returns 400');

  // Missing title
  const noTitleRes = await req('POST', '/quests', { category: 'INTELLECT', difficulty: 'EASY' }, userA.token);
  assert(noTitleRes.status === 400, 'Create quest with missing title returns 400');

  // Empty title string
  const emptyTitleRes = await req('POST', '/quests', { title: '', category: 'INTELLECT', difficulty: 'EASY' }, userA.token);
  assert(emptyTitleRes.status === 400, 'Create quest with empty string title returns 400');

  // Whitespace-only title
  const whitespaceTitleRes = await req('POST', '/quests', { title: '    ', category: 'INTELLECT', difficulty: 'EASY' }, userA.token);
  assert(whitespaceTitleRes.status === 400, 'Create quest with whitespace-only title returns 400');

  // Overlong title (>100 chars)
  const longTitle = 'A'.repeat(101);
  const longTitleRes = await req('POST', '/quests', { title: longTitle, category: 'INTELLECT', difficulty: 'EASY' }, userA.token);
  assert(longTitleRes.status === 400, 'Create quest with title > 100 characters returns 400');

  // Invalid category
  const badCategoryRes = await req('POST', '/quests', { title: 'Valid Title', category: 'CHAOS_MAGIC', difficulty: 'EASY' }, userA.token);
  assert(badCategoryRes.status === 400, 'Create quest with invalid category returns 400');

  // Invalid difficulty
  const badDiffRes = await req('POST', '/quests', { title: 'Valid Title', category: 'INTELLECT', difficulty: 'NIGHTMARE' }, userA.token);
  assert(badDiffRes.status === 400, 'Create quest with invalid difficulty returns 400');

  // Overlong description (>500 chars)
  const longDesc = 'D'.repeat(501);
  const longDescRes = await req('POST', '/quests', { title: 'Valid Title', category: 'INTELLECT', difficulty: 'EASY', description: longDesc }, userA.token);
  assert(longDescRes.status === 400, 'Create quest with description > 500 characters returns 400');

  // Invalid due date
  const badDueDateRes = await req('POST', '/quests', { title: 'Valid Title', category: 'INTELLECT', difficulty: 'EASY', dueDate: 'not-a-date' }, userA.token);
  assert(badDueDateRes.status === 400, 'Create quest with invalid dueDate returns 400');

  // Valid quest creation succeeds
  const validQuestRes = await req('POST', '/quests', {
    title: '  Master Concurrency & Edge Cases  ',
    description: '  Study distributed locks and atomic updates  ',
    category: 'INTELLECT',
    difficulty: 'HARD',
  }, userA.token);
  assert(validQuestRes.status === 201, 'Valid quest creation returns 201');
  assert(validQuestRes.body.quest.title === 'Master Concurrency & Edge Cases', 'Title is properly trimmed');
  assert(validQuestRes.body.quest.xpReward === 150, 'Authoritative HARD xpReward is 150');
  assert(validQuestRes.body.quest.goldReward === 60, 'Authoritative HARD goldReward is 60');
  const questA1 = validQuestRes.body.quest;

  console.log();

  // =========================================================================
  // [ C ] Quest Ownership & Privacy Enforcement
  // =========================================================================
  console.log('[ C ] Quest Ownership & Privacy Enforcement');

  // User B cannot GET User A quest
  const bGetARes = await req('GET', `/quests/${questA1.id}`, undefined, userB.token);
  assert(bGetARes.status === 404, 'User B cannot view User A quest (returns 404)');

  // User B cannot UPDATE User A quest
  const bUpdateARes = await req('PUT', `/quests/${questA1.id}`, { title: 'Hacked Quest' }, userB.token);
  assert(bUpdateARes.status === 404, 'User B cannot update User A quest (returns 404)');

  // User B cannot DELETE User A quest
  const bDeleteARes = await req('DELETE', `/quests/${questA1.id}`, undefined, userB.token);
  assert(bDeleteARes.status === 404, 'User B cannot delete User A quest (returns 404)');

  // User B cannot COMPLETE User A quest
  const bCompleteARes = await req('POST', `/quests/${questA1.id}/complete`, undefined, userB.token);
  assert(bCompleteARes.status === 404, 'User B cannot complete User A quest (returns 404)');

  // Malformed Quest ID returns 404
  const malformedQuestRes = await req('GET', '/quests/not_an_id', undefined, userA.token);
  assert(malformedQuestRes.status === 404, 'Malformed quest ObjectId returns 404');

  console.log();

  // =========================================================================
  // [ D ] Quest Update Edge Cases & Completed Quest Immutability
  // =========================================================================
  console.log('[ D ] Quest Update Edge Cases & Completed Quest Immutability');

  // Update with empty title
  const updateEmptyTitle = await req('PUT', `/quests/${questA1.id}`, { title: '   ' }, userA.token);
  assert(updateEmptyTitle.status === 400, 'Update quest with empty title returns 400');

  // Update with invalid difficulty
  const updateBadDiff = await req('PUT', `/quests/${questA1.id}`, { difficulty: 'GODMODE' }, userA.token);
  assert(updateBadDiff.status === 400, 'Update quest with invalid difficulty returns 400');

  // Update with valid difficulty recalculates rewards
  const updateDiff = await req('PUT', `/quests/${questA1.id}`, { difficulty: 'EPIC' }, userA.token);
  assert(updateDiff.status === 200, 'Update quest difficulty to EPIC returns 200');
  assert(updateDiff.body.quest.xpReward === 250, 'Authoritative EPIC xpReward is 250');
  assert(updateDiff.body.quest.goldReward === 100, 'Authoritative EPIC goldReward is 100');

  console.log();

  // =========================================================================
  // [ E ] Concurrent / Duplicate Quest Completion Atomic Protection
  // =========================================================================
  console.log('[ E ] Concurrent / Duplicate Quest Completion Atomic Protection');

  // Create a dedicated quest for rapid concurrent completion testing
  const raceQuestRes = await req('POST', '/quests', {
    title: 'Atomic Race Test Quest',
    category: 'DISCIPLINE',
    difficulty: 'MEDIUM',
  }, userA.token);
  const raceQuestId = raceQuestRes.body.quest.id;

  // Snapshot user XP & Gold before concurrent race
  const beforeRaceUser = (await req('GET', '/auth/me', undefined, userA.token)).body.user;

  // Fire 5 SIMULTANEOUS completion requests in parallel
  const racePromises = Array.from({ length: 5 }, () =>
    req('POST', `/quests/${raceQuestId}/complete`, undefined, userA.token)
  );
  const raceResults = await Promise.all(racePromises);

  const successes = raceResults.filter((r) => r.status === 200);
  const duplicates = raceResults.filter((r) => r.status === 400);

  assert(successes.length === 1, 'Exactly ONE concurrent completion request succeeds (200)');
  assert(duplicates.length === 4, 'Remaining 4 concurrent requests are rejected (400)');

  // Verify XP & Gold were incremented exactly ONCE (MEDIUM: +100 XP, +40 Gold)
  const afterRaceUser = (await req('GET', '/auth/me', undefined, userA.token)).body.user;
  assert(afterRaceUser.xp === beforeRaceUser.xp + 100, `XP incremented by exactly 100 (${beforeRaceUser.xp} -> ${afterRaceUser.xp})`);
  assert(afterRaceUser.gold === beforeRaceUser.gold + 40, `Gold incremented by exactly 40 (${beforeRaceUser.gold} -> ${afterRaceUser.gold})`);

  // Subsequent completion attempts fail
  const laterCompleteRes = await req('POST', `/quests/${raceQuestId}/complete`, undefined, userA.token);
  assert(laterCompleteRes.status === 400, 'Subsequent completion of finished quest returns 400');
  assert(laterCompleteRes.body.message === 'Quest is already completed', 'Message states "Quest is already completed"');

  // Immutability: Editing an already completed quest must be rejected
  const editCompletedRes = await req('PUT', `/quests/${raceQuestId}`, { title: 'Edited After Complete' }, userA.token);
  assert(editCompletedRes.status === 400, 'Editing an already completed quest returns 400');
  assert(editCompletedRes.body.message.includes('Cannot edit an already completed quest'), 'Error indicates completed quest cannot be edited');

  console.log();

  // =========================================================================
  // [ F ] Client Security & Progression Manipulation Immunity
  // =========================================================================
  console.log('[ F ] Client Security & Progression Manipulation Immunity');

  // Create quest for manipulation test
  const manipQuestRes = await req('POST', '/quests', {
    title: 'Manipulation Test Quest',
    category: 'STRENGTH',
    difficulty: 'EASY', // Server authoritative: 50 XP, 20 Gold
  }, userA.token);
  const manipQuestId = manipQuestRes.body.quest.id;

  const userBeforeManip = (await req('GET', '/auth/me', undefined, userA.token)).body.user;

  // Attempt to complete with fake client values
  const maliciousPayload = {
    xpReward: 999999,
    goldReward: 888888,
    level: 99,
    streak: 500,
    longestStreak: 500,
    attributes: { strength: 999, intellect: 999 },
    userId: userB.userId, // Attempt to award rewards to user B
  };

  const manipCompleteRes = await req('POST', `/quests/${manipQuestId}/complete`, maliciousPayload, userA.token);
  assert(manipCompleteRes.status === 200, 'Completion succeeds while ignoring malicious payload');

  const manipData = manipCompleteRes.body;
  assert(manipData.progression.xpGained === 50, 'Authoritative 50 XP gained (not 999999)');
  assert(manipData.progression.goldGained === 20, 'Authoritative 20 Gold gained (not 888888)');
  assert(manipData.user.level !== 99, 'Level not inflated to 99');
  assert(manipData.user.streak !== 500, 'Streak not inflated to 500');

  // Verify user B received 0 rewards from user A's quest
  const userBProfile = (await req('GET', '/profile', undefined, userB.token)).body.profile;
  assert(userBProfile.xp === 0, 'User B received 0 XP from User A quest');
  assert(userBProfile.completedQuestCount === 0, 'User B completedQuestCount remains 0');

  console.log();

  // =========================================================================
  // [ G ] Reward Shop Edge Cases & Concurrent Purchase Protection
  // =========================================================================
  console.log('[ G ] Reward Shop Edge Cases & Concurrent Purchase Protection');

  // Ensure shop has items seeded
  await req('POST', '/rewards/seed');
  const shopRes = await req('GET', '/rewards');
  const items = shopRes.body.rewards;
  assert(items.length >= 3, 'Shop has seeded items available');

  const avatarItem = items.find((i) => i.name === 'Shadow Mage Avatar'); // Price: 500

  // 1. Purchase with malformed ID
  const malformedRewardRes = await req('POST', '/rewards/not_an_id/purchase', undefined, userA.token);
  assert(malformedRewardRes.status === 404, 'Purchase with malformed ObjectId returns 404');

  // 2. Purchase nonexistent reward ID
  const nonexistentRewardRes = await req('POST', '/rewards/507f1f77bcf86cd799439011/purchase', undefined, userA.token);
  assert(nonexistentRewardRes.status === 404, 'Purchase nonexistent reward ID returns 404');

  // 3. Purchase with insufficient gold (User B has 100 gold, item costs 500)
  const insufficientRes = await req('POST', `/rewards/${avatarItem.id}/purchase`, undefined, userB.token);
  assert(insufficientRes.status === 400, 'Purchase with insufficient Gold returns 400');
  assert(insufficientRes.body.message === 'Insufficient Gold', 'Message states "Insufficient Gold"');

  // Give user B sufficient gold by setting up a buyer user with enough gold
  // We complete quests or create a dedicated buyer
  const buyer = await registerAndLogin('Buyer');
  // Complete 5 EPIC quests (100 gold each) + 100 initial = 600 gold
  for (let i = 0; i < 5; i++) {
    const qRes = await req('POST', '/quests', { title: `Gold Quest ${i}`, category: 'INTELLECT', difficulty: 'EPIC' }, buyer.token);
    await req('POST', `/quests/${qRes.body.quest.id}/complete`, undefined, buyer.token);
  }
  const buyerState = (await req('GET', '/auth/me', undefined, buyer.token)).body.user;
  assert(buyerState.gold >= 500, `Buyer has ${buyerState.gold} gold (>= 500)`);

  // Rapid concurrent purchase test: send 3 simultaneous purchases of the same item
  const concurrentPurchases = Array.from({ length: 3 }, () =>
    req('POST', `/rewards/${avatarItem.id}/purchase`, undefined, buyer.token)
  );
  const purchaseResults = await Promise.all(concurrentPurchases);

  const purchaseSuccesses = purchaseResults.filter((r) => r.status === 200);
  const purchaseRejections = purchaseResults.filter((r) => r.status === 400);

  assert(purchaseSuccesses.length === 1, 'Exactly ONE concurrent purchase succeeds (200)');
  assert(purchaseRejections.length === 2, 'Remaining concurrent purchases are rejected (400)');

  // Verify inventory contains exactly 1 copy of the item
  const buyerInvRes = await req('GET', '/rewards/inventory', undefined, buyer.token);
  const shadowMageCopies = buyerInvRes.body.inventory.filter((inv) => inv.name === 'Shadow Mage Avatar');
  assert(shadowMageCopies.length === 1, 'Inventory contains exactly 1 copy of purchased item (no duplicates)');

  // Verify Gold was deducted exactly ONCE (600 - 500 = 100)
  const buyerAfterGold = (await req('GET', '/auth/me', undefined, buyer.token)).body.user.gold;
  assert(buyerAfterGold === buyerState.gold - 500, `Gold deducted exactly 500 (${buyerState.gold} -> ${buyerAfterGold})`);

  console.log();

  // =========================================================================
  // [ H ] Auth Registration & Login Edge Cases
  // =========================================================================
  console.log('[ H ] Auth Registration & Login Edge Cases');

  // Register with missing body
  const regNoBody = await req('POST', '/auth/register', {});
  assert(regNoBody.status === 400, 'Register with missing body returns 400');

  // Register with invalid email
  const regBadEmail = await req('POST', '/auth/register', { name: 'Hero', email: 'notanemail', password: 'Password123' });
  assert(regBadEmail.status === 400, 'Register with invalid email returns 400');

  // Register with password < 6 chars
  const regShortPass = await req('POST', '/auth/register', { name: 'Hero', email: 'valid@test.com', password: '123' });
  assert(regShortPass.status === 400, 'Register with password < 6 chars returns 400');

  // Register duplicate email
  const regDup = await req('POST', '/auth/register', { name: 'Hero', email: userA.email, password: 'Password123' });
  assert(regDup.status === 400, 'Register with existing email returns 400');

  // Login with wrong password
  const loginWrongPass = await req('POST', '/auth/login', { email: userA.email, password: 'WrongPassword999' });
  assert(loginWrongPass.status === 401, 'Login with wrong password returns 401');

  // Login with non-existent email
  const loginNoUser = await req('POST', '/auth/login', { email: 'nobody_exists_12345@lifequest.io', password: 'Password123' });
  assert(loginNoUser.status === 401, 'Login with non-existent email returns 401');

  // Login with missing password
  const loginNoPass = await req('POST', '/auth/login', { email: userA.email });
  assert(loginNoPass.status === 400, 'Login with missing password returns 400');

  console.log();

  // =========================================================================
  // [ I ] Database Health & Route Error Handling
  // =========================================================================
  console.log('[ I ] Database Health & Route Error Handling');

  const healthRes = await req('GET', '/health');
  assert(healthRes.status === 200, 'GET /api/health returns 200');
  assert(healthRes.body.success === true, 'Health check reports success: true');
  assert(healthRes.body.database.status === 'connected', 'Database status reports connected');
  assert(typeof healthRes.body.uptime === 'string', 'Health uptime is reported');

  const notFoundRes = await req('GET', '/nonexistent-endpoint-xyz');
  assert(notFoundRes.status === 404, 'Non-existent route returns 404');
  assert(notFoundRes.body.success === false, '404 response has success: false');
  assert(typeof notFoundRes.body.message === 'string', '404 response has structured message string');

  console.log();
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  Phase 10 Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10Tests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

/**
 * LifeQuest — Phase 5 Daily Streak System Integration & Unit Test Suite
 *
 * Tests:
 *  A. Streak Utility Math & Timezone Unit Tests (normalizeDateToDay, getDayDifference, calculateStreak)
 *  B. Milestone Detection Unit Tests (3, 7, 30 days)
 *  C. First Activity (new user -> streak=1, longest=1, lastActiveDate set)
 *  D. Same-Day Second Quest (streak remains 1, XP/Gold awarded, increased=false)
 *  E. Consecutive Day Activity (streak: 1 -> 2, longest: 1 -> 2)
 *  F. Missed Day Activity (diff > 1 -> streak resets to 1, longest preserved)
 *  G. Longest Streak Tracking Sequence (Day 1..4 -> longest=4; missed day -> streak=1, longest=4)
 *  H. All 5 Categories Work with Streak Logic
 *  I. Duplicate Quest Completion Protection (400, no second streak/XP/Gold increment)
 *  J. User Isolation (User B cannot complete User A quest, streaks unaffected)
 *  K. Client Payload Manipulation Protection (fake streak, longest, date ignored)
 *  L. 7-Day Activity History Endpoint (GET /api/quests/activity derives from MongoDB, user-isolated)
 *
 * Run: node <path-to-this-file>
 */

import {
  normalizeDateToDay,
  getDayDifference,
  calculateStreak,
  formatDateToUTCString,
} from '../utils/streak.js';

import {
  checkStreakMilestone,
} from '../utils/streakMilestones.js';

const BASE = 'http://localhost:5000/api';

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
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function registerAndLogin(suffix = '') {
  const email = `streak_user_${Date.now()}_${Math.floor(Math.random() * 100000)}${suffix}@lifequest.io`;
  const password = 'Password123!';
  const name = `StreakTester_${suffix}`;
  const regRes = await req('POST', '/auth/register', { name, email, password });
  const loginRes = await req('POST', '/auth/login', { email, password });
  return { token: loginRes.body.token, user: regRes.body.user };
}

async function createQuest(token, overrides = {}) {
  const defaults = { title: 'Test Quest', description: 'Desc', category: 'INTELLECT', difficulty: 'EASY' };
  const { body } = await req('POST', '/quests', { ...defaults, ...overrides }, token);
  return body.quest;
}

// ── A. Streak Utility Unit Tests ─────────────────────────────────────────────

function testStreakUnitMath() {
  console.log('\n[ A ] Streak Utility Unit Tests (UTC Calendar Day Calculation)');

  // UTC normalization
  const d1 = new Date('2026-09-12T09:00:00.000Z');
  const d2 = new Date('2026-09-12T23:59:59.000Z');
  const d3 = new Date('2026-09-13T00:01:00.000Z');

  assert(formatDateToUTCString(d1) === '2026-09-12', 'd1 formats to 2026-09-12');
  assert(formatDateToUTCString(d2) === '2026-09-12', 'd2 formats to 2026-09-12');
  assert(getDayDifference(d1, d2) === 0, 'Same UTC calendar day diff === 0');
  assert(getDayDifference(d2, d3) === 1, 'Consecutive UTC calendar day diff === 1');

  // Less than 24h across midnight is still consecutive calendar days
  const night1 = new Date('2026-09-12T23:30:00.000Z');
  const morn2 = new Date('2026-09-13T01:30:00.000Z');
  assert(getDayDifference(night1, morn2) === 1, '2 hours across midnight = diff 1 day');

  // calculateStreak behavior
  // 1. First activity (null date)
  const res1 = calculateStreak(null, d1, 0, 0);
  assert(res1.streak === 1 && res1.longestStreak === 1 && res1.streakUpdated === true,
    'First activity: streak=1, longest=1, streakUpdated=true');

  // 2. Same day activity (diff === 0)
  const res2 = calculateStreak(d1, d2, 1, 1);
  assert(res2.streak === 1 && res2.longestStreak === 1 && res2.streakUpdated === false,
    'Same day: streak=1, longest=1, streakUpdated=false');

  // 3. Consecutive day activity (diff === 1)
  const res3 = calculateStreak(d2, d3, 1, 1);
  assert(res3.streak === 2 && res3.longestStreak === 2 && res3.streakUpdated === true,
    'Consecutive day: streak=2, longest=2, streakUpdated=true');

  // 4. Missed day activity (diff > 1)
  const d5 = new Date('2026-09-15T10:00:00.000Z'); // 2 days missed after d3
  const res4 = calculateStreak(d3, d5, 5, 5);
  assert(res4.streak === 1 && res4.longestStreak === 5 && res4.streakUpdated === true,
    'Missed day: streak resets to 1, longest=5 preserved');
}

// ── B. Milestone Detection Unit Tests ────────────────────────────────────────

function testMilestoneUnit() {
  console.log('\n[ B ] Milestone Detection Unit Tests');
  assert(checkStreakMilestone(0, 1).unlocked === false, '0 -> 1: no milestone');
  assert(checkStreakMilestone(1, 2).unlocked === false, '1 -> 2: no milestone');

  const m3 = checkStreakMilestone(2, 3);
  assert(m3.unlocked === true && m3.days === 3, '2 -> 3: 3-day milestone unlocked');

  assert(checkStreakMilestone(3, 4).unlocked === false, '3 -> 4: no duplicate 3-day milestone');
  assert(checkStreakMilestone(3, 3).unlocked === false, '3 -> 3 (same day): no milestone');

  const m7 = checkStreakMilestone(6, 7);
  assert(m7.unlocked === true && m7.days === 7, '6 -> 7: 7-day milestone unlocked');
  assert(checkStreakMilestone(7, 8).unlocked === false, '7 -> 8: no duplicate 7-day milestone');

  const m30 = checkStreakMilestone(29, 30);
  assert(m30.unlocked === true && m30.days === 30, '29 -> 30: 30-day milestone unlocked');
}

// ── C. First Activity (New User) ─────────────────────────────────────────────

async function testFirstActivity() {
  console.log('\n[ C ] First Activity (New User)');
  const { token, user } = await registerAndLogin('_c');
  assert(user.streak === 0 && user.longestStreak === 0 && user.lastActiveDate === null,
    'New user initial state: streak=0, longest=0, lastActiveDate=null');

  const quest = await createQuest(token);
  const { status, body } = await req('POST', `/quests/${quest.id}/complete`, {}, token);

  assert(status === 200, 'Complete first quest -> 200');
  assert(body.streak?.current === 1, `streak.current = 1 (got ${body.streak?.current})`);
  assert(body.streak?.longest === 1, `streak.longest = 1 (got ${body.streak?.longest})`);
  assert(body.streak?.increased === true, 'streak.increased = true');
  assert(body.streak?.lastActiveDate != null, 'streak.lastActiveDate populated');
  assert(body.user?.streak === 1, 'user.streak = 1');
  assert(body.user?.longestStreak === 1, 'user.longestStreak = 1');
}

// ── D. Same-Day Second Quest ─────────────────────────────────────────────────

async function testSameDaySecondQuest() {
  console.log('\n[ D ] Same-Day Second Quest');
  const { token } = await registerAndLogin('_d');

  const q1 = await createQuest(token, { difficulty: 'EASY' });
  const q2 = await createQuest(token, { difficulty: 'MEDIUM' });

  // First completion today
  const r1 = await req('POST', `/quests/${q1.id}/complete`, {}, token);
  assert(r1.body.streak?.current === 1, 'First quest: streak = 1');
  assert(r1.body.streak?.increased === true, 'First quest: streak.increased = true');

  // Second completion today
  const r2 = await req('POST', `/quests/${q2.id}/complete`, {}, token);
  assert(r2.status === 200, 'Second quest completion -> 200');
  assert(r2.body.streak?.current === 1, `Second quest on same day: streak remains 1 (got ${r2.body.streak?.current})`);
  assert(r2.body.streak?.longest === 1, 'longestStreak remains 1');
  assert(r2.body.streak?.increased === false, 'streak.increased = false on same-day completion');
  assert(r2.body.progression?.xpGained === 100, 'XP still awarded for second quest (100 XP)');
  assert(r2.body.user?.xp === 150, 'Total user XP = 150 (50 + 100)');
}

// ── E. Consecutive Day Activity & F. Missed Day ──────────────────────────────

async function testConsecutiveAndMissedDay() {
  console.log('\n[ E & F ] Consecutive Day & Missed Day Logic');
  const { token } = await registerAndLogin('_ef');

  // Simulate user was active yesterday via internal test route
  const now = new Date();
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 12, 0, 0));
  await req('PATCH', '/auth/test-set-streak', {
    streak: 1,
    longestStreak: 1,
    lastActiveDate: yesterday.toISOString(),
  }, token);

  // Complete quest today -> consecutive day -> streak becomes 2
  const q1 = await createQuest(token);
  const r1 = await req('POST', `/quests/${q1.id}/complete`, {}, token);
  assert(r1.body.streak?.current === 2, `Consecutive day: streak = 2 (got ${r1.body.streak?.current})`);
  assert(r1.body.streak?.longest === 2, `longestStreak = 2 (got ${r1.body.streak?.longest})`);
  assert(r1.body.streak?.increased === true, 'streak.increased = true');

  // Simulate user was active 3 days ago (missed days) with streak=5, longest=5
  const threeDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3, 12, 0, 0));
  await req('PATCH', '/auth/test-set-streak', {
    streak: 5,
    longestStreak: 5,
    lastActiveDate: threeDaysAgo.toISOString(),
  }, token);

  // Complete quest today after missing days -> resets to 1, longest preserved at 5
  const q2 = await createQuest(token);
  const r2 = await req('POST', `/quests/${q2.id}/complete`, {}, token);
  assert(r2.body.streak?.current === 1, `Missed days: streak resets to 1 (got ${r2.body.streak?.current})`);
  assert(r2.body.streak?.longest === 5, `longestStreak preserved at 5 (got ${r2.body.streak?.longest})`);
}

// ── G. Longest Streak Tracking Sequence ──────────────────────────────────────

async function testLongestStreakSequence() {
  console.log('\n[ G ] Longest Streak Sequence');
  const { token } = await registerAndLogin('_g');
  const now = new Date();

  // Simulate Day 4 of a 4-day streak
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  await req('PATCH', '/auth/test-set-streak', {
    streak: 3,
    longestStreak: 3,
    lastActiveDate: yesterday.toISOString(),
  }, token);

  // Day 4 completion
  const q1 = await createQuest(token);
  const r1 = await req('POST', `/quests/${q1.id}/complete`, {}, token);
  assert(r1.body.streak?.current === 4, 'Day 4: streak = 4');
  assert(r1.body.streak?.longest === 4, 'Day 4: longest = 4');

  // Now simulate missed day
  const twoDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));
  await req('PATCH', '/auth/test-set-streak', {
    streak: 4,
    longestStreak: 4,
    lastActiveDate: twoDaysAgo.toISOString(),
  }, token);

  // Next activity: streak resets to 1, longest remains 4
  const q2 = await createQuest(token);
  const r2 = await req('POST', `/quests/${q2.id}/complete`, {}, token);
  assert(r2.body.streak?.current === 1, 'Post-miss: streak = 1');
  assert(r2.body.streak?.longest === 4, 'Post-miss: longest remains 4');
}

// ── H. All Categories Work with Streak ───────────────────────────────────────

async function testAllCategories() {
  console.log('\n[ H ] All Categories Work with Streak');
  const categories = ['INTELLECT', 'STRENGTH', 'VITALITY', 'CREATIVITY', 'DISCIPLINE'];

  for (const cat of categories) {
    const { token } = await registerAndLogin(`_h_${cat.toLowerCase()}`);
    const q = await createQuest(token, { category: cat });
    const { body } = await req('POST', `/quests/${q.id}/complete`, {}, token);
    assert(body.streak?.current === 1, `${cat} quest creates streak = 1`);
  }
}

// ── I. Duplicate Completion Protection ───────────────────────────────────────

async function testDuplicateCompletionProtection() {
  console.log('\n[ I ] Duplicate Completion Protection');
  const { token } = await registerAndLogin('_i');
  const q = await createQuest(token);

  const r1 = await req('POST', `/quests/${q.id}/complete`, {}, token);
  assert(r1.status === 200, 'First complete -> 200');
  const initialXP = r1.body.user.xp;
  const initialStreak = r1.body.user.streak;

  const r2 = await req('POST', `/quests/${q.id}/complete`, {}, token);
  assert(r2.status === 400, 'Duplicate complete -> 400 Bad Request');

  // Verify user in DB is completely unchanged
  const { body: meBody } = await req('GET', '/auth/me', null, token);
  assert(meBody.user.xp === initialXP, 'User XP unchanged after duplicate attempt');
  assert(meBody.user.streak === initialStreak, 'User streak unchanged after duplicate attempt');
}

// ── J. User Isolation ────────────────────────────────────────────────────────

async function testUserIsolation() {
  console.log('\n[ J ] User Isolation');
  const userA = await registerAndLogin('_ja');
  const userB = await registerAndLogin('_jb');

  const qA = await createQuest(userA.token);

  // User B tries to complete User A's quest
  const { status } = await req('POST', `/quests/${qA.id}/complete`, {}, userB.token);
  assert(status === 404, 'User B completing User A quest -> 404 Not Found');

  // Verify User A's streak is still 0
  const meA = await req('GET', '/auth/me', null, userA.token);
  assert(meA.body.user.streak === 0, 'User A streak unaffected by User B');
}

// ── K. Client Payload Manipulation Protection ───────────────────────────────

async function testClientPayloadManipulation() {
  console.log('\n[ K ] Client Payload Manipulation Protection');
  const { token } = await registerAndLogin('_k');
  const q = await createQuest(token);

  const { status, body } = await req('POST', `/quests/${q.id}/complete`, {
    streak: 999,
    longestStreak: 999,
    lastActiveDate: '2099-01-01',
    milestone: { unlocked: true, days: 100 },
  }, token);

  assert(status === 200, 'Completion with fake payload -> 200');
  assert(body.streak?.current === 1, `Fake streak 999 ignored -> real streak=1 (got ${body.streak?.current})`);
  assert(body.streak?.longest === 1, `Fake longest 999 ignored -> real longest=1 (got ${body.streak?.longest})`);
  assert(body.milestone?.unlocked === false, 'Fake milestone ignored -> unlocked=false');
}

// ── L. 7-Day Activity History Endpoint ───────────────────────────────────────

async function testActivityHistoryEndpoint() {
  console.log('\n[ L ] 7-Day Activity History Endpoint (GET /api/quests/activity)');
  const { token } = await registerAndLogin('_l');

  // Query initially (no completed quests)
  const r0 = await req('GET', '/quests/activity', null, token);
  assert(r0.status === 200, 'GET /api/quests/activity -> 200');
  assert(Array.isArray(r0.body.activity) && r0.body.activity.length === 7, 'Returns 7-day array');
  const completedCount0 = r0.body.activity.filter((d) => d.completed).length;
  assert(completedCount0 === 0, 'Initial activity: 0 completed days');

  // Complete a quest today
  const q = await createQuest(token);
  await req('POST', `/quests/${q.id}/complete`, {}, token);

  // Query again
  const r1 = await req('GET', '/quests/activity', null, token);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = r1.body.activity.find((d) => d.date === todayStr);
  assert(todayActivity?.completed === true, 'Today is marked as completed: true after quest completion');

  // User B query -> must be isolated (0 completed days)
  const userB = await registerAndLogin('_l_b');
  const rB = await req('GET', '/quests/activity', null, userB.token);
  const completedCountB = rB.body.activity.filter((d) => d.completed).length;
  assert(completedCountB === 0, 'User B activity is isolated: 0 completed days');
}

// ── Main Runner ──────────────────────────────────────────────────────────────

(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' LIFEQUEST — Phase 5 Daily Streak System Test Suite   ');
  console.log('═══════════════════════════════════════════════════════');

  try {
    const health = await req('GET', '/health');
    if (health.status !== 200) throw new Error('unhealthy');
    console.log('✅ Server is running\n');
  } catch {
    console.error('❌ Server not responding at http://localhost:5000');
    process.exit(1);
  }

  testStreakUnitMath();
  testMilestoneUnit();
  await testFirstActivity();
  await testSameDaySecondQuest();
  await testConsecutiveAndMissedDay();
  await testLongestStreakSequence();
  await testAllCategories();
  await testDuplicateCompletionProtection();
  await testUserIsolation();
  await testClientPayloadManipulation();
  await testActivityHistoryEndpoint();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
  process.exit(0);
})();

/**
 * LifeQuest — Phase 7 Character Profile & Achievement Test Suite
 *
 * Test Groups:
 *  A. Achievement Definitions — GET /api/achievements returns 6 canonical achievements
 *  B. Profile API — GET /api/profile returns complete safe character data
 *  C. FIRST_QUEST Achievement — unlocks upon first completed quest
 *  D. Duplicate Protection — achievement unlocks only once, never re-granted
 *  E. COMPLETE_10_QUESTS Achievement — unlocks upon 10 completed quests (authoritative MongoDB count)
 *  F. SEVEN_DAY_STREAK Achievement — unlocks when streak reaches 7
 *  G. LEVEL_5 Achievement — unlocks when level reaches 5
 *  H. EARN_1000_XP Achievement — unlocks when lifetime XP reaches 1000
 *  I. EARN_1000_GOLD Achievement — unlocks when totalGoldEarned reaches 1000 (unaffected by shop spend)
 *  J. Avatar Resolution — default RPG avatar vs owned AVATAR reward item
 *  K. User Isolation — User A cannot access User B profile or achievements
 *  L. Security & Client Manipulation Immunity — client cannot inject achievements or fake stats
 *  M. Unauthenticated Access — 401 on protected endpoints
 *  N. MongoDB Persistence — state persists across separate queries (simulated reload/relogin)
 *
 * Run: node server/tests/testPhase7.js
 */

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
  const email = `phase7_user_${Date.now()}_${Math.floor(Math.random() * 100000)}${suffix}@lifequest.io`;
  const password = 'Password123!';
  const name = `Hero_${suffix}`;
  await req('POST', '/auth/register', { name, email, password });
  const loginRes = await req('POST', '/auth/login', { email, password });
  return { token: loginRes.body.token, userId: loginRes.body.user?._id, email, name };
}

async function createAndCompleteQuest(token, title = 'Test Quest', difficulty = 'EASY') {
  const createRes = await req('POST', '/quests', {
    title,
    category: 'DISCIPLINE',
    difficulty,
  }, token);
  const questId = createRes.body.quest?._id;
  const completeRes = await req('POST', `/quests/${questId}/complete`, {}, token);
  return { questId, completeRes };
}

// ── A. Achievement Definitions ────────────────────────────────────────────────

async function testAchievementDefinitions() {
  console.log('\n[ A ] Achievement Definitions — GET /api/achievements');

  const { token } = await registerAndLogin('_defs');
  const { status, body } = await req('GET', '/achievements', null, token);

  assert(status === 200, 'GET /achievements returns 200', `got ${status}`);
  assert(body.success === true, 'body.success is true');
  assert(body.count === 6, `Returns exactly 6 canonical achievements`, `got ${body.count}`);

  const ids = body.achievements.map((a) => a.id);
  const expected = [
    'FIRST_QUEST',
    'COMPLETE_10_QUESTS',
    'SEVEN_DAY_STREAK',
    'LEVEL_5',
    'EARN_1000_XP',
    'EARN_1000_GOLD',
  ];

  for (const expId of expected) {
    assert(ids.includes(expId), `Contains canonical achievement: "${expId}"`);
  }

  // Verify fields on an achievement object
  const first = body.achievements.find((a) => a.id === 'FIRST_QUEST');
  assert(first.name === 'First Quest', 'Name is "First Quest"');
  assert(first.description != null, 'Description is populated');
  assert(first.icon != null, 'Icon is populated');
  assert(first.rarity === 'COMMON', 'Rarity is COMMON');
  assert(first.unlocked === false, 'Initially locked for brand new user');
  assert(first.unlockedAt === null, 'unlockedAt is null initially');
}

// ── B. Profile API ────────────────────────────────────────────────────────────

async function testProfileAPI() {
  console.log('\n[ B ] Profile API — GET /api/profile');

  const { token, name, email } = await registerAndLogin('_prof');
  const { status, body } = await req('GET', '/profile', null, token);

  assert(status === 200, 'GET /profile returns 200', `got ${status}`);
  assert(body.success === true, 'body.success is true');

  const p = body.profile;
  assert(p != null, 'Profile object is present');
  assert(p.name === name, 'Profile name matches authenticated user');
  assert(p.email === email, 'Profile email matches authenticated user');
  assert(p.level === 1, 'Initial level is 1');
  assert(p.xp === 0, 'Initial XP is 0');
  assert(p.gold === 100, 'Initial Gold is 100');
  assert(p.totalGoldEarned === 0, 'Initial totalGoldEarned is 0');
  assert(p.streak === 0, 'Initial streak is 0');
  assert(p.longestStreak === 0, 'Initial longestStreak is 0');
  assert(p.attributes != null && p.attributes.intellect === 1, 'Attributes populated');
  assert(p.password === undefined, 'Password hash is NOT exposed');
  assert(Array.isArray(p.inventory), 'Inventory is an array');
  assert(Array.isArray(p.achievements), 'Achievements is an array');
  assert(p.achievements.length === 6, 'Contains all 6 achievements with status');
  assert(p.achievementStats?.unlockedCount === 0, '0 unlocked achievements initially');
  assert(p.avatar != null && p.avatar.name === 'Novice Adventurer', 'Default avatar assigned');
}

// ── C. FIRST_QUEST Achievement ────────────────────────────────────────────────

async function testFirstQuestAchievement() {
  console.log('\n[ C ] FIRST_QUEST Achievement — Unlock upon completing first quest');

  const { token } = await registerAndLogin('_firstq');
  const { completeRes } = await createAndCompleteQuest(token, 'First Heroic Feat');

  assert(completeRes.status === 200, 'Quest completion succeeds (200)');
  const newlyUnlocked = completeRes.body.unlockedAchievements;
  assert(Array.isArray(newlyUnlocked), 'unlockedAchievements array returned');
  assert(newlyUnlocked.some((a) => a.id === 'FIRST_QUEST'), 'FIRST_QUEST is in unlockedAchievements');

  // Check Profile
  const profRes = await req('GET', '/profile', null, token);
  const firstQ = profRes.body.profile?.achievements?.find((a) => a.id === 'FIRST_QUEST');
  assert(firstQ?.unlocked === true, 'FIRST_QUEST is unlocked in profile');
  assert(firstQ?.unlockedAt != null, 'unlockedAt timestamp is populated');
}

// ── D. Duplicate Protection ───────────────────────────────────────────────────

async function testDuplicateProtection() {
  console.log('\n[ D ] Duplicate Protection — Achievement unlocked only once');

  const { token } = await registerAndLogin('_dupach');

  // Complete quest 1 (unlocks FIRST_QUEST)
  const q1 = await createAndCompleteQuest(token, 'Quest One');
  assert(
    q1.completeRes.body.unlockedAchievements?.some((a) => a.id === 'FIRST_QUEST'),
    'Quest 1 unlocks FIRST_QUEST'
  );

  // Complete quest 2 (should NOT re-unlock FIRST_QUEST)
  const q2 = await createAndCompleteQuest(token, 'Quest Two');
  assert(
    !q2.completeRes.body.unlockedAchievements?.some((a) => a.id === 'FIRST_QUEST'),
    'Quest 2 does NOT re-unlock FIRST_QUEST in unlockedAchievements'
  );

  // Check profile achievements array: should have exactly 1 record of FIRST_QUEST
  const profRes = await req('GET', '/profile', null, token);
  const userRecord = await req('GET', '/auth/me', null, token);
  const rawAchievements = userRecord.body.user?.achievements || [];
  const firstQCount = rawAchievements.filter((a) => a.achievementId === 'FIRST_QUEST').length;
  assert(firstQCount === 1, 'MongoDB User document contains exactly 1 FIRST_QUEST entry (no duplicate rows)', `got ${firstQCount}`);
}

// ── E. COMPLETE_10_QUESTS Achievement ─────────────────────────────────────────

async function testComplete10Quests() {
  console.log('\n[ E ] COMPLETE_10_QUESTS Achievement — 10 Authoritative MongoDB Quests');

  const { token } = await registerAndLogin('_10q');

  // Complete 9 quests
  for (let i = 1; i <= 9; i++) {
    const res = await createAndCompleteQuest(token, `Quest ${i}`);
    assert(
      !res.completeRes.body.unlockedAchievements?.some((a) => a.id === 'COMPLETE_10_QUESTS'),
      `Quest ${i} does not unlock COMPLETE_10_QUESTS (<10)`
    );
  }

  // Complete 10th quest
  const q10 = await createAndCompleteQuest(token, 'Quest 10 Milestone');
  const unlocked = q10.completeRes.body.unlockedAchievements || [];
  assert(
    unlocked.some((a) => a.id === 'COMPLETE_10_QUESTS'),
    'Quest 10 unlocks COMPLETE_10_QUESTS achievement!'
  );

  const prof = await req('GET', '/profile', null, token);
  assert(prof.body.profile?.completedQuestCount === 10, 'completedQuestCount in profile is 10');
}

// ── F. SEVEN_DAY_STREAK Achievement ───────────────────────────────────────────

async function testSevenDayStreak() {
  console.log('\n[ F ] SEVEN_DAY_STREAK Achievement — Streak >= 7');

  const { token } = await registerAndLogin('_streak7');

  // 1. Verify historical longestStreak alone (e.g. longestStreak=10, current streak=1) CANNOT unlock SEVEN_DAY_STREAK
  await req('PATCH', '/auth/test-set-profile', { streak: 1, longestStreak: 10 }, token);
  const qHist = await createAndCompleteQuest(token, 'Historical Streak Test');
  assert(
    !qHist.completeRes.body.unlockedAchievements?.some((a) => a.id === 'SEVEN_DAY_STREAK'),
    'Historical longestStreak=10 with current streak=1 does NOT unlock SEVEN_DAY_STREAK'
  );

  // 2. Reach streak 7 -> unlocks SEVEN_DAY_STREAK
  await req('PATCH', '/auth/test-set-profile', { streak: 7, longestStreak: 7 }, token);
  const { completeRes } = await createAndCompleteQuest(token, 'Streak 7 Quest');

  assert(
    completeRes.body.unlockedAchievements?.some((a) => a.id === 'SEVEN_DAY_STREAK'),
    'Current streak >= 7 unlocks SEVEN_DAY_STREAK achievement'
  );

  // 3. Verify that if streak later decreases (e.g. to 1), SEVEN_DAY_STREAK remains permanently unlocked
  await req('PATCH', '/auth/test-set-profile', { streak: 1 }, token);
  const profAfterReset = await req('GET', '/profile', null, token);
  const ach = profAfterReset.body.profile?.achievements?.find((a) => a.id === 'SEVEN_DAY_STREAK');
  assert(ach?.unlocked === true, 'SEVEN_DAY_STREAK remains permanently unlocked even if current streak decreases');
}

// ── G. LEVEL_5 Achievement ────────────────────────────────────────────────────

async function testLevel5Achievement() {
  console.log('\n[ G ] LEVEL_5 Achievement — Level >= 5');

  const { token } = await registerAndLogin('_lvl5');

  // Set user stats to level 5 (via test helper)
  await req('PATCH', '/auth/test-set-profile', { level: 5, xp: 850 }, token);
  const { completeRes } = await createAndCompleteQuest(token, 'Heroic Quest');

  assert(
    completeRes.body.unlockedAchievements?.some((a) => a.id === 'LEVEL_5'),
    'Level 5 unlocks LEVEL_5 achievement'
  );
}

// ── H. EARN_1000_XP Achievement ───────────────────────────────────────────────

async function testEarn1000XPAchievement() {
  console.log('\n[ H ] EARN_1000_XP Achievement — Lifetime XP >= 1000');

  const { token } = await registerAndLogin('_xp1000');

  // Set XP to 980, then complete EASY quest (50 XP) -> total 1030 XP
  await req('PATCH', '/auth/test-set-profile', { xp: 980 }, token);
  const { completeRes } = await createAndCompleteQuest(token, 'Final Push', 'EASY');

  assert(completeRes.body.progression?.totalXP >= 1000, 'Total XP >= 1000');
  assert(
    completeRes.body.unlockedAchievements?.some((a) => a.id === 'EARN_1000_XP'),
    'Crossing 1000 XP unlocks EARN_1000_XP achievement'
  );
}

// ── I. EARN_1000_GOLD Achievement & Shop Independence ─────────────────────────

async function testEarn1000GoldAchievement() {
  console.log('\n[ I ] EARN_1000_GOLD — Lifetime totalGoldEarned unaffected by shop spending');

  const { token } = await registerAndLogin('_gold1000');

  // Set totalGoldEarned to 980, complete EASY quest (+20G) -> totalGoldEarned reaches 1000
  await req('PATCH', '/auth/test-set-profile', { totalGoldEarned: 980 }, token);
  const { completeRes } = await createAndCompleteQuest(token, 'Treasure Hunt', 'EASY');

  assert(
    completeRes.body.unlockedAchievements?.some((a) => a.id === 'EARN_1000_GOLD'),
    'totalGoldEarned 1000 unlocks EARN_1000_GOLD achievement'
  );

  // Now seed reward shop and spend Gold
  await req('POST', '/rewards/seed');
  const shopRes = await req('GET', '/rewards');
  const avatarItem = shopRes.body.rewards?.find((r) => r.type === 'AVATAR');

  if (avatarItem) {
    // Give user spendable gold and buy
    await req('PATCH', '/auth/test-set-gold', { gold: 600 }, token);
    await req('POST', `/rewards/${avatarItem._id}/purchase`, {}, token);

    // Spendable gold decreased from 600 to 100, but totalGoldEarned must NOT decrease
    const profRes = await req('GET', '/profile', null, token);
    assert(profRes.body.profile?.gold === 100, 'Current spendable Gold decreased to 100');
    assert(profRes.body.profile?.totalGoldEarned >= 1000, 'Lifetime totalGoldEarned remains >= 1000 (unaffected by shop spend)');

    const goldAch = profRes.body.profile?.achievements?.find((a) => a.id === 'EARN_1000_GOLD');
    assert(goldAch?.unlocked === true, 'EARN_1000_GOLD achievement remains UNLOCKED despite spending Gold');
  }
}

// ── J. Avatar Resolution ──────────────────────────────────────────────────────

async function testAvatarResolution() {
  console.log('\n[ J ] Avatar Resolution — Default vs Owned AVATAR reward');

  const { token } = await registerAndLogin('_avatar');

  // Brand new user -> default avatar
  const prof1 = await req('GET', '/profile', null, token);
  assert(prof1.body.profile?.avatar?.name === 'Novice Adventurer', 'Default avatar is "Novice Adventurer"');
  assert(prof1.body.profile?.avatar?.isCustom === false, 'isCustom is false for default avatar');

  // Purchase Shadow Mage Avatar (AVATAR reward)
  await req('POST', '/rewards/seed');
  const shopRes = await req('GET', '/rewards');
  const avatarItem = shopRes.body.rewards?.find((r) => r.type === 'AVATAR');

  if (avatarItem) {
    await req('PATCH', '/auth/test-set-gold', { gold: 1000 }, token);
    await req('POST', `/rewards/${avatarItem._id}/purchase`, {}, token);

    // Profile should now reflect the owned avatar
    const prof2 = await req('GET', '/profile', null, token);
    assert(prof2.body.profile?.avatar?.name === 'Shadow Mage Avatar', 'Profile avatar updated to "Shadow Mage Avatar"');
    assert(prof2.body.profile?.avatar?.isCustom === true, 'isCustom is true for owned reward avatar');
    assert(prof2.body.profile?.avatar?.rarity === 'EPIC', 'Avatar rarity reflects EPIC reward');
  }
}

// ── K. User Isolation ─────────────────────────────────────────────────────────

async function testUserIsolation() {
  console.log('\n[ K ] User Isolation — Profiles and Achievements isolated per user');

  const userA = await registerAndLogin('_isoA');
  const userB = await registerAndLogin('_isoB');

  // User A completes a quest
  await createAndCompleteQuest(userA.token, 'A Quest');

  // User A has 1 completed quest and FIRST_QUEST unlocked
  const profA = await req('GET', '/profile', null, userA.token);
  assert(profA.body.profile?.completedQuestCount === 1, 'User A completedQuestCount = 1');
  assert(
    profA.body.profile?.achievements?.find((a) => a.id === 'FIRST_QUEST')?.unlocked === true,
    'User A has FIRST_QUEST unlocked'
  );

  // User B has 0 completed quests and FIRST_QUEST locked
  const profB = await req('GET', '/profile', null, userB.token);
  assert(profB.body.profile?.completedQuestCount === 0, 'User B completedQuestCount = 0');
  assert(
    profB.body.profile?.achievements?.find((a) => a.id === 'FIRST_QUEST')?.unlocked === false,
    'User B has FIRST_QUEST LOCKED'
  );
}

// ── L. Security & Client Manipulation Immunity ────────────────────────────────

async function testSecurityAndManipulationImmunity() {
  console.log('\n[ L ] Security & Manipulation Immunity — Client cannot inject achievements');

  const { token } = await registerAndLogin('_sec');
  const quest = await req('POST', '/quests', { title: 'Hack Attempt', category: 'DISCIPLINE', difficulty: 'EASY' }, token);
  const questId = quest.body.quest?._id;

  // Client tries to inject fake achievements and fake stats in complete body
  const { status, body } = await req('POST', `/quests/${questId}/complete`, {
    achievements: [{ achievementId: 'LEVEL_5' }],
    unlockedAchievements: ['LEVEL_5', 'EARN_1000_XP'],
    level: 99,
    xp: 99999,
    gold: 99999,
  }, token);

  assert(status === 200, 'Completion returns 200');
  // Only FIRST_QUEST should unlock from actually completing this first quest
  const unlocked = body.unlockedAchievements || [];
  assert(unlocked.some((a) => a.id === 'FIRST_QUEST'), 'Legitimate FIRST_QUEST is unlocked');
  assert(!unlocked.some((a) => a.id === 'LEVEL_5'), 'Client-injected LEVEL_5 is NOT unlocked');
  assert(!unlocked.some((a) => a.id === 'EARN_1000_XP'), 'Client-injected EARN_1000_XP is NOT unlocked');

  // Verify profile only has FIRST_QUEST
  const prof = await req('GET', '/profile', null, token);
  const lvl5 = prof.body.profile?.achievements?.find((a) => a.id === 'LEVEL_5');
  assert(lvl5?.unlocked === false, 'LEVEL_5 remains LOCKED in profile');
}

// ── M. Unauthenticated Access ─────────────────────────────────────────────────

async function testUnauthenticatedAccess() {
  console.log('\n[ M ] Unauthenticated Access — 401 on protected endpoints');

  const { status: s1 } = await req('GET', '/profile', null, null);
  assert(s1 === 401, 'GET /api/profile without token returns 401', `got ${s1}`);

  const { status: s2 } = await req('GET', '/achievements', null, null);
  assert(s2 === 401, 'GET /api/achievements without token returns 401', `got ${s2}`);
}

// ── N. Persistence Across Queries ─────────────────────────────────────────────

async function testPersistenceAcrossQueries() {
  console.log('\n[ N ] MongoDB Persistence — Data survives multiple queries/simulated reload');

  const { token, email } = await registerAndLogin('_persist');
  await createAndCompleteQuest(token, 'Persistent Quest');

  // Simulate logout and re-login
  const relogin = await req('POST', '/auth/login', { email, password: 'Password123!' });
  assert(relogin.status === 200, 'Re-login succeeds');
  const freshToken = relogin.body.token;

  // Query profile with fresh token
  const freshProf = await req('GET', '/profile', null, freshToken);
  assert(freshProf.status === 200, 'Profile accessible with fresh token');
  assert(freshProf.body.profile?.completedQuestCount === 1, 'completedQuestCount persisted');
  assert(
    freshProf.body.profile?.achievements?.find((a) => a.id === 'FIRST_QUEST')?.unlocked === true,
    'FIRST_QUEST persists unlocked in MongoDB after re-login'
  );
}

// ── Main Runner ────────────────────────────────────────────────────────────────

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  LifeQuest Phase 7 — Character Profile & Achievements Test');
  console.log('══════════════════════════════════════════════════════════════');

  try {
    await testAchievementDefinitions();
    await testProfileAPI();
    await testFirstQuestAchievement();
    await testDuplicateProtection();
    await testComplete10Quests();
    await testSevenDayStreak();
    await testLevel5Achievement();
    await testEarn1000XPAchievement();
    await testEarn1000GoldAchievement();
    await testAvatarResolution();
    await testUserIsolation();
    await testSecurityAndManipulationImmunity();
    await testUnauthenticatedAccess();
    await testPersistenceAcrossQueries();
  } catch (err) {
    console.error('\n💥 Fatal test error:', err);
    failed++;
  }

  const total = passed + failed;
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

main();

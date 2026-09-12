# LifeQuest

> **Turn your everyday goals into a game.**

LifeQuest is a gamified productivity web application where real-world goals transform into RPG-style quests. Completing daily tasks earns experience points (XP) and Gold, levels up character attributes, maintains active daily streaks, and unlocks virtual shop rewards and achievements.

---

## Problem

- **Repetitive Routines**: Everyday habits and chores often feel uninspiring and tedious.
- **Motivation & Consistency Deficit**: Individuals frequently struggle to maintain daily habits without engaging positive reinforcement.
- **Flat Task Lists**: Traditional to-do apps provide static checkboxes with no rewarding feedback loops or sense of personal advancement.
- **Lack of Visible Progression**: Without measurable milestones and character growth, long-term personal development feels abstract and disconnected.

---

## Solution

LifeQuest transforms routine task completion into a server-authoritative RPG progression cycle:

```text
Real-life Goal
      ↓
    Quest
      ↓
   Complete
      ↓
 XP + Gold
      ↓
 Attribute Boost (+5)
      ↓
 Level Progression
      ↓
 Daily Streak
      ↓
 Achievements
      ↓
 Rewards / Inventory
```

Every real-world achievement builds your character, reinforces consistency through daily streaks, and rewards focus with collectible shop gear.

---

## Key Features

- **Secure JWT Authentication**: User registration and login with bcryptjs password hashing and stateless token verification.
- **Quest Creation & Management**: Dynamic task management supporting categories, difficulty levels, descriptions, and optional due dates.
- **Difficulty-Based Rewards**: Tiered XP and Gold payouts calibrated to task complexity.
- **5-Category RPG Attributes**: Every quest enhances a specific life attribute (**Intellect**, **Strength**, **Vitality**, **Creativity**, or **Discipline**) by +5.
- **Level Progression Engine**: Quadratic XP threshold progression curve calculated strictly server-side.
- **Daily Streak System**: UTC calendar-day tracking with milestone recognition (3, 7, and 30 days) and longest-streak retention.
- **Canonical Achievements Engine**: Six milestone achievements evaluated and unlocked automatically upon reaching gameplay thresholds.
- **Reward Shop & Inventory**: Spend earned Gold on collectible in-game items (Avatars, Themes, Badges) with atomic duplicate prevention.
- **Character Profile**: Comprehensive player sheet tracking lifetime XP, attributes, active custom avatar, owned inventory, and unlocked achievements.
- **Server-Authoritative Progression**: All mathematical formulas, rewards, streaks, and achievements are validated and executed by the backend.
- **MongoDB Persistence**: Exclusive source of truth across all sessions, reloads, and devices.
- **Responsive & Accessible UI**: Atmospheric dark RPG aesthetic optimized for mobile, tablet, and desktop viewports, with accessibility improvements targeting WCAG 2.1 AA guidelines.
- **Fault-Tolerant Feedback**: In-flight action locks, skeleton loaders, error boundaries, empty states, and structured retry triggers.

---

## RPG System

### Quest Reward Mapping

All rewards are strictly calculated by the backend API:

| Difficulty | Base XP Reward | Base Gold Reward |
| :--- | :---: | :---: |
| **Easy** | 50 XP | 20 Gold |
| **Medium** | 100 XP | 40 Gold |
| **Hard** | 150 XP | 60 Gold |
| **Epic** | 250 XP | 100 Gold |

### Character Attributes

Every quest belongs to a specific life domain that increases the corresponding attribute by **+5**:

- 🧠 **Intellect**: Academic studies, coding, reading, problem solving, analysis.
- ⚔️ **Strength**: Physical workouts, resistance training, athletics.
- 💖 **Vitality**: Health, hydration, sleep hygiene, nutrition, mindfulness.
- 🎨 **Creativity**: Writing, design, music, art, brainstorming.
- 🛡️ **Discipline**: Habit formation, waking early, chores, organization.

---

## Level System

LifeQuest calculates character level strictly on the backend using lifetime accumulated XP:

$$\text{Threshold}(\text{Level}) = \lfloor 100 \times \text{Level}^{1.5} \rfloor$$

### Verified Level Thresholds

| Level | XP Range | Threshold to Next Level |
| :---: | :---: | :---: |
| **Level 1** | 0 – 99 XP | 100 XP |
| **Level 2** | 100 – 282 XP | 283 XP |
| **Level 3** | 283 – 519 XP | 520 XP |
| **Level 4** | 520 – 799 XP | 800 XP |
| **Level 5+** | 800+ XP | Calculated dynamically |

*Client attempts to forge or inject XP or Level values are rejected.*

---

## Streak System

LifeQuest tracks daily consistency using UTC calendar-day boundaries:

- **First Activity**: Completing your first quest initializes the streak at **1**.
- **Consecutive Day**: Completing a quest on the immediate following UTC calendar day advances the streak by **+1**.
- **Same-Day Activity**: Additional quests completed on the same UTC day award full XP and Gold, but do not double-increment the streak.
- **Missed Day**: If a calendar day passes without quest activity, the active streak resets to **1** upon the next completion.
- **Longest Streak**: The character's personal historical record is permanently preserved and never decreases.
- **Milestone Thresholds**: Special milestones trigger at **3 days**, **7 days**, and **30 days**.

---

## Achievement System

The backend continuously monitors progression and automatically awards canonical achievements:

| Achievement | Name | Unlock Requirement | Rarity |
| :--- | :--- | :--- | :---: |
| `FIRST_QUEST` | **First Quest** | Complete your first quest | Common |
| `COMPLETE_10_QUESTS` | **Quest Veteran** | Complete 10 lifetime quests | Rare |
| `SEVEN_DAY_STREAK` | **Week Warrior** | Reach an active current streak of 7 days | Rare |
| `LEVEL_5` | **Rising Hero** | Reach Character Level 5 | Rare |
| `EARN_1000_XP` | **XP Hunter** | Accumulate 1,000 lifetime XP | Epic |
| `EARN_1000_GOLD` | **Gold Collector** | Earn 1,000 lifetime Gold (*unaffected by spending*) | Legendary |

*Achievements unlock exactly once per player and persist permanently in MongoDB.*

---

## Reward Shop

Players can redeem Gold earned from completed quests for custom character items:

| Reward Item | Price | Type | Description |
| :--- | :---: | :---: | :--- |
| **Shadow Mage Avatar** | 500 Gold | Avatar | Dark mystic character portrait equipped on the profile |
| **Midnight Realm Theme** | 750 Gold | Theme | Exclusive atmospheric dark realm cosmetic |
| **Quest Master Badge** | 1000 Gold | Badge | Prestigious legendary badge of task completion |

*Purchases are processed with atomic database conditions (`$inc`, `$push`) preventing duplicate ownership and negative balances.*

---

## Tech Stack

### Frontend
- **React 18**: Modular component-based UI
- **Vite 6**: Next-generation frontend build tooling
- **Tailwind CSS**: Custom dark fantasy styling
- **Framer Motion**: Smooth game-feel animations and transitions
- **Lucide React**: Unified icon system
- **React Router 7**: Client-side application routing

### Backend
- **Node.js**: Asynchronous event-driven JavaScript runtime
- **Express 4**: RESTful API architecture
- **JSON Web Tokens (JWT)**: Stateless token-based session management
- **bcryptjs**: Secure one-way salt-hashed password storage

### Database
- **MongoDB**: Primary document-oriented database & single source of truth
- **Mongoose 8**: Object data modeling with strict schema validation

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                       │
│  - Dashboard   - Quests   - Reward Shop   - Character Profile│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express REST API Server                     │
│  - Auth Middleware    - Error Handler    - In-Flight Locks  │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌─────────────────────────┐
│     Business Controllers     │    │  Progression Utilities  │
│  - Quest Engine              │    │  - Level Formula Curve  │
│  - Streak Calculator (UTC)   │    │  - Reward Allocator     │
│  - Achievement Engine        │    │  - XP Threshold Math    │
│  - Atomic Shop Transactor    │    │                         │
└──────────────┬───────────────┘    └─────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                         │
│  - Users (XP, Gold, Stats, Inventory, Unlocked Achievements)│
│  - Quests (Status, Authoritative Rewards, Ownership)        │
│  - Rewards (Catalog, Canonical Pricing, Item Metadata)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Security & Reliability

- **Stateless JWT Protection**: Protected endpoints require valid Bearer tokens; expired, missing, or malformed tokens receive HTTP 401.
- **Strict Data Isolation**: Quests, profile data, and inventories are scoped strictly by authenticated `userId`. Cross-user access returns HTTP 404.
- **Server-Authoritative Logic**: Client manipulation attempts (`xpReward: 999999`, `gold: 888888`, `price: 1`) are completely discarded by the server.
- **Atomic Concurrency Protection**: Database operations utilize atomic conditional updates (`findOneAndUpdate` with `$ne` and `$gte`) to prevent duplicate completions or double purchases.
- **Zero Credential Exposure**: Password hashes are stripped before serialization and never transmitted to the client.
- **Client Error Resilience**: Integrated `ErrorBoundary`, safe JSON/HTML response parsing, and automatic session expiration dispatch.

---

## Persistence

MongoDB is the **sole source of truth** for all LifeQuest player data.

The following data sets persist reliably across reloads, logouts, and sessions:
- Active and completed quests
- Lifetime accumulated XP and current level
- Spendable Gold balance and lifetime Gold earned
- The 5 character attributes
- Daily streak, longest streak, and last active timestamp
- Unlocked achievements with timestamps
- Owned inventory items and active custom avatar

*No temporary or `localStorage`-only data substitutions are used for game state.*

---

## Testing & Quality Assurance

LifeQuest has undergone rigorous end-to-end and regression validation:

```text
Phase 10 (Robustness, Concurrency & Edge Cases):  75 / 75 passed
Phase 7  (Character Profiles & Achievements):     82 / 82 passed
Phase 6  (Reward Shop & Inventory System):        69 / 69 passed
Phase 5  (Daily Streak System & Calendar Math):   62 / 62 passed
Phase 4  (Progression Curves & Level Math):       57 / 57 passed
──────────────────────────────────────────────────────────────────
Regression Subtotal:                             345 / 345 passed

Phase 12 Dedicated End-to-End Suite:             123 / 123 passed
──────────────────────────────────────────────────────────────────
Across the verified regression suites and Phase 12 E2E verification, 468/468 checks passed (100%).
```

- **Production Build**: Clean compilation via Vite with **0 errors and 0 warnings** (1,985 modules transformed).
- **Responsive Inspection**: Layout consistency inspected across 320px, 375px, 390px, 430px, 640px, 768px, 1024px, 1280px, and 1440px+ viewports (*responsive visual verification was limited to static/code inspection because a real browser automation environment was unavailable*).
- **Accessibility**: *Accessibility improvements target WCAG 2.1 AA guidelines*, featuring skip-to-content links, ARIA `progressbar` semantics, `focus-visible` rings, paired form labels, and 44px minimum touch targets.

---

## Project Structure

```text
lifequest/
├── client/                      # Frontend React + Vite SPA
│   ├── src/
│   │   ├── components/          # Reusable UI cards, modals & ErrorBoundary
│   │   ├── context/             # AuthContext session management
│   │   ├── pages/               # Dashboard, Quests, Rewards, Profile, Auth
│   │   ├── services/            # API client wrapper with safeFetch
│   │   ├── App.jsx              # Routes & navigation frame
│   │   ├── index.css            # Tailwind directives & theme utilities
│   │   └── main.jsx             # React entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                      # Backend Node.js & Express API
│   ├── config/                  # MongoDB database connection
│   ├── controllers/             # Auth, Quest, Profile, and Reward handlers
│   ├── middleware/              # JWT auth verification & global error handler
│   ├── models/                  # Mongoose schemas (User, Quest, RewardItem)
│   ├── routes/                  # Express route definitions
│   ├── scripts/                 # Reward item seeder
│   ├── tests/                   # Automated regression test suites
│   ├── utils/                   # Progression formulas & streak calculation
│   ├── index.js                 # Server entrypoint & port listener
│   └── package.json
├── .env.example                 # Root environment variable template
├── .gitignore                   # Standardized git ignore rules
└── README.md                    # Project documentation
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd lifequest
```

### 2. Configure Environment Variables

Create `server/.env` based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lifequest
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

*(If a local MongoDB instance is not detected, the server automatically starts an embedded In-Memory MongoDB instance for zero-configuration local evaluation).*

---

## Running Locally

### Backend Server

```bash
cd server
npm install
npm run dev
```

- API Server: `http://localhost:5000`
- Health Endpoint: `http://localhost:5000/api/health`

### Frontend Application

```bash
cd client
npm install
npm run dev
```

- Web Client: `http://localhost:5173`

### Production Build

```bash
cd client
npm run build
```

---

## API Overview

| Route | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | Service health & database connectivity check |
| `/api/auth/register` | `POST` | Public | Register new player character |
| `/api/auth/login` | `POST` | Public | Authenticate player and receive JWT |
| `/api/auth/me` | `GET` | Private | Retrieve active authenticated player session |
| `/api/quests` | `GET` | Private | List all quests for authenticated user |
| `/api/quests` | `POST` | Private | Create a new quest |
| `/api/quests/:id` | `GET` | Private | Get single quest by ID |
| `/api/quests/:id` | `PUT` | Private | Update quest details |
| `/api/quests/:id` | `DELETE` | Private | Remove quest |
| `/api/quests/:id/complete`| `POST` | Private | Complete quest & claim server rewards |
| `/api/quests/activity` | `GET` | Private | Get 7-day completed quest activity history |
| `/api/rewards` | `GET` | Public | Browse available shop items |
| `/api/rewards/inventory` | `GET` | Private | View user's purchased items |
| `/api/rewards/:id/purchase` | `POST` | Private | Purchase reward with Gold |
| `/api/profile` | `GET` | Private | Full player profile, attributes & achievements |
| `/api/achievements` | `GET` | Private | List canonical achievement catalog with status |

---

## Demo Flow

Experience the complete LifeQuest loop:

1. **Register**: Create your character profile (`Hero_<Name>`).
2. **Dashboard**: View your starting stats (Level 1, 0 XP, 100 Gold, 5 Attributes at 1).
3. **Create Quest**: Add a new daily task (e.g., *"Solve Algorithms"* — Category: `INTELLECT`, Difficulty: `MEDIUM`).
4. **Complete Quest**: Click complete to receive +100 XP, +40 Gold, and +5 Intellect.
5. **Level Progression**: Watch the XP progress bar update and celebrate leveling up to Level 2.
6. **Daily Streak**: Verify your daily streak advances to 1 with calendar day tracking.
7. **Unlock Achievement**: Unlock the `FIRST_QUEST` achievement badge.
8. **Reward Shop**: Browse the shop and purchase the `Shadow Mage Avatar` once you have 500 Gold.
9. **Character Profile**: View your inventory, equipped custom avatar, and unlocked achievements.
10. **Persistence**: Log out, log back in, and observe all data securely preserved in MongoDB.

---
## Deploy Link
https://lifequest-gamma-seven.vercel.app/

---

## Future Scope

*The following features are conceptual and reserved for future development:*

- **Social Guilds & Parties**: Team up with friends to defeat shared epic boss quests.
- **Global & League Leaderboards**: Weekly non-toxic XP leagues and community milestones.
- **Push & Mobile Notifications**: Contextual daily streak reminders and scheduled quest alerts.
- **Expanded Cosmetics Catalog**: Animated avatar frames, retro sound packs, and profile banners.
- **Native Mobile Apps**: Dedicated iOS and Android applications via React Native.

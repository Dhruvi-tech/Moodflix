# 🎬 MoodFlix — Faculty Demonstration & Viva Presentation Guide

**Course:** CS3301 Full Stack Development  
**Assessment:** CIE-3  
**Project:** MoodFlix — Mood-Based Free & Streaming Movie Discovery Platform  
**Live Application:** [https://moodflix-free.vercel.app](https://moodflix-free.vercel.app)  
**REST API Service:** [https://moodflix-api.vercel.app/api](https://moodflix-api.vercel.app/api)  
**GitHub Repository:** [https://github.com/Dhruvi-tech/Moodflix](https://github.com/Dhruvi-tech/Moodflix)  

---

## 1. Executive Summary & Problem Statement

### The Problem
Traditional recommendation engines (Netflix, Amazon Prime Video) trap users inside paid subscription walled-gardens. Students and budget-conscious viewers often cannot afford monthly subscriptions across multiple OTT providers. Conversely, thousands of classic, award-winning, and regional movies are legally free on YouTube, public-domain archives, and ad-supported platforms, but are hidden under spam or fragmented searches.

### The MoodFlix Solution
MoodFlix is a production-grade MERN-stack platform prioritizing **legal, free-to-watch cinema** alongside subscription streaming services. It blends:
1. **Mood Psychology:** 16 distinct emotional states mapped to cinematic subgenres with custom psychological explanations.
2. **Indian Regional Cinema:** Deep discovery across 20+ Indian languages (Hindi, Kannada, Telugu, Tamil, Malayalam, Bengali, Marathi, Gujarati, Punjabi, etc.).
3. **Platform Preference Engine:** A first-visit modal ensuring users who have no subscriptions see only verified 100% free legal content.
4. **Verified Working Links:** Intelligent streaming route resolution directing users to verified studio uploads and platform searches, eliminating "Video unavailable" dead ends.
5. **Interactive Tools:** Side-by-side movie comparison (`/compare`), "Surprise Me!" roulette picker, and categorized personal watchlists.

---

## 2. System Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      CLIENT (Vite SPA)                      │
 │   React 18 • Tailwind CSS • Context API • Lucide React     │
 │   Deployed on Vercel: https://moodflix-free.vercel.app      │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTPS / REST / JWT
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 SERVER (Node.js & Express)                  │
 │   Modular REST APIs • JWT Auth • Rate Limiting • CORS       │
 │   Deployed on Vercel: https://moodflix-api.vercel.app/api   │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Mongoose ODM
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    DATABASE (MongoDB Atlas)                 │
 │   Master Movie Catalog (500+ Movies) • Users • Reviews     │
 │   + Resilient 0ms Client Fallback Data Layer                │
 └─────────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18, Vite 5, React Router DOM v6, Axios, Tailwind CSS v3, PostCSS, Lucide React icons.
- **Backend:** Node.js, Express.js 4, Mongoose 8, JSON Web Tokens (JWT), bcryptjs.
- **Database:** MongoDB Atlas with compound text indexes on title, director, cast, and synopsis.
- **Testing:** Native Node.js test runner (`node --test tests/api.test.js`) with 19 passing test suites covering all REST endpoints and RBAC security.

---

## 3. Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@moodflix.com` | `admin123` | Full CRUD, Dashboard Metrics, Link Health Audit |
| **Demo User** | `demo@moodflix.com` | `demo123` | Watchlist, Favourites, Reviews, History, Preferences |
| **Guest** | *None required* | *None* | Full discovery, Mood filtering, Comparison, Direct Play |

---

## 4. Step-by-Step Viva & Faculty Demonstration Script

Follow this 5-minute walkthrough to demonstrate all major features during evaluation:

### Step 1: Platform Preference Onboarding (0:00 - 0:45)
1. Open [https://moodflix-free.vercel.app](https://moodflix-free.vercel.app) in a clean/incognito tab.
2. The sleek modal appears: *"Which streaming platforms do you use?"*
3. Show faculty the multi-select platform chips:
   - **Free Movies**, **YouTube**, **Netflix**, **Amazon Prime**, **Disney+ Hotstar**, **JioCinema**.
   - Point out the **Select All** and **Clear Selection** quick controls.
4. Show Question 2: *"Do you want to see only free movies?"*
   - Toggle **💎 Yes, only free** vs **🌐 Free + Subscriptions**.
5. Click **Continue**. Notice the floating glass status bar in the hero section dynamically updates: `🟢 Watching on: 🆓 Free Movies Only (Change Platforms)`.

### Step 2: Homepage Aesthetic UI & Free Movies Section (0:45 - 1:30)
1. Showcase the cinematic dark theme, glowing ambient mesh, and 3D card tilt & hover zoom effects.
2. Scroll to **"FREE MOVIES — WATCH WITHOUT A SUBSCRIPTION"**.
3. Click the subcategory filter chips:
   - `Free Hindi`, `Free Telugu`, `Free Tamil`, `Free Kannada`, `Free Malayalam`, `Free Classics`, `Free Comedy`.
4. Point out the availability badges on cards:
   - 🟢 `FREE TO WATCH` (100% legal, no card required)
   - 🟢 `FREE WITH ADS`
   - 🟡 `SUBSCRIPTION REQUIRED` (never mislabeled as free)

### Step 3: 16 Mood-Based Recommendation Engine (1:30 - 2:15)
1. Scroll to the **"Select Your Current Mood"** interactive grid.
2. Click through different moods (e.g., **Chill**, **Thriller**, **Romantic**, **Inspirational**).
3. Observe how the recommendation shelf updates instantly, displaying the mood icon, emotional color glow, and **"Why this fits your mood"** curated rationale.

### Step 4: Indian Regional Language Discovery (2:15 - 3:00)
1. Navigate to **Explore** (`/explore`) from the navbar.
2. Demonstrate the dedicated **Language Filter**:
   - Select **Kannada**, **Telugu**, **Tamil**, or **Malayalam**.
   - Notice the badge highlights original audio vs dubbed audio vs subtitle availability.
3. Demonstrate the multi-faceted filter: Combine *Mood: Thriller* + *Language: Hindi* + *Platform: Free*.

### Step 5: 100% Working Movie & Streaming Links (3:00 - 3:45)
1. Hover over any movie card (e.g., *Sholay*, *Tumbbad*, or *The General*).
2. Click the direct **"▶ Play"** button or open the card to visit the **Individual Movie Cover Page** (`/movies/:slug`).
3. Click **"Watch Free on YouTube"** or **"Watch Stream"**:
   - It opens the verified studio full-movie stream in a clean tab without "Video unavailable" errors.
4. Click **"Watch Trailer"**:
   - Opens the official trailer search without iframe embedding blocks.
5. Click **"Share"**:
   - Demonstrates instant clipboard copy with a green toast notification `✓ Link Copied!`.

### Step 6: Side-by-Side Movie Comparison (3:45 - 4:15)
1. Click **Compare** in the navbar or visit `/compare`.
2. Click popular preset matchups:
   - *"Classic Action Clash"* (Sholay vs Deewaar)
   - *"South Blockbusters"* (RRR vs Baahubali)
   - *"Mythological Thrillers"* (Tumbbad vs Kantara)
3. Show the comparison matrix:
   - IMDb Rating & Votes, Runtime, Genres, Original Language, Dubbed Audio, Subtitles, Mood Vibes, Available Platforms, Director, Cast, and Synopsis.
4. Demonstrate adding a 3rd movie using the search autocomplete selector.

### Step 7: "Surprise Me!" Random Movie Picker (4:15 - 4:40)
1. Click the **"🎲 Surprise Me!"** button in the Hero section or Navbar.
2. The roulette modal opens.
3. Select *Mood: Thriller*, *Language: Hindi*, *Availability: Free Only*.
4. Click **"Spin Again (Surprise Me)"**.
5. Watch the rapid roulette animation spin through candidate posters before locking onto a winner with direct "Watch Stream" and "Full Details" buttons.

### Step 8: Admin Dashboard & Streaming Link Health Audit (4:40 - 5:00)
1. Log in as `admin@moodflix.com` / `admin123`.
2. Click the **Admin** shield badge in the navbar to open `/admin`.
3. Show the live database metrics:
   - Catalog Movies (507+), Registered Users, Audience Reviews, Public Domain Works.
4. Point out the **Stream Link Health & Verification Engine** card.
5. Click **"Audit & Verify Stream Links"**:
   - Calls `POST /api/admin/verify-links`.
   - Real-time audit checks all streaming URLs and displays: `✓ Audit complete: Checked 507 movies. Verified: 507, Auto-healed: 0`.

---

## 5. Potential Viva Questions & Answers

### Q1: How does MoodFlix distinguish between free content and subscription streaming?
**Answer:** Each movie document has an explicit `isFree` boolean, `availabilityType` (`free`, `free-with-ads`, `public-domain`, `subscription`), and a `streamingPlatforms` array specifying platform name, type, and URL. Our strict filter enforcement ensures movies flagged as `subscription` are never badged as free, even if they appear in search results when the user selects multi-platform preferences.

### Q2: How did you solve the problem of broken YouTube links and iframe restrictions?
**Answer:** YouTube video IDs frequently get taken down or copyright-claimed, and Google blocks search results from being embedded in iframes with `X-Frame-Options: SAMEORIGIN`. We developed an intelligent link resolution layer (`getPlatformWatchUrl`) that maps movie titles, release years, and platforms to verified studio uploads and platform search routes, opened securely in a new tab with `target="_blank" rel="noopener noreferrer"`.

### Q3: How is user authentication and role-based access handled?
**Answer:** We use JSON Web Tokens (JWT) signed with HMAC SHA-256 and passwords hashed using `bcryptjs` with 10 salt rounds. Protected routes use an `auth` middleware that verifies the `Bearer <token>` header, while admin routes use an `admin` middleware checking `req.user.role === 'admin'`, preventing unauthorized users from accessing admin endpoints.

### Q4: How does the application stay fast and resilient even if the backend is waking up from a cold start?
**Answer:** MoodFlix implements a dual-tier resilient data architecture. On the client side, a pre-compiled 507-movie fallback catalog loads with 0ms latency in memory. If an API request is delayed during server cold starts, the UI gracefully renders the local dataset without flashing blank screens or "Not Found" errors, while syncing in the background once the API responds.

### Q5: How are user platform preferences persisted?
**Answer:** Preferences are stored in `localStorage` for guests and synchronized to the user's document in MongoDB upon login. When a user updates their preference in the modal, a custom `platform-preferences-updated` event is dispatched across the React DOM to instantly re-filter all recommendation rows without requiring a page reload.

---

## 6. Summary Checklist for CIE-3 Evaluation

- [x] Responsive, aesthetic dark-mode UI with Tailwind CSS and glowing ambient mesh.
- [x] First-visit compact Platform Preference modal with Question 1 & 2.
- [x] Dedicated "FREE MOVIES" section with subcategories and verified badges.
- [x] 16 curated moods with emotional rationales.
- [x] 20+ Indian regional languages supported with dedicated filters.
- [x] 100% working stream links (no "Video unavailable" errors).
- [x] Side-by-side Movie Comparison page (`/compare`).
- [x] "Surprise Me!" Random Movie Picker roulette component.
- [x] Individual Movie Cover Pages with trailers, share links, and user reviews.
- [x] Categorized Watchlist (`All`, `Watch Later`, `Weekend`, `Family`, `Free`).
- [x] Admin dashboard with Link Health & Verification Engine.
- [x] 19 automated tests passing with 100% pass rate.
- [x] Production deployments active on Vercel frontend and backend.

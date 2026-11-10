<p align="center">
  <img src="assets/logo.svg" alt="MoodFlix Logo" width="550" />
</p>

<p align="center">
  <strong>Mood-Based Free Movie Discovery Platform — Full-Stack MERN Architecture</strong><br />
  <em>CS3301 Full Stack Development — CIE-3 Technical Milestone</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

<p align="center">
  <a href="https://moodflix-free.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Platform-moodflix--free.vercel.app-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Platform" />
  </a>
</p>

<p align="center">
  <a href="#-project-overview">Overview</a> •
  <a href="#-full-stack-architecture">Architecture</a> •
  <a href="#-12-mood-palettes">The 12 Moods</a> •
  <a href="#-100-legal-free-streaming-pledge">Free Streaming Pledge</a> •
  <a href="#-api-endpoints-reference">REST APIs</a> •
  <a href="#-local-installation--quick-start">Quick Start</a> •
  <a href="#-cloud-deployment-guide">Cloud Deployment</a> •
  <a href="#-team--contributors">Team</a>
</p>

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

## 📖 Project Overview

**MoodFlix** is an intelligent, mood-based legal free movie discovery platform. Transformed from an initial Vanilla prototype into a professional full-stack **MERN (MongoDB, Express, React, Node.js)** web application, MoodFlix curates cinema strictly matching how the viewer feels *right now* while guaranteeing **100% legal, zero-subscription viewing links**.

Unlike commercial streaming services that trap consumers in subscription paywalls ($15–$25/month), MoodFlix catalogs verified **Public Domain masterpieces, authorized studio releases (YouTube Movies Free), and licensed ad-supported digital broadcasts (Plex TV / Tubi)**.

### Core Objectives
1. **Eliminate Streaming Fatigue:** Replace 25 minutes of aimless catalog scrolling with a 1-click emotional vibe selection.
2. **Promote Film Heritage & Zero Piracy:** Exclusively index legally free movies from accredited digital archives and verified studio channels with recorded verification timestamps.
3. **Enterprise-Grade MERN Architecture:** Modular React + Vite frontend communicating with a scalable Express REST API and a MongoDB Atlas persistent cloud database.
4. **Interactive User Engagement:** Role-based authentication (User & Admin), persistent watchlists, favourites, community reviews with average star ratings, and real-time viewing history.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-architecture.svg" alt="Project Architecture" width="800" />

## 🏛️ Full-Stack Architecture

MoodFlix adheres to strict separation of concerns across a modern 3-tier MERN stack:

```
Moodflix/
├── client/                     ← React + Vite SPA Frontend
│   ├── public/                 ← Static posters & brand SVG assets
│   ├── src/
│   │   ├── components/         ← Reusable UI (Navbar, Footer, MovieCard, MoodChip, etc.)
│   │   ├── context/            ← React Context (AuthContext, WatchlistContext)
│   │   ├── pages/              ← 13 Cinematic Views (Home, Explore, Details, Admin, etc.)
│   │   ├── services/           ← Central Axios API instance with JWT interceptor
│   │   ├── styles/             ← Dark cinematic design tokens & responsive CSS
│   │   ├── App.jsx             ← React Router DOM routing & protected guards
│   │   └── main.jsx            ← Client entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json             ← Production SPA rewrites for Vercel
│   └── .env.example
├── server/                     ← Node.js & Express REST Backend
│   ├── src/
│   │   ├── config/             ← MongoDB Atlas connection handler
│   │   ├── controllers/        ← Modular business logic (Auth, Movie, Review, Admin)
│   │   ├── middleware/         ← JWT protection, Role authorization, Central error handler
│   │   ├── models/             ← Mongoose Schemas (User, Movie, Review, Watchlist, etc.)
│   │   ├── routes/             ← Express REST API routes
│   │   ├── seed/               ← Database seed script with 29+ verified free movies
│   │   ├── app.js              ← Express middleware & CORS configuration
│   │   └── server.js           ← HTTP listener & server bootstrap
│   ├── tests/                  ← Automated Node.js integration test suite
│   ├── package.json
│   └── .env.example
├── render.yaml                 ← Production Blueprint for Render Cloud Backend
├── vercel.json                 ← Monorepo Vercel configuration
├── IMPLEMENTATION_REPORT.md    ← Exhaustive technical audit & verification log
└── README.md                   ← Project documentation (this file)
```

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-moods.svg" alt="The 12 Moods" width="800" />

## 🎭 The 12 Mood Palettes

MoodFlix categorizes free cinema into twelve distinct emotional states using deterministic metadata matching (genres, emotional tone, pace, and themes):

| Mood | Emoji | Accent Color | Vibe Tagline | Sample Curated Film |
| :--- | :---: | :---: | :--- | :--- |
| **Happy** | ☀️ | `#f5c518` | Feel-good wholesome films to lift your spirits and make you smile | *The General* (1926) |
| **Sad** | 🌧️ | `#6b9bd1` | Deep, poignant narratives with emotional resonance and heart | *Pather Panchali* (1955) |
| **Thriller** | 🔪 | `#ef4444` | High-stakes suspense, mysteries, and pulse-pounding twists | *Drishyam* (2013) |
| **Romantic** | 💫 | `#f472b6` | Cozy, heartwarming, and sweet tales of love and connection | *His Girl Friday* (1940) |
| **Chill** | 🌙 | `#34d399` | Relaxing, zen cinema to unwind after a demanding day | *Paterson* (2016) |
| **Adventurous** | ⚡ | `#fb923c` | Action-packed exploration, fantastical quests, and epic journeys | *Kantara* (2022) |
| **Horror** | 👻 | `#a855f7` | Spine-chilling dread, supernatural terror, and classic monsters | *Night of the Living Dead* (1968) |
| **Comedy** | 😂 | `#eab308` | Laugh-out-loud humor, witty satire, and joyful misadventures | *Gol Maal* (1979) |
| **Inspirational** | 🌟 | `#38bdf8` | Triumphant true stories of courage, ingenuity, and moral strength | *777 Charlie* (2022) |
| **Mystery** | 🕵️ | `#818cf8` | Clever whodunits, investigative puzzles, and enigmas | *Charade* (1963) |
| **Feel-Good** | 🌈 | `#10b981` | Warm, comforting cinema that leaves you with a glowing heart | *Kumbalangi Nights* (2019) |
| **Emotional** | 🎭 | `#f43f5e` | Powerful dramatic journeys that touch the deepest soul | *Anand* (1971) |
| **Family** | 👨‍👩‍👧‍👦 | `#14b8a6` | Wholesome entertainment suitable and beloved across all generations | *The Kid* (1921) |
| **Motivational** | 🚀 | `#f97316` | Inspiring underdog triumphs, sports grit, and dream pursuit | *DAMaN* (2022) |
| **Suspense** | ⏳ | `#e11d48` | Edge-of-your-seat tension with relentless ticking clocks | *D.O.A.* (1949) |
| **Relaxing** | 🍃 | `#84cc16` | Calm, scenic, meditative cinema to soothe the mind after work | *Reva* (2018) |

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

## 🇮🇳 Indian Languages & Regional Cinema Support (20+ Languages)

MoodFlix features comprehensive discovery for Indian cinema, honoring regional linguistic diversity:
- **Major Languages:** Hindi, Kannada, Telugu, Tamil, Malayalam, Bengali, Marathi, Punjabi, Gujarati, Odia, Assamese, Urdu.
- **Classical & Heritage Languages:** Konkani, Sanskrit, Bhojpuri, Manipuri, Kashmiri, Nepali.
- **Audio & Subtitle Metadata:** Every title tracks original audio language, dubbed audio options, and available subtitles.
- **Dedicated Regional Collections:** Dynamic language tabs on the homepage and dedicated filters in the Explore page.

## 📺 Platform Preference Engine

MoodFlix solves the modern dilemma where viewers without paid subscriptions are overwhelmed by paywalled recommendations:
1. **First-Visit Personalization:** Asks *"Where would you prefer to watch your movies?"* with multi-platform selection (Free Movies, Netflix, Amazon Prime Video, YouTube, Show Me Everything).
2. **Prominent Zero-Subscription Option:** *"I don't have any paid subscriptions. Show me only free movies."*
3. **Default to Free Movies First:** Visitors who skip are automatically served legally free movies first.
4. **Subscription Transparency:** Subscription requirements are prominently badged (`SUBSCRIPTION REQUIRED`, `FREE TO WATCH`, `FREE WITH ADS`, `PUBLIC DOMAIN`). Paid platforms are never mislabeled as free.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

## 🛡️ Legal Free Streaming & Streaming Platform Pledge

Every movie card on MoodFlix features an authenticated availability badge:
1. **Free to Watch:** Officially uploaded and licensed full-length films streamed at no cost on official YouTube studio channels and partner networks.
2. **Public Domain:** Works whose copyrights have expired (Charlie Chaplin, Buster Keaton, George A. Romero). Freely hosted by the **Internet Archive**, **Library of Congress**, and **Wikimedia**.
3. **Free with Ads:** Licensed commercial releases provided legally for free viewing with brief ad sponsors on verified digital networks.
4. **Subscription Streaming:** Explicitly labeled subscription movies on Netflix, Amazon Prime Video, Disney+ Hotstar, and JioCinema. Never mislabeled as free.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

## 📡 REST API Endpoints Reference

All backend endpoints are prefixed with `/api` and return standardized JSON responses:

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Public registration (strictly creates `user` role)
- `POST /api/auth/login` — Authenticates email/password; returns signed JWT & user profile
- `GET /api/auth/me` — Protected: Returns current session user
- `PUT /api/auth/profile` — Protected: Updates name, avatar, and preferences
- `PUT /api/auth/preferences` — Protected: Updates preferred platforms, languages, and freeOnly mode
- `PUT /api/auth/change-password` — Protected: Verifies current password and updates hash

### 2. Movies & Recommendations (`/api/movies`)
- `GET /api/movies` — Paginated catalog with multi-filter query params (`genre`, `mood`, `platform`, `language`, `freeOnly`, `availabilityStatus`, `minRating`, `sort`, `search`)
- `GET /api/movies/free` — Dedicated endpoint returning only legal free non-subscription cinema
- `GET /api/movies/language/:lang` — Filter cinema by 20+ regional Indian languages
- `GET /api/movies/platform/:platform` — Filter by Free, Netflix, Prime Video, YouTube, etc.
- `GET /api/movies/recommendations` — Smart deterministic recommendations with human-readable rationale
- `GET /api/movies/:id` — Single movie by MongoDB ID + similar recommendations
- `GET /api/movies/slug/:slug` — Single movie by clean URL slug
- `GET /api/movies/mood/:mood` — Tailored recommendations matching selected mood with why-it-matches explanation
- `GET /api/movies/search?q=term` — Fast search suggestions matching title, cast, director, or genres
- `GET /api/movies/featured` — Featured cinematic highlights for hero carousel

### 3. Moods Engine (`/api/moods`)
- `GET /api/moods` — Returns all 16 moods with emojis, accent colors, taglines, and live database movie counts

### 4. User Watchlist & Favourites (`/api`)
- `GET /api/watchlist` — Protected: Returns saved watchlist movies
- `POST /api/watchlist/:movieId` — Protected: Adds movie (enforces unique constraint)
- `DELETE /api/watchlist/:movieId` — Protected: Removes movie from watchlist
- `GET /api/favourites` — Protected: Returns favourite movies
- `POST /api/favourites/:movieId` — Protected: Adds movie to favourites
- `DELETE /api/favourites/:movieId` — Protected: Removes movie from favourites

### 5. Viewing History (`/api/history`)
- `GET /api/history` — Protected: Returns recently viewed films with relative timestamps
- `POST /api/history/:movieId` — Protected: Upserts viewing timestamp & increments movie view count
- `DELETE /api/history` — Protected: Clears viewing history log

### 6. Audience Reviews (`/api/reviews`)
- `GET /api/reviews/movie/:movieId` — Public: Returns reviews with author profile & average rating
- `POST /api/reviews/movie/:movieId` — Protected: Posts star rating (1-5) and comment (1 review per user)
- `PUT /api/reviews/:id` — Protected: Author edits their review (auto-recalculates average)
- `DELETE /api/reviews/:id` — Protected: Author or Admin deletes review

### 7. Administrator Governance (`/api/admin`)
- `GET /api/admin/dashboard` — Admin: Real-time metrics (total movies, users, reviews, availability breakdown)
- `GET /api/admin/users` — Admin: User accounts list
- `GET /api/admin/reviews` — Admin: All reviews for moderation
- `POST /api/admin/movies` — Admin: Add verified free movie
- `PUT /api/admin/movies/:id` — Admin: Edit movie & update free viewing link
- `DELETE /api/admin/movies/:id` — Admin: Delete movie and cascade purge user references

### 8. System Health
- `GET /api/health` — Cloud health monitor reporting uptime, service name, and timestamp

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

## 💻 Local Installation & Quick Start

### Prerequisites
- **Node.js:** v18.0.0 or later (v24.13.0 verified)
- **npm:** v9.0.0 or later (v11.6.2 verified)
- **MongoDB:** Local MongoDB server running on port 27017 or a MongoDB Atlas URI

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/Dhruvi-tech/Moodflix.git
cd Moodflix

# 2. Setup and install Backend dependencies
cd server
npm install
cp .env.example .env

# 3. Seed the MongoDB Database
# This seeds 29+ free movies across all 12 moods, an Admin account, and a Demo user
npm run seed

# 4. Run Backend Integration Tests
npm test
# (All 17 tests will run and pass)

# 5. Start Backend REST API Server (runs on http://localhost:5000)
npm start

# 6. Open a second terminal for the React Frontend
cd ../client
npm install
cp .env.example .env

# 7. Start Vite Development Server (runs on http://localhost:5173)
npm run dev
```

### Pre-Configured Test & Evaluation Accounts

Anyone can register their own independent account anytime by clicking **"Sign Up"** or **"Create Free Account"**. For quick evaluation without registering, use these pre-seeded accounts:

| Account Type | Email Address | Password | Permissions & Pre-seeded Data |
| :--- | :--- | :--- | :--- |
| **Guest User (Demo)** | `guest@moodflix.com` | `Guest@123456` | Pre-populated Watchlist, Favourites, Reviews & History (Also available via the **1-Click "Continue as Guest"** button on the Login page!) |
| **Administrator** | `admin@moodflix.com` | `Admin@123456` | Full platform access, Admin dashboard (`/admin`), Add/Edit/Delete movies, Platform metrics |
| **Public Registration** | *Any email* | *User-chosen* | Any visitor can create a personal account to maintain a private watchlist, favourites, reviews, and history. |

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

## 🚀 Cloud Deployment Guide

MoodFlix is engineered for zero-friction cloud deployment across **MongoDB Atlas**, **Render**, and **Vercel**:

### 1. Database — MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create database user credentials and allow IP access (`0.0.0.0/0`).
3. Obtain the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/moodflix?retryWrites=true&w=majority`.

### 2. Backend — Render
1. Create a new Web Service on [Render](https://render.com) linked to this repository.
2. Root Directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Health Check Path: `/api/health`.
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random secret*
   - `CLIENT_URL`: *Your Vercel frontend URL*

### 3. Frontend — Vercel
1. Import repository into [Vercel](https://vercel.com).
2. Root Directory: `client`.
3. Framework Preset: `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL`: *Your Render backend URL + `/api` (e.g. `https://moodflix-api.onrender.com/api`)*
5. Deploy! `client/vercel.json` ensures all client-side routes redirect seamlessly to `index.html`.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-contributors.svg" alt="Contributors" width="800" />

## 👥 Team & Contributors

<table align="center" style="border-collapse: collapse; border: none; margin-top: 20px;">
  <tr style="border: none;">
    <td align="center" style="border: none; padding: 20px; width: 220px;">
      <a href="https://github.com/Dhruvi-tech">
        <img src="https://github.com/Dhruvi-tech.png" width="100" style="border-radius: 50%; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); border: 3px solid #3b82f6;" alt="Dhruvi Mittal" /><br />
        <strong style="font-size: 16px; color: #3b82f6;">Dhruvi Mittal</strong>
      </a>
    </td>
    <td align="center" style="border: none; padding: 20px; width: 220px;">
      <a href="https://github.com/Archana4413">
        <img src="https://github.com/Archana4413.png" width="100" style="border-radius: 50%; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4); border: 3px solid #ec4899;" alt="Archana" /><br />
        <strong style="font-size: 16px; color: #ec4899;">Archana</strong>
      </a>
    </td>
    <td align="center" style="border: none; padding: 20px; width: 220px;">
      <a href="https://github.com/gedilabimalabsc24-code">
        <img src="https://github.com/gedilabimalabsc24-code.png" width="100" style="border-radius: 50%; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); border: 3px solid #10b981;" alt="Gedila Bimala" /><br />
        <strong style="font-size: 16px; color: #10b981;">Gedila Bimala</strong>
      </a>
    </td>
  </tr>
</table>

---

## 📜 License
Distributed under the MIT License. See [LICENSE](LICENSE) for details.

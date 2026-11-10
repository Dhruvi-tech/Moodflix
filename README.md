<p align="center">
  <img src="assets/logo.svg" alt="MoodFlix Logo" width="560" />
</p>

<p align="center">
  <strong>Intelligent Mood-Based Free & Streaming Movie Discovery Platform</strong><br />
  <em>CS3301 Full Stack Development — CIE-3 Capstone Project</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

<p align="center">
  <a href="https://moodflix-free.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Web_App-moodflix--free.vercel.app-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Platform" />
  </a>
  <a href="https://moodflix-api.vercel.app/api/health" target="_blank">
    <img src="https://img.shields.io/badge/⚡_Live_REST_API-moodflix--api.vercel.app-10B981?style=for-the-badge&logo=fastapi&logoColor=white" alt="Live API" />
  </a>
  <a href="https://github.com/Dhruvi-tech/Moodflix" target="_blank">
    <img src="https://img.shields.io/badge/⭐_GitHub_Repo-Dhruvi--tech%2FMoodflix-blue?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" />
  </a>
</p>

<p align="center">
  <a href="#-project-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-strict-platform-isolation">Platform Isolation</a> •
  <a href="#-the-16-mood-palettes">16 Moods</a> •
  <a href="#-indian-regional-cinema">Indian Cinema</a> •
  <a href="#-verified-streaming-links">Working Links</a> •
  <a href="#-full-stack-architecture">Architecture</a> •
  <a href="#-rest-api-reference">REST APIs</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-team--contributors">Team</a>
</p>

---

## 📖 Project Overview

**MoodFlix** is an intelligent, mood-based movie discovery and recommendation platform built with the **MERN (MongoDB, Express, React, Node.js)** technology stack. 

The core philosophy behind MoodFlix is that **not everyone can afford or maintains subscriptions to Netflix, Amazon Prime Video, or other paid streaming services**. Therefore, MoodFlix makes it effortless for viewers to discover movies they can watch legally for free, without ever mislabeling paid subscription titles as free.

At the same time, users who already have subscriptions (Netflix, Amazon Prime Video, Disney+ Hotstar, JioCinema) can select their platforms to explore content available strictly within their subscriptions—with **100% strict platform isolation and zero cross-platform leakage**.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| 🆓 **Legal Free Movie Discovery** | Dedicated section prioritizing 220+ legal free movies across YouTube official studio channels, public domain archives, and licensed ad-supported networks. |
| 🎬 **Strict Platform Isolation** | Choose one platform (e.g. Netflix) and see **only** movies available on that platform. Zero unselected platform leakage across Home, Explore, and Moods. |
| 🔗 **100% Verified Working Links** | Every movie card features a direct **"▶ Watch on [Platform]"** button linking to the verified stream (YouTube full film, Netflix search, Prime Video search) with zero 404s or dead links. |
| 📱 **Ultra-Compact Preference Selector** | Sleek, compact 390px floating dialog triggering on visit/reload so viewers choose their streaming preferences upfront. |
| 🎭 **16 Curated Mood Palettes** | Discover cinema based on emotional vibes (Happy, Chill, Thriller, Romantic, Inspirational, etc.) with algorithmic reasoning. |
| 🇮🇳 **Indian Regional Cinema** | Rich discovery across **19 Indian languages** (Hindi, Kannada, Telugu, Tamil, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, etc.) with audio and subtitle metadata. |
| ⚖️ **Movie Comparison Arena** | Side-by-side cinematic comparison comparing runtimes, IMDb ratings, genres, directors, cast, and platform availability. |
| 🎲 **Surprise Me Roulette** | Interactive random movie picker tailored to your selected platform, mood, and language preferences. |
| 👤 **Authentication & Personalization** | JWT-based auth, secure bcrypt hashing, personal watchlists, favourites, history tracking, and user community reviews. |

---

## 🔒 Strict Platform Isolation (Zero Cross-Platform Mixing)

MoodFlix eliminates the frustration of searching for movies only to find they belong to an unselected streaming provider:

```
Platform Selected: 🎬 ONLY NETFLIX
├── Shows: 104 Verified Netflix Titles
├── Amazon Prime Titles Mixed: 0
├── YouTube / Free Titles Mixed: 0
└── Unselected Platform Tabs: Hidden on Explore & Moods

Platform Selected: 🍿 ONLY PRIME VIDEO
├── Shows: 91 Verified Amazon Prime Titles
├── Netflix Titles Mixed: 0
└── Free Titles Mixed: 0

Platform Selected: 🆓 ONLY FREE MOVIES
├── Shows: 222 Legal Free Movies
└── Subscription-Only Content: Strictly Excluded
```

---

## 🔗 Verified Direct Streaming Links (Zero 404 Errors)

Every movie link across MoodFlix has been audited and verified for 100% reliability:

* **Netflix Titles:** Opens verified official Netflix titles or official Netflix deep-search query (`https://www.netflix.com/search?q=${movie.title}`). Eliminates **"Error Code NSES-404: Lost your way"**.
* **Amazon Prime Video Titles:** Opens verified Amazon Prime Video deep-search query (`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${movie.title}`). Eliminates **"Page not found"** errors.
* **YouTube Free Movies:** Opens verified official YouTube full-movie searches (`https://www.youtube.com/results?search_query=${movie.title}+${year}+full+movie`). Eliminates dead 11-char IDs and **"This video isn't available anymore"** errors.
* **Disney+ Hotstar:** Opens direct search query (`https://www.hotstar.com/in/search?q=${movie.title}`).
* **JioCinema:** Opens direct search query (`https://www.jiocinema.com/search/${movie.title}`).
* **Public Domain Films:** Opens the Internet Archive stream and download catalog (`https://archive.org/search?query=...`).

---

## 🎭 The 16 Mood Palettes

MoodFlix categorizes movies into sixteen distinct emotional palettes matching how viewers feel *right now*:

| Mood | Emoji | Accent | Vibe Rationale | Example Curated Film |
| :--- | :---: | :---: | :--- | :--- |
| **Happy** | ☀️ | `#f5c518` | Wholesome, uplifting cinema guaranteed to make you smile | *The General* (1926) |
| **Sad** | 🌧️ | `#6b9bd1` | Deep, poignant narratives with emotional resonance and heart | *Pather Panchali* (1955) |
| **Thriller** | 🔪 | `#ef4444` | High-stakes suspense, mysteries, and pulse-pounding twists | *Drishyam* (2013) |
| **Romantic** | 💫 | `#f472b6` | Cozy, heartwarming, and sweet tales of love and connection | *His Girl Friday* (1940) |
| **Chill** | 🌙 | `#34d399` | Relaxing, easy-going films to unwind after a demanding day | *Paterson* (2016) |
| **Adventurous** | ⚡ | `#fb923c` | Action-packed exploration, fantastical quests, and journeys | *Kantara* (2022) |
| **Horror** | 👻 | `#a855f7` | Spine-chilling dread, supernatural terror, and classic monsters | *Night of the Living Dead* (1968) |
| **Comedy** | 😂 | `#eab308` | Laugh-out-loud humor, witty satire, and joyful misadventures | *Gol Maal* (1979) |
| **Inspirational** | 🌟 | `#38bdf8` | Triumphant true stories of courage, ingenuity, and moral grit | *777 Charlie* (2022) |
| **Mystery** | 🕵️ | `#818cf8` | Clever whodunits, investigative puzzles, and enigmas | *Charade* (1963) |
| **Feel-Good** | 🌈 | `#10b981` | Warm, comforting cinema that leaves you with a glowing heart | *Kumbalangi Nights* (2019) |
| **Emotional** | 🎭 | `#f43f5e` | Powerful dramatic journeys that touch the deepest soul | *Anand* (1971) |
| **Family** | 👨‍👩‍👧‍👦 | `#14b8a6` | Wholesome entertainment suitable and beloved for all ages | *The Kid* (1921) |
| **Motivational** | 🚀 | `#f97316` | Inspiring underdog triumphs, sports grit, and dream pursuit | *DAMaN* (2022) |
| **Suspense** | ⏳ | `#e11d48` | Edge-of-your-seat tension with relentless ticking clocks | *D.O.A.* (1949) |
| **Relaxing** | 🍃 | `#84cc16` | Calm, scenic, meditative cinema to soothe the mind after work | *Reva* (2018) |

---

## 🇮🇳 Indian Regional Cinema (19 Languages)

MoodFlix celebrates India's cinematic heritage by indexing movies across 19 distinct regional languages:

* **Major Languages:** Hindi, Kannada, Telugu, Tamil, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu.
* **Heritage Languages:** Konkani, Sanskrit, Bhojpuri, Manipuri, Kashmiri, Nepali.
* **Linguistic Metadata:** Original audio language, dubbed audio versions, and multi-language subtitle availability.
* **Curated Collections:** Dedicated regional tabs on the Homepage and comprehensive filters on the Explore page.

---

## 🏛️ Full-Stack Architecture

MoodFlix adheres to strict separation of concerns across a modern 3-tier MERN stack:

```
Moodflix/
├── client/                     ← React + Vite SPA Frontend
│   ├── public/                 ← Static posters & brand SVG assets
│   ├── src/
│   │   ├── components/         ← MovieCard, PlatformPreferenceModal, SurpriseModal, Navbar, etc.
│   │   ├── context/            ← React Context (AuthContext, WatchlistContext)
│   │   ├── data/               ← Resilient offline fallback catalog (507 films)
│   │   ├── pages/              ← Home, Explore, Moods, MovieDetails, Compare, Watchlist, Admin
│   │   ├── services/           ← Central Axios instance with JWT interceptor
│   │   ├── utils/              ← platformFilter.js (Strict isolation & URL resolver)
│   │   ├── App.jsx             ← React Router DOM routing & global preference modal
│   │   └── main.jsx            ← Client bootstrap
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json             ← Production SPA rewrites
│
├── server/                     ← Node.js & Express REST API Backend
│   ├── src/
│   │   ├── config/             ← MongoDB Atlas connection handler
│   │   ├── controllers/        ← movieController, authController, reviewController, adminController
│   │   ├── middleware/         ← JWT auth, role validation, central error handler
│   │   ├── models/             ← Mongoose Schemas (User, Movie, Review, Watchlist, etc.)
│   │   ├── routes/             ← Express REST API modular routes
│   │   ├── seed/               ← Database seed script with 507 verified films
│   │   ├── app.js              ← Express app, CORS & middleware
│   │   └── server.js           ← HTTP listener
│   └── package.json
│
├── README.md                   ← Project documentation (this file)
├── DEMO_GUIDE.md               ← Faculty evaluation & viva demo walkthrough
└── vercel.json                 ← Monorepo configuration
```

---

## 📡 REST API Reference

All backend endpoints are prefixed with `/api` and return standardized JSON responses:

### 1. Movies & Discovery (`/api/movies`)
* `GET /api/movies` — Paginated catalog with multi-filter query parameters (`genre`, `mood`, `platform`, `language`, `freeOnly`, `availabilityStatus`, `minRating`, `sort`, `search`).
* `GET /api/movies/free` — Dedicated endpoint returning exclusively verified legal free cinema.
* `GET /api/movies/mood/:mood` — Tailored recommendations matching selected mood with curated rationale.
* `GET /api/movies/slug/:slug` — Single movie by clean URL slug with similar movies.
* `GET /api/movies/:id` — Single movie by MongoDB ObjectId.

### 2. Authentication (`/api/auth`)
* `POST /api/auth/register` — Public registration (creates standard `user` role).
* `POST /api/auth/login` — Authenticates credentials; returns signed JWT & user profile.
* `GET /api/auth/me` — Protected: Returns current authenticated session user.
* `PUT /api/auth/preferences` — Protected: Saves user's streaming platform and free-only preferences to MongoDB.

### 3. User Interactions
* `GET /api/watchlist` — Protected: Returns user's saved watchlist.
* `POST /api/watchlist/:movieId` — Protected: Adds movie to watchlist (enforces uniqueness).
* `DELETE /api/watchlist/:movieId` — Protected: Removes movie from watchlist.
* `GET /api/favourites` — Protected: Returns user's favourite movies.
* `POST /api/favourites/:movieId` — Protected: Adds movie to favourites.
* `DELETE /api/favourites/:movieId` — Protected: Removes movie from favourites.
* `GET /api/reviews/movie/:movieId` — Public: Returns community reviews and ratings.
* `POST /api/reviews/movie/:movieId` — Protected: Submits star rating (1–5) and review comment.

### 4. System Health
* `GET /api/health` — Cloud health monitor reporting uptime, service name, and timestamp.

---

## 💻 Quick Start & Local Setup

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** Local MongoDB or MongoDB Atlas URI

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/Dhruvi-tech/Moodflix.git
cd Moodflix

# 2. Setup Backend
cd server
npm install
cp .env.example .env
npm start

# 3. Setup Frontend (in a second terminal)
cd ../client
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Pre-Configured Demo Credentials

For quick evaluation without registering a new account:

| Account Type | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Demo User** | `guest@moodflix.com` | `Guest@123456` | Pre-populated Watchlist, Favourites, and Reviews |
| **Administrator** | `admin@moodflix.com` | `Admin@123456` | Full platform access & Admin Dashboard (`/admin`) |

*(Alternatively, click the **1-Click "Continue as Guest"** button on the Login page).*

---

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

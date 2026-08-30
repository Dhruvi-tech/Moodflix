<p align="center">
  <img src="assets/logo.svg" alt="MoodFlix Logo" width="600" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</p>

<p align="center">
  <a href="#-the-moods">The Moods</a> â€¢
  <a href="#-key-features">Key Features</a> â€¢
  <a href="#-vibe-gallery">Vibe Gallery</a> â€¢
  <a href="#-getting-started">Getting Started</a> â€¢
  <a href="#-project-architecture">Architecture</a>
</p>

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

## ðŸ“– Introduction

**MoodFlix** is a serverless, interactive web application designed to recommend movies based on your current emotional state. Whether you want to boost a happy mood, dive into an intense thriller, or relax with a comforting chill vibe, MoodFlix uses a lightweight client-side filter engine to curate the perfect watchlist instantly.

Built entirely using **Vanilla HTML5, CSS3, and JavaScript**, the app demonstrates responsive design, clean modular components, and polished micro-animations.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-moods.svg" alt="The Moods" width="800" />

MoodFlix categorizes recommendations into six distinct emotional palettes, designed to fit your current state of mind:

| Mood | Vibe Tagline |
| :---: | :--- |
| **â˜€ï¸ Happy** | Wholesome, feel-good films to lift your spirits and make you smile. |
| **ðŸŒ§ï¸ Sad** | Deep, emotional stories with heart and poignant narrative arcs. |
| **ðŸ”ª Thriller** | High-stakes suspense, mysteries, and jaw-dropping plot twists. |
| **ðŸ’« Romantic** | Lighthearted, cozy, and heartwarming tales of connection. |
| **ðŸŒ™ Chill** | Relaxing, easy-going movies to help you wind down after a long day. |
| **âš¡ Adventurous** | Action-packed exploration, fantasy quests, and epic journeys. |

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-features.svg" alt="Key Features" width="800" />

### ðŸŽ¬ **Smart Recommendation Engine**
- Filters and loads customized movie recommendations dynamically upon clicking a mood.
- Displays rich media cards showing movie titles, release years, genre tags, platform availability (Netflix, Prime Video, YouTube), and concise summaries.

### ðŸ”” **Polished UI & Micro-Animations**
- Custom-designed glassmorphism components with soft gradient backgrounds.
- Responsive navigation bar with active scrolling shadow effects and a modular mobile hamburger menu.
- Smooth transitions and hover animations on the interactive mood selector cards.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-gallery.svg" alt="Vibe Gallery" width="800" />

Here is a visual preview of some premium movie recommendations you will discover:

<p align="center">
  <img src="assets/posters/little-miss-sunshine.jpg" width="220" alt="Little Miss Sunshine" style="border-radius: 8px; margin: 10px;" />
  <img src="assets/posters/spirited-away.jpg" width="220" alt="Spirited Away" style="border-radius: 8px; margin: 10px;" />
  <img src="assets/posters/lotr-fellowship.jpg" width="220" alt="Lord of the Rings" style="border-radius: 8px; margin: 10px;" />
</p>

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-start.svg" alt="Getting Started" width="800" />

Getting MoodFlix running locally on your computer takes less than 5 seconds.

### **Run Instantly:**
1. Clone or download this repository to your computer.
2. Locate the file **`index.html`** in the root folder.
3. **Double-click `index.html`** to launch the platform instantly in your browser!

> [!TIP]
> **VS Code Live Server:** For the absolute best development experience (complete with hot-reloading and accurate responsiveness testing), right-click `index.html` and select **Open with Live Server**.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-architecture.svg" alt="Project Architecture" width="800" />

The exact repository files and directory layout are structured as follows:

```
Moodflix/
â”œâ”€â”€ .gitignore              â† Git ignore configuration rules
â”œâ”€â”€ HOW_TO_RUN.txt          â† Plaintext quick-start usage guidelines
â”œâ”€â”€ LICENSE                 â† Project open-source license permissions
â”œâ”€â”€ README.md               â† Project documentation (this file)
â”œâ”€â”€ index.html              â† Main HTML document skeleton and UI container
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ divider.svg         â† Animated gradient divider line
â”‚   â”œâ”€â”€ logo.svg            â† Animated text logo
â”‚   â”œâ”€â”€ header-moods.svg        â† Animated section header (The Moods)
â”‚   â”œâ”€â”€ header-features.svg     â† Animated section header (Key Features)
â”‚   â”œâ”€â”€ header-gallery.svg      â† Animated section header (Vibe Gallery)
â”‚   â”œâ”€â”€ header-start.svg        â† Animated section header (Getting Started)
â”‚   â”œâ”€â”€ header-architecture.svg â† Animated section header (Architecture)
â”‚   â”œâ”€â”€ header-walkthrough.svg  â† Animated section header (Walkthrough)
â”‚   â”œâ”€â”€ header-contributors.svg  â† Animated section header (Contributors)
â”‚   â””â”€â”€ posters/            â† Local movie poster image repository (.jpg)
â”œâ”€â”€ css/
â”‚   â”œâ”€â”€ components.css      â† Toast banners & movie recommendation card layout
â”‚   â”œâ”€â”€ layout.css          â† Core grid layout, header, footer, & navigation bar
â”‚   â”œâ”€â”€ mood-picker.css     â† Mood selection grid, glassmorphic cards, and hover FX
â”‚   â””â”€â”€ variables.css       â† Theme colors, custom design tokens, and root styles
â””â”€â”€ js/
    â”œâ”€â”€ components.js       â† Dynamic HTML template parsing & DOM element factories
    â”œâ”€â”€ layout.js           â† Mobile navigation drawer handler & navbar scroll shadow
    â”œâ”€â”€ mood-engine.js      â† Main recommendations filter & alert handlers
    â””â”€â”€ movie-data.js       â† Local structured movie list object database
```

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-walkthrough.svg" alt="Interactive Walkthrough" width="800" />

Experience all the features of MoodFlix by trying these quick steps:

1. **Scroll Reveal**: Click the **Pick your mood** CTA button in the hero banner. The viewport will scroll smoothly to the interactive grid.
2. **Select Vibe**: Select **Happy** or **Thriller**. Watch the movie recommendation container slide into view.
3. **Mobile Layout**: Open DevTools (`F12`), switch to mobile view, and tap the hamburger icon to toggle the slide-out navigation menu.

<p align="center">
  <img src="assets/divider.svg" alt="Divider" width="800" />
</p>

<img src="assets/header-contributors.svg" alt="Contributors" width="800" />

- ðŸš€ **Dhruvi Mittal** (@Dhruvi-tech)
- ðŸŽ¨ **Archana** (@Archana4413)
- ðŸ’» **Gedila Bimala** (@gedilabimalabsc24-code)

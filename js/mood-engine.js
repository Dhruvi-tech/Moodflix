(function () {
  const data = () => window.MOODFLIX_DATA;

  function init() {
    if (!data()) return;

    renderMoodCards();
    bindMoodClicks();
    setPreviewDefault();
  }

  function renderMoodCards() {
    const grid = document.getElementById('mood-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(data().moods)
      .map(
        ([id, mood]) => `
        <button type="button" class="mood-chip" data-mood="${id}"
          style="--mood-accent: ${mood.accent}" aria-pressed="false">
          <span class="mood-chip__emoji">${mood.emoji}</span>
          <span class="mood-chip__name">${mood.label}</span>
          <span class="mood-chip__tag">${mood.tagline}</span>
        </button>`
      )
      .join('');
  }

  function bindMoodClicks() {
    document.getElementById('mood-grid')?.addEventListener('click', (event) => {
      const chip = event.target.closest('.mood-chip');
      if (chip) selectMood(chip.dataset.mood);
    });
  }

  function setPreviewDefault() {
    document.getElementById('preview-title').textContent = 'Pick a mood to begin';
    document.getElementById('preview-sub').textContent = 'Choose a mood above to see 5–6 curated picks.';
    document.getElementById('preview-hint').hidden = false;
    document.getElementById('movie-grid').innerHTML = '';
    document.getElementById('movie-preview').classList.remove('is-live');
  }

  function selectMood(moodId) {
    const mood = data().moods[moodId];
    if (!mood) return;

    document.querySelectorAll('.mood-chip').forEach((chip) => {
      const active = chip.dataset.mood === moodId;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    document.getElementById('preview-title').textContent = `${mood.emoji} ${mood.label} picks`;
    document.getElementById('preview-sub').textContent = mood.tagline;
    document.getElementById('preview-hint').hidden = true;
    document.getElementById('movie-preview').classList.add('is-live');

    renderMovies(mood.movies);
    document.getElementById('movie-preview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderMovies(movies) {
    const grid = document.getElementById('movie-grid');
    const platforms = data().platforms;

    grid.innerHTML = movies
      .map((movie, index) => {
        const platform = platforms[movie.platform];
        return `
        <article class="movie-card movie-card--${movie.platform}" style="animation-delay: ${index * 0.07}s">
          <div class="movie-card__poster">
            <img src="${movie.poster}" alt="${movie.title} poster" loading="lazy"
              onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450/1a1a1a/888?text=${encodeURIComponent(movie.title)}';" />
            <span class="movie-card__badge movie-card__badge--${movie.platform}">
              ${platform.name}
            </span>
          </div>
          <div class="movie-card__body">
            <h3 class="movie-card__title">${movie.title}</h3>
            <p class="movie-card__meta">
              <span>${movie.year}</span>
              <span aria-hidden="true">·</span>
              <span>${movie.genre}</span>
            </p>
            <p class="movie-card__desc">${movie.overview}</p>
          </div>
        </article>`;
      })
      .join('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();

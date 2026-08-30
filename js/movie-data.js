(function (global) {
  function movie(title, year, genre, platform, overview, posterSlug) {
    return {
      title,
      year,
      genre,
      platform,
      overview,
      poster: `assets/posters/${posterSlug}.jpg`,
    };
  }

  global.MOODFLIX_DATA = {
    platforms: {
      netflix: { name: 'Netflix', short: 'N' },
      prime: { name: 'Amazon Prime Video', short: 'Prime' },
      youtube: { name: 'YouTube', short: 'YT' },
    },

    moods: {
      happy: {
        label: 'Happy',
        emoji: '☀️',
        accent: '#f5c518',
        tagline: 'Feel-good films to lift your mood',
        movies: [
          movie('The Mitchells vs. the Machines', 2021, 'Animation, Comedy', 'netflix', 'A quirky family saves the world during a robot uprising.', 'mitchells-vs-machines'),
          movie('Leo', 2023, 'Animation, Comedy', 'netflix', 'A class pet lizard shares life lessons from inside his terrarium.', 'leo'),
          movie('The Intern', 2015, 'Comedy, Drama', 'prime', 'A retired widower becomes a senior intern at an online fashion site.', 'the-intern'),
          movie('Paddington', 2014, 'Family, Comedy', 'prime', 'A bear from Peru finds a home with a kind London family.', 'paddington'),
          movie('School of Rock', 2003, 'Comedy, Music', 'youtube', 'A failed musician turns a class into a rock band.', 'school-of-rock'),
          movie('The Secret Life of Walter Mitty', 2013, 'Adventure, Comedy', 'youtube', 'A daydreamer embarks on a real global adventure.', 'walter-mitty'),
        ],
      },

      sad: {
        label: 'Sad',
        emoji: '🌧️',
        accent: '#6b9bd1',
        tagline: 'Emotional stories with heart',
        movies: [
          movie('Wonder', 2017, 'Drama, Family', 'netflix', 'A boy with facial differences starts mainstream school for the first time.', 'wonder'),
          movie('The Pursuit of Happyness', 2006, 'Drama, Biography', 'netflix', 'A father and son fight homelessness while chasing a dream job.', 'pursuit-happyness'),
          movie('A Walk to Remember', 2002, 'Romance, Drama', 'prime', 'A rebellious teen falls for the minister\'s quiet daughter.', 'walk-to-remember'),
          movie('The Fault in Our Stars', 2014, 'Romance, Drama', 'prime', 'Two teens with cancer share an unforgettable love story.', 'fault-in-our-stars'),
          movie('The Boy Who Harnessed the Wind', 2019, 'Drama, Biography', 'youtube', 'A boy builds a wind turbine to save his village from famine.', 'boy-who-harnessed-the-wind'),
          movie('The Perks of Being a Wallflower', 2012, 'Drama, Romance', 'youtube', 'A shy freshman finds friendship and first love in high school.', 'perks-wallflower'),
        ],
      },

      thriller: {
        label: 'Thriller',
        emoji: '🔪',
        accent: '#ef4444',
        tagline: 'Suspense and mystery',
        movies: [
          movie('Knives Out', 2019, 'Mystery, Comedy', 'netflix', 'A detective investigates a wealthy family after a patriarch\'s death.', 'knives-out'),
          movie('Now You See Me', 2013, 'Thriller, Mystery', 'netflix', 'Illusionists pull off heists during performances and stay ahead of the FBI.', 'now-you-see-me'),
          movie('Enola Holmes', 2020, 'Mystery, Adventure', 'prime', 'Sherlock\'s teen sister searches for their missing mother.', 'enola-holmes'),
          movie('Glass Onion', 2022, 'Mystery, Comedy', 'prime', 'Detective Benoit Blanc investigates a murder at a billionaire\'s island.', 'glass-onion'),
          movie('Source Code', 2011, 'Sci-Fi, Thriller', 'youtube', 'A soldier relives a train bombing to find the bomber.', 'source-code'),
          movie('The Prestige', 2006, 'Drama, Mystery', 'youtube', 'Two rival magicians obsess over creating the ultimate illusion.', 'the-prestige'),
        ],
      },

      romantic: {
        label: 'Romantic',
        emoji: '💫',
        accent: '#f472b6',
        tagline: 'Light, wholesome love stories',
        movies: [
          movie("To All the Boys I've Loved Before", 2018, 'Romance, Comedy', 'netflix', 'Secret love letters are mailed, sparking sweet and unexpected crushes.', 'to-all-the-boys'),
          movie('Always Be My Maybe', 2019, 'Romance, Comedy', 'netflix', 'Childhood friends reunite as adults and rediscover their connection.', 'always-be-my-maybe'),
          movie('The Half of It', 2020, 'Romance, Comedy', 'prime', 'A shy teen helps a friend write love letters while finding her own voice.', 'half-of-it'),
          movie('Love at First Sight', 2023, 'Romance, Comedy', 'prime', 'Two strangers meet on a flight and wonder if fate brought them together.', 'love-at-first-sight'),
          movie('The Perfect Date', 2019, 'Romance, Comedy', 'youtube', 'A high-schooler offers himself as a stand-in date for hire.', 'perfect-date'),
          movie('The Princess Bride', 1987, 'Adventure, Romance', 'youtube', 'A classic fairy tale with pirates, giants, and true love.', 'princess-bride'),
        ],
      },

      chill: {
        label: 'Chill',
        emoji: '🌙',
        accent: '#34d399',
        tagline: 'Relaxing, easy watches',
        movies: [
          movie('Chef', 2014, 'Comedy, Drama', 'netflix', 'A chef starts a food truck and reconnects with his son.', 'chef'),
          movie('The Intern', 2015, 'Comedy, Drama', 'netflix', 'A 70-year-old intern brings wisdom to a fast-paced startup.', 'the-intern'),
          movie('Paddington 2', 2017, 'Family, Comedy', 'prime', 'Paddington searches for a stolen pop-up book gift.', 'paddington2'),
          movie('Julie & Julia', 2009, 'Comedy, Drama', 'prime', 'Parallel stories of Julia Child and a blogger cooking every recipe.', 'julie-and-julia'),
          movie('The Secret Life of Walter Mitty', 2013, 'Adventure, Comedy', 'youtube', 'A quiet man finally lives the adventures he imagines.', 'walter-mitty'),
          movie('The Lego Movie', 2014, 'Animation, Comedy', 'youtube', 'An ordinary LEGO figure is mistaken for the prophesied hero.', 'lego-movie'),
        ],
      },

      adventurous: {
        label: 'Adventurous',
        emoji: '⚡',
        accent: '#fb923c',
        tagline: 'Action, exploration, and epic journeys',
        movies: [
          movie('The Martian', 2015, 'Sci-Fi, Adventure', 'netflix', 'An astronaut uses science to survive alone on Mars.', 'the-martian'),
          movie('Interstellar', 2014, 'Sci-Fi, Drama', 'netflix', 'Explorers travel through a wormhole to save humanity.', 'interstellar'),
          movie('Jumanji: Welcome to the Jungle', 2017, 'Adventure, Comedy', 'prime', 'Teens are sucked into a video game as adult avatars.', 'jumanji-welcome-jungle'),
          movie('National Treasure', 2004, 'Adventure, Mystery', 'prime', 'A historian hunts for treasure hidden by the Founding Fathers.', 'national-treasure'),
          movie('The Adam Project', 2022, 'Sci-Fi, Adventure', 'youtube', 'A pilot teams up with his younger self on a time-travel mission.', 'the-adam-project'),
          movie('The Sea Beast', 2022, 'Animation, Adventure', 'youtube', 'A famed hunter and a fearless girl challenge sea-monster myths.', 'sea-beast'),
        ],
      },
    },
  };
})(window);

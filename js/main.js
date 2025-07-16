// Main JavaScript for Anime Streaming Site
// Enhanced Security: Disable dev tools and right-click
(function() {
  'use strict';
  
  // Advanced dev tools detection and prevention
  let devtools = {
    open: false,
    orientation: null
  };
  
  // Multiple detection methods
  const threshold = 160;
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        // Redirect or close tab
        document.body.innerHTML = '<div style="background:#0a0a0a;color:#00ffff;height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:2rem;">Access Denied</div>';
        setTimeout(() => window.location.href = "about:blank", 1000);
      }
    } else {
      devtools.open = false;
    }
  }, 500);
  
  // Console detection
  let element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      document.body.innerHTML = '<div style="background:#0a0a0a;color:#ff0055;height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:2rem;">Console Access Blocked</div>';
      setTimeout(() => window.location.href = "about:blank", 1000);
    }
  });
  
  setInterval(() => {
    console.log(element);
    console.clear();
  }, 1000);
  
  // Disable keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+P
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'C', 'J', 'K'].includes(e.key)) ||
      (e.ctrlKey && ['U', 'S', 'A', 'P'].includes(e.key)) ||
      e.key === 'F5' ||
      (e.ctrlKey && e.key === 'R')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });
  
  // Disable right-click
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
  
  // Disable text selection
  document.addEventListener('selectstart', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());
  
  // Clear console periodically
  setInterval(() => {
    console.clear();
  }, 2000);
  
  // Detect debugging
  let start = Date.now();
  debugger;
  if (Date.now() - start > 100) {
    window.location.href = "about:blank";
  }
})();

// Global variables
let animeData = [];
let currentPage = 'home';
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || {
  watching: [],
  completed: [],
  planToWatch: []
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  loadAnimeData();
  setupEventListeners();
  hidePreloader();
});

// Initialize application
function initializeApp() {
  currentPage = getCurrentPage();
  setupNavigation();
  setupMobileMenu();
  
  // Initialize page-specific functionality
  switch(currentPage) {
    case 'home':
      initializeHomePage();
      break;
    case 'browse':
      initializeBrowsePage();
      break;
    case 'anime':
      initializeAnimePage();
      break;
    case 'watch':
      initializeWatchPage();
      break;
    case 'watchlist':
      initializeWatchlistPage();
      break;
  }
}

// Get current page from URL
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('browse')) return 'browse';
  if (path.includes('anime')) return 'anime';
  if (path.includes('watch')) return 'watch';
  if (path.includes('watchlist')) return 'watchlist';
  if (path.includes('about')) return 'about';
  return 'home';
}

// Load anime data from JSON
async function loadAnimeData() {
  try {
    const response = await fetch('data/anime.json');
    const data = await response.json();
    animeData = data.anime;
    
    // Trigger data loaded event
    document.dispatchEvent(new CustomEvent('animeDataLoaded', { detail: animeData }));
  } catch (error) {
    console.error('Error loading anime data:', error);
  }
}

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname;
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath || 
        (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Setup mobile menu
function setupMobileMenu() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchBar = document.querySelector('.search-bar');
  if (searchBar) {
    searchBar.addEventListener('input', handleSearch);
    searchBar.addEventListener('focus', showSearchResults);
    searchBar.addEventListener('blur', hideSearchResults);
  }
  
  // Theme toggle (if exists)
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Scroll animations
  setupScrollAnimations();
}

// Handle search functionality
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const searchResults = document.querySelector('.search-results');
  
  if (!searchResults) return;
  
  if (query.length === 0) {
    hideSearchResults();
    return;
  }
  
  const filteredAnime = animeData.filter(anime => 
    anime.title.toLowerCase().includes(query) ||
    anime.genre.some(g => g.toLowerCase().includes(query))
  );
  
  displaySearchResults(filteredAnime);
}

// Display search results
function displaySearchResults(results) {
  const searchResults = document.querySelector('.search-results');
  if (!searchResults) return;
  
  searchResults.innerHTML = '';
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
  } else {
    results.slice(0, 5).forEach(anime => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="${anime.poster}" alt="${anime.title}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 5px;">
          <div>
            <div style="font-weight: 500;">${anime.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${anime.year} • ${anime.genre.join(', ')}</div>
          </div>
        </div>
      `;
      item.addEventListener('click', () => {
        window.location.href = `anime.html?id=${anime.id}`;
      });
      searchResults.appendChild(item);
    });
  }
  
  showSearchResults();
}

// Show/hide search results
function showSearchResults() {
  const searchResults = document.querySelector('.search-results');
  if (searchResults) {
    searchResults.style.display = 'block';
  }
}

function hideSearchResults() {
  setTimeout(() => {
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
      searchResults.style.display = 'none';
    }
  }, 200);
}

// Theme toggle functionality
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Setup scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);
  
  // Observe elements with animation class
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Initialize home page
function initializeHomePage() {
  document.addEventListener('animeDataLoaded', () => {
    setupFeaturedCarousel();
    displayFeaturedAnime();
  });
}

// Setup featured carousel
function setupFeaturedCarousel() {
  const carousel = document.querySelector('.featured-carousel');
  if (!carousel) return;
  
  let currentSlide = 0;
  const slides = carousel.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;
  
  if (totalSlides === 0) return;
  
  // Auto-play carousel
  setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }, 5000);
  
  // Carousel controls
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateCarousel();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateCarousel();
    });
  }
  
  function updateCarousel() {
    const container = carousel.querySelector('.carousel-container');
    if (container) {
      container.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }
}

// Display featured anime
function displayFeaturedAnime() {
  const featuredGrid = document.querySelector('.featured-grid');
  if (!featuredGrid || animeData.length === 0) return;
  
  const featured = animeData.slice(0, 6);
  featuredGrid.innerHTML = featured.map(anime => createAnimeCard(anime)).join('');
}

// Create anime card HTML
function createAnimeCard(anime) {
  const statusColor = anime.status === 'Ongoing' ? 'var(--neon-cyan)' : 'var(--cursed-purple)';
  const episodeCount = anime.episodes ? anime.episodes.length : 0;
  
  return `
    <div class="anime-card animate-on-scroll" onclick="goToAnime('${anime.id}')" data-anime-id="${anime.id}">
      <div class="card-image-container">
        <img src="${anime.poster}" alt="${anime.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x600/1a1a1a/00ffff?text=No+Image'">
        <div class="card-overlay">
          <div class="play-button">
            <i class="fas fa-play"></i>
          </div>
          <div class="card-actions">
            <button class="action-btn" onclick="event.stopPropagation(); toggleWatchlist('${anime.id}', 'planToWatch')" title="Add to Watchlist">
              <i class="fas fa-bookmark"></i>
            </button>
            <button class="action-btn" onclick="event.stopPropagation(); shareAnime('${anime.id}')" title="Share">
              <i class="fas fa-share"></i>
            </button>
          </div>
        </div>
        <div class="status-badge" style="background: ${statusColor};">${anime.status}</div>
        <div class="rating-badge">★ ${anime.rating}</div>
      </div>
      <div class="card-content">
        <h3 class="card-title" title="${anime.title}">${anime.title}</h3>
        <div class="card-meta">
          <span class="year"><i class="fas fa-calendar"></i> ${anime.year}</span>
          <span class="episodes"><i class="fas fa-play-circle"></i> ${episodeCount} EP</span>
          <span class="type"><i class="fas fa-tv"></i> ${anime.type}</span>
        </div>
        <div class="genre-tags">
          ${anime.genre.slice(0, 3).map(g => `<span class="genre-tag">${g}</span>`).join('')}
          ${anime.genre.length > 3 ? `<span class="genre-tag more">+${anime.genre.length - 3}</span>` : ''}
        </div>
        <div class="card-synopsis">
          <p>${anime.synopsis.length > 100 ? anime.synopsis.substring(0, 100) + '...' : anime.synopsis}</p>
        </div>
      </div>
    </div>
  `;
}

// Navigate to anime page
function goToAnime(animeId) {
  window.location.href = `anime.html?id=${animeId}`;
}

// Initialize browse page
function initializeBrowsePage() {
  document.addEventListener('animeDataLoaded', () => {
    console.log('Anime data loaded, displaying grid...', animeData.length, 'anime found');
    displayAnimeGrid();
    setupFilters();
    updateResultsCount();
  });
  
  // Also try to display immediately if data is already loaded
  if (animeData && animeData.length > 0) {
    console.log('Data already available, displaying immediately...');
    displayAnimeGrid();
    setupFilters();
    updateResultsCount();
  }
}

// Update results count
function updateResultsCount() {
  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    const visibleCards = document.querySelectorAll('.anime-card:not([style*="display: none"])').length;
    resultsCount.textContent = visibleCards;
  }
}

// Share anime function
function shareAnime(animeId) {
  const anime = animeData.find(a => a.id === animeId);
  if (!anime) return;
  
  if (navigator.share) {
    navigator.share({
      title: anime.title,
      text: `Check out ${anime.title} on AnimeZone!`,
      url: `${window.location.origin}/anime.html?id=${animeId}`
    });
  } else {
    // Fallback: copy to clipboard
    const url = `${window.location.origin}/anime.html?id=${animeId}`;
    navigator.clipboard.writeText(url).then(() => {
      // Show toast notification
      showToast('Link copied to clipboard!');
    });
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--neon-cyan);
    color: var(--primary-bg);
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    z-index: 10000;
    animation: slideInUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Display anime grid
function displayAnimeGrid(filteredData = null) {
  const animeGrid = document.querySelector('.anime-grid');
  if (!animeGrid) return;
  
  const dataToShow = filteredData || animeData;
  
  if (dataToShow.length === 0) {
    animeGrid.innerHTML = '<div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);"><i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><h3>No anime found</h3><p>Try adjusting your filters or search terms.</p></div>';
    return;
  }
  
  animeGrid.innerHTML = dataToShow.map(anime => createAnimeCard(anime)).join('');
  
  // Trigger animation for new cards
  setTimeout(() => {
    animeGrid.querySelectorAll('.anime-card').forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, index * 100);
    });
  }, 50);
}

// Setup filters
function setupFilters() {
  const genreFilters = document.querySelectorAll('.genre-filter');
  const statusFilter = document.querySelector('.status-filter');
  const yearFilter = document.querySelector('.year-filter');
  const typeFilter = document.querySelector('.type-filter');
  
  // Genre filters
  genreFilters.forEach(filter => {
    filter.addEventListener('change', applyFilters);
  });
  
  // Other filters
  [statusFilter, yearFilter, typeFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', applyFilters);
    }
  });
}

// Apply filters
function applyFilters() {
  const selectedGenres = Array.from(document.querySelectorAll('.genre-filter:checked'))
    .map(cb => cb.value);
  
  const selectedStatus = document.querySelector('.status-filter')?.value;
  const selectedYear = document.querySelector('.year-filter')?.value;
  const selectedType = document.querySelector('.type-filter')?.value;
  
  let filtered = animeData;
  
  // Apply genre filter
  if (selectedGenres.length > 0) {
    filtered = filtered.filter(anime => 
      selectedGenres.some(genre => anime.genre.includes(genre))
    );
  }
  
  // Apply status filter
  if (selectedStatus && selectedStatus !== 'all') {
    filtered = filtered.filter(anime => anime.status === selectedStatus);
  }
  
  // Apply year filter
  if (selectedYear && selectedYear !== 'all') {
    filtered = filtered.filter(anime => anime.year === selectedYear);
  }
  
  // Apply type filter
  if (selectedType && selectedType !== 'all') {
    filtered = filtered.filter(anime => anime.type === selectedType);
  }
  
  displayAnimeGrid(filtered);
}

// Initialize anime page
function initializeAnimePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const animeId = urlParams.get('id');
  
  if (animeId) {
    document.addEventListener('animeDataLoaded', () => {
      displayAnimeDetails(animeId);
    });
  }
}

// Display anime details
function displayAnimeDetails(animeId) {
  const anime = animeData.find(a => a.id === animeId);
  if (!anime) {
    document.body.innerHTML = '<div class="container"><h1>Anime not found</h1></div>';
    return;
  }
  
  // Update page title
  document.title = `${anime.title} - AnimeZone`;
  
  // Display anime information
  const animeInfo = document.querySelector('.anime-info');
  if (animeInfo) {
    animeInfo.innerHTML = `
      <div class="anime-poster">
        <img src="${anime.poster}" alt="${anime.title}">
        <button class="btn watchlist-btn" onclick="toggleWatchlist('${anime.id}', 'planToWatch')">
          Add to Watchlist
        </button>
      </div>
      <div class="anime-details">
        <h1 class="title-glitch" data-text="${anime.title}">${anime.title}</h1>
        <div class="anime-meta">
          <span class="rating">★ ${anime.rating}</span>
          <span class="year">${anime.year}</span>
          <span class="status">${anime.status}</span>
          <span class="type">${anime.type}</span>
        </div>
        <div class="genre-tags">
          ${anime.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
        </div>
        <div class="synopsis">
          <h3>Synopsis</h3>
          <p>${anime.synopsis}</p>
        </div>
      </div>
    `;
  }
  
  // Display episodes
  displayEpisodes(anime);
  
  // Display recommendations
  displayRecommendations(anime);
}

// Display episodes
function displayEpisodes(anime) {
  const episodesList = document.querySelector('.episodes-list');
  if (!episodesList) return;
  
  episodesList.innerHTML = anime.episodes.map(episode => `
    <div class="episode-item" onclick="watchEpisode('${anime.id}', ${episode.ep})">
      <div class="episode-number">EP ${episode.ep}</div>
      <div class="episode-info">
        <h4>${episode.title}</h4>
        <span class="episode-duration">${episode.duration}</span>
      </div>
      <div class="episode-actions">
        <i class="fas fa-play"></i>
      </div>
    </div>
  `).join('');
}

// Watch episode
function watchEpisode(animeId, episodeNumber) {
  window.location.href = `watch.html?id=${animeId}&ep=${episodeNumber}`;
}

// Display recommendations
function displayRecommendations(currentAnime) {
  const recommendationsGrid = document.querySelector('.recommendations-grid');
  if (!recommendationsGrid) return;
  
  // Get similar anime based on genre
  const similar = animeData.filter(anime => 
    anime.id !== currentAnime.id &&
    anime.genre.some(g => currentAnime.genre.includes(g))
  ).slice(0, 4);
  
  recommendationsGrid.innerHTML = similar.map(anime => createAnimeCard(anime)).join('');
}

// Initialize watch page
function initializeWatchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const animeId = urlParams.get('id');
  const episodeNumber = parseInt(urlParams.get('ep')) || 1;
  
  if (animeId) {
    document.addEventListener('animeDataLoaded', () => {
      setupVideoPlayer(animeId, episodeNumber);
    });
  }
}

// Setup video player
function setupVideoPlayer(animeId, episodeNumber) {
  const anime = animeData.find(a => a.id === animeId);
  if (!anime) return;
  
  const episode = anime.episodes.find(ep => ep.ep === episodeNumber);
  if (!episode) return;
  
  // Update page title
  document.title = `${anime.title} - Episode ${episodeNumber} - AnimeZone`;
  
  // Setup video
  const videoPlayer = document.querySelector('.video-player');
  if (videoPlayer) {
    videoPlayer.src = episode.video_url;
    videoPlayer.load();
  }
  
  // Setup episode navigation
  setupEpisodeNavigation(anime, episodeNumber);
  
  // Update watch history
  updateWatchHistory(animeId, episodeNumber);
}

// Setup episode navigation
function setupEpisodeNavigation(anime, currentEpisode) {
  const prevBtn = document.querySelector('.prev-episode');
  const nextBtn = document.querySelector('.next-episode');
  const episodeSelect = document.querySelector('.episode-select');
  
  // Previous episode
  if (prevBtn) {
    if (currentEpisode > 1) {
      prevBtn.onclick = () => {
        window.location.href = `watch.html?id=${anime.id}&ep=${currentEpisode - 1}`;
      };
    } else {
      prevBtn.disabled = true;
    }
  }
  
  // Next episode
  if (nextBtn) {
    if (currentEpisode < anime.episodes.length) {
      nextBtn.onclick = () => {
        window.location.href = `watch.html?id=${anime.id}&ep=${currentEpisode + 1}`;
      };
    } else {
      nextBtn.disabled = true;
    }
  }
  
  // Episode select
  if (episodeSelect) {
    episodeSelect.innerHTML = anime.episodes.map(ep => 
      `<option value="${ep.ep}" ${ep.ep === currentEpisode ? 'selected' : ''}>
        Episode ${ep.ep}: ${ep.title}
      </option>`
    ).join('');
    
    episodeSelect.addEventListener('change', (e) => {
      window.location.href = `watch.html?id=${anime.id}&ep=${e.target.value}`;
    });
  }
}

// Update watch history
function updateWatchHistory(animeId, episodeNumber) {
  let watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || {};
  watchHistory[animeId] = {
    lastEpisode: episodeNumber,
    timestamp: Date.now()
  };
  localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
}

// Watchlist functions
function toggleWatchlist(animeId, category = 'planToWatch') {
  const anime = animeData.find(a => a.id === animeId);
  if (!anime) return;
  
  // Remove from all categories first
  Object.keys(watchlist).forEach(cat => {
    watchlist[cat] = watchlist[cat].filter(id => id !== animeId);
  });
  
  // Add to specified category
  if (!watchlist[category].includes(animeId)) {
    watchlist[category].push(animeId);
  }
  
  // Save to localStorage
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  
  // Update UI
  updateWatchlistUI();
}

// Update watchlist UI
function updateWatchlistUI() {
  const watchlistBtn = document.querySelector('.watchlist-btn');
  if (watchlistBtn) {
    watchlistBtn.textContent = 'Added to Watchlist';
    watchlistBtn.classList.add('added');
  }
}

// Initialize watchlist page
function initializeWatchlistPage() {
  document.addEventListener('animeDataLoaded', () => {
    displayWatchlist();
  });
}

// Display watchlist
function displayWatchlist() {
  const categories = ['watching', 'completed', 'planToWatch'];
  
  categories.forEach(category => {
    const container = document.querySelector(`.${category}-list`);
    if (!container) return;
    
    const animeIds = watchlist[category] || [];
    const animeList = animeIds.map(id => animeData.find(a => a.id === id)).filter(Boolean);
    
    container.innerHTML = animeList.map(anime => createAnimeCard(anime)).join('');
  });
}

// Enhanced Preloader Animation System
function initializePreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;

  // Create particles
  createParticles();
  
  // Create GSAP timeline for orchestrated animations
  const tl = gsap.timeline();
  
  // Stage 1: Wave crash-in (0-1.5s)
  tl.to('.wave-1, .wave-2, .wave-3, .wave-4', {
    opacity: 1,
    scale: 1,
    rotation: 180,
    duration: 1.5,
    stagger: 0.3,
    ease: "power2.out"
  })
  
  // Stage 2: Energy rings activation (1s-2.5s)
  .to('.energy-ring-1, .energy-ring-2, .energy-ring-3', {
    opacity: 0.6,
    scale: 1.2,
    duration: 1.5,
    stagger: 0.5,
    ease: "power2.inOut"
  }, 1)
  
  // Stage 3: Logo materialization (1.5s-2.5s)
  .to('.preloader-logo', {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: "back.out(1.7)"
  }, 1.5)
  
  // Stage 4: Subtitle appearance (2s-2.8s)
  .to('.preloader-subtitle', {
    opacity: 1,
    duration: 0.8,
    ease: "power2.out"
  }, 2)
  
  // Stage 5: Progress bar and loading text (2.3s-3.5s)
  .to('.loading-progress', {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out"
  }, 2.3)
  .to('.loading-text', {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out"
  }, 2.5)
  
  // Stage 6: Screen flash effect (3.2s)
  .to('.screen-flash', {
    opacity: 0.8,
    duration: 0.2,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 1
  }, 3.2)
  
  // Stage 7: Final sweep and fade out (3.5s-4.5s)
  .to('.final-sweep', {
    left: '100%',
    opacity: 1,
    duration: 1,
    ease: "power2.inOut"
  }, 3.5)
  .to('.preloader', {
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    onComplete: () => {
      preloader.classList.add('hidden');
      // Trigger main content animations
      initializeMainContentAnimations();
    }
  }, 4);

  // Animate particles throughout
  animateParticles();
}

// Create particle system
function createParticles() {
  const particlesContainer = document.querySelector('.particles-container');
  if (!particlesContainer) return;

  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random positioning
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random size variation
    const size = Math.random() * 6 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    particlesContainer.appendChild(particle);
  }
}

// Animate particles
function animateParticles() {
  const particles = document.querySelectorAll('.particle');
  
  particles.forEach((particle, index) => {
    // Staggered appearance
    gsap.to(particle, {
      opacity: Math.random() * 0.8 + 0.2,
      duration: 0.5,
      delay: index * 0.05,
      ease: "power2.out"
    });
    
    // Floating animation
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 360,
      duration: Math.random() * 3 + 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 2
    });
    
    // Pulsing glow effect
    gsap.to(particle, {
      scale: Math.random() * 0.5 + 0.8,
      duration: Math.random() * 2 + 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 1
    });
  });
}

// Initialize main content animations after preloader
function initializeMainContentAnimations() {
  // Hero text animation with enhanced effects
  const heroTl = gsap.timeline();
  
  heroTl.from(".hero h1", {
    duration: 1.2,
    y: 80,
    opacity: 0,
    scale: 0.8,
    ease: "back.out(1.7)"
  })
  .from(".hero p", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power2.out"
  }, 0.3)
  .from(".search-container", {
    duration: 1,
    y: 50,
    opacity: 0,
    scale: 0.9,
    ease: "back.out(1.7)"
  }, 0.6)
  .from(".hero-actions", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power2.out"
  }, 0.9)
  .from(".floating-element", {
    duration: 1.5,
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    ease: "back.out(1.7)"
  }, 1.2);
}

// Hide preloader (enhanced version)
function hidePreloader() {
  // This function is now handled by the GSAP timeline
  // but kept for compatibility
  initializePreloader();
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export functions for global access
window.goToAnime = goToAnime;
window.watchEpisode = watchEpisode;
window.toggleWatchlist = toggleWatchlist;

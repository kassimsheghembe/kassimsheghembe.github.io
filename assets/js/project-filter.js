/**
 * Project Filter and Search Functionality
 * Handles filtering projects by technology, category, and search terms
 */
class ProjectFilter {
  constructor() {
    this.projects = [];
    this.activeFilters = {
      technologies: new Set(),
      categories: new Set(),
      search: ''
    };
    this.allProjects = [];
    this.init();
  }

  /**
   * Initialize the filter system
   */
  init() {
    this.loadProjects();
    this.bindEvents();
    this.initializeFromURL();
  }

  /**
   * Load projects from the DOM
   */
  loadProjects() {
    const projectCards = document.querySelectorAll('.project-card');
    this.allProjects = Array.from(projectCards).map(card => ({
      element: card,
      id: card.dataset.projectId,
      title: card.dataset.title?.toLowerCase() || '',
      description: card.dataset.description?.toLowerCase() || '',
      technologies: (card.dataset.technologies || '').split(',').map(t => t.trim()),
      category: card.dataset.category || '',
      year: parseInt(card.dataset.year) || 0,
      status: card.dataset.status || ''
    }));
    this.projects = [...this.allProjects];
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Search input
    const searchInput = document.getElementById('project-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setSearchTerm(e.target.value);
      });
    }

    // Technology filter buttons
    document.querySelectorAll('.tech-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tech = btn.dataset.technology;
        this.toggleTechnologyFilter(tech);
      });
    });

    // Category filter buttons
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = btn.dataset.category;
        this.toggleCategoryFilter(category);
      });
    });

    // Clear filters button
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearAllFilters();
      });
    }

    // Year filter (if implemented)
    const yearSelect = document.getElementById('year-filter');
    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        this.setYearFilter(e.target.value);
      });
    }
  }

  /**
   * Toggle technology filter
   */
  toggleTechnologyFilter(technology) {
    if (this.activeFilters.technologies.has(technology)) {
      this.activeFilters.technologies.delete(technology);
    } else {
      this.activeFilters.technologies.add(technology);
    }
    this.updateFilterUI();
    this.applyFilters();
    this.updateURL();
  }

  /**
   * Toggle category filter
   */
  toggleCategoryFilter(category) {
    if (this.activeFilters.categories.has(category)) {
      this.activeFilters.categories.delete(category);
    } else {
      this.activeFilters.categories.add(category);
    }
    this.updateFilterUI();
    this.applyFilters();
    this.updateURL();
  }

  /**
   * Set search term
   */
  setSearchTerm(term) {
    this.activeFilters.search = term.toLowerCase().trim();
    this.applyFilters();
    this.updateURL();
  }

  /**
   * Set year filter
   */
  setYearFilter(year) {
    this.activeFilters.year = year ? parseInt(year) : null;
    this.applyFilters();
    this.updateURL();
  }

  /**
   * Apply all active filters
   */
  applyFilters() {
    let filteredProjects = [...this.allProjects];

    // Apply technology filters
    if (this.activeFilters.technologies.size > 0) {
      filteredProjects = filteredProjects.filter(project => {
        return Array.from(this.activeFilters.technologies).some(tech => 
          project.technologies.includes(tech)
        );
      });
    }

    // Apply category filters
    if (this.activeFilters.categories.size > 0) {
      filteredProjects = filteredProjects.filter(project => {
        return this.activeFilters.categories.has(project.category);
      });
    }

    // Apply search filter
    if (this.activeFilters.search) {
      filteredProjects = filteredProjects.filter(project => {
        return project.title.includes(this.activeFilters.search) ||
               project.description.includes(this.activeFilters.search) ||
               project.technologies.some(tech => 
                 tech.toLowerCase().includes(this.activeFilters.search)
               );
      });
    }

    // Apply year filter
    if (this.activeFilters.year) {
      filteredProjects = filteredProjects.filter(project => {
        return project.year === this.activeFilters.year;
      });
    }

    this.projects = filteredProjects;
    this.renderResults();
    this.updateFilterStatus();
  }

  /**
   * Render filtered results
   */
  renderResults() {
    // Hide all projects first
    this.allProjects.forEach(project => {
      project.element.style.display = 'none';
      project.element.classList.remove('filter-match');
    });

    // Show filtered projects with animation
    if (this.projects.length > 0) {
      this.projects.forEach((project, index) => {
        setTimeout(() => {
          project.element.style.display = 'block';
          project.element.classList.add('filter-match');
        }, index * 50); // Stagger animation
      });
      this.hideNoResultsMessage();
    } else {
      this.showNoResultsMessage();
    }

    // Update results count
    this.updateResultsCount();
  }

  /**
   * Show no results message
   */
  showNoResultsMessage() {
    let noResultsDiv = document.getElementById('no-results-message');
    if (!noResultsDiv) {
      noResultsDiv = document.createElement('div');
      noResultsDiv.id = 'no-results-message';
      noResultsDiv.className = 'no-results-message';
      
      const projectsGrid = document.querySelector('.projects-grid');
      if (projectsGrid) {
        projectsGrid.parentNode.insertBefore(noResultsDiv, projectsGrid.nextSibling);
      }
    }

    noResultsDiv.innerHTML = `
      <div class="no-results-content">
        <i class="fas fa-search fa-3x mb-3"></i>
        <h3>No projects found</h3>
        <p>Try adjusting your filters or search terms.</p>
        <button class="btn btn-primary" onclick="projectFilter.clearAllFilters()">
          Clear All Filters
        </button>
      </div>
    `;
    noResultsDiv.style.display = 'block';
  }

  /**
   * Hide no results message
   */
  hideNoResultsMessage() {
    const noResultsDiv = document.getElementById('no-results-message');
    if (noResultsDiv) {
      noResultsDiv.style.display = 'none';
    }
  }

  /**
   * Update results count
   */
  updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
      const total = this.allProjects.length;
      const filtered = this.projects.length;
      countElement.textContent = `Showing ${filtered} of ${total} projects`;
    }
  }

  /**
   * Update filter UI state
   */
  updateFilterUI() {
    // Update technology filter buttons
    document.querySelectorAll('.tech-filter-btn').forEach(btn => {
      const tech = btn.dataset.technology;
      if (this.activeFilters.technologies.has(tech)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update category filter buttons
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      const category = btn.dataset.category;
      if (this.activeFilters.categories.has(category)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Update filter status display
   */
  updateFilterStatus() {
    const statusElement = document.getElementById('filter-status');
    if (!statusElement) return;

    const activeFiltersCount = 
      this.activeFilters.technologies.size + 
      this.activeFilters.categories.size + 
      (this.activeFilters.search ? 1 : 0) +
      (this.activeFilters.year ? 1 : 0);

    if (activeFiltersCount > 0) {
      statusElement.innerHTML = `
        <span class="filter-status-text">
          ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active
        </span>
        <button class="btn btn-sm btn-outline-secondary ms-2" onclick="projectFilter.clearAllFilters()">
          Clear All
        </button>
      `;
      statusElement.style.display = 'block';
    } else {
      statusElement.style.display = 'none';
    }
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.activeFilters.technologies.clear();
    this.activeFilters.categories.clear();
    this.activeFilters.search = '';
    this.activeFilters.year = null;

    // Reset UI elements
    const searchInput = document.getElementById('project-search');
    if (searchInput) searchInput.value = '';

    const yearSelect = document.getElementById('year-filter');
    if (yearSelect) yearSelect.value = '';

    this.updateFilterUI();
    this.applyFilters();
    this.updateURL();
  }

  /**
   * Initialize filters from URL parameters
   */
  initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Technology filters
    const techFilters = urlParams.get('tech');
    if (techFilters) {
      techFilters.split(',').forEach(tech => {
        this.activeFilters.technologies.add(tech.trim());
      });
    }

    // Category filters
    const categoryFilters = urlParams.get('category');
    if (categoryFilters) {
      categoryFilters.split(',').forEach(cat => {
        this.activeFilters.categories.add(cat.trim());
      });
    }

    // Search term
    const searchTerm = urlParams.get('search');
    if (searchTerm) {
      this.activeFilters.search = searchTerm;
      const searchInput = document.getElementById('project-search');
      if (searchInput) searchInput.value = searchTerm;
    }

    // Year filter
    const yearFilter = urlParams.get('year');
    if (yearFilter) {
      this.activeFilters.year = parseInt(yearFilter);
      const yearSelect = document.getElementById('year-filter');
      if (yearSelect) yearSelect.value = yearFilter;
    }

    this.updateFilterUI();
    this.applyFilters();
  }

  /**
   * Update URL with current filter state
   */
  updateURL() {
    const params = new URLSearchParams();

    if (this.activeFilters.technologies.size > 0) {
      params.set('tech', Array.from(this.activeFilters.technologies).join(','));
    }

    if (this.activeFilters.categories.size > 0) {
      params.set('category', Array.from(this.activeFilters.categories).join(','));
    }

    if (this.activeFilters.search) {
      params.set('search', this.activeFilters.search);
    }

    if (this.activeFilters.year) {
      params.set('year', this.activeFilters.year.toString());
    }

    const newURL = params.toString() ? 
      `${window.location.pathname}?${params.toString()}` : 
      window.location.pathname;

    window.history.replaceState({}, '', newURL);
  }

  /**
   * Get filter statistics
   */
  getFilterStats() {
    return {
      totalProjects: this.allProjects.length,
      filteredProjects: this.projects.length,
      activeFilters: {
        technologies: Array.from(this.activeFilters.technologies),
        categories: Array.from(this.activeFilters.categories),
        search: this.activeFilters.search,
        year: this.activeFilters.year
      }
    };
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.projectFilter = new ProjectFilter();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectFilter;
}

// Project Gallery Lightbox Functionality
function initializeProjectGallery(projectId) {
  const gallery = document.querySelector(`[data-project="${projectId}"]`);
  const lightbox = document.getElementById(`gallery-lightbox-${projectId}`);
  
  if (!gallery || !lightbox) return;
  
  const galleryItems = gallery.querySelectorAll('.gallery-item');
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');
  const currentImageSpan = lightbox.querySelector('.current-image');
  const totalImagesSpan = lightbox.querySelector('.total-images');
  const prevButton = lightbox.querySelector('.lightbox-prev');
  const nextButton = lightbox.querySelector('.lightbox-next');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const overlay = lightbox.querySelector('.lightbox-overlay');
  const loading = lightbox.querySelector('.lightbox-loading');
  
  let currentIndex = 0;
  let images = [];
  
  // Initialize gallery data
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('.gallery-thumbnail');
    const caption = item.querySelector('.gallery-caption');
    
    if (img) {
      images.push({
        src: img.dataset.fullSrc || img.src,
        alt: img.alt,
        caption: caption ? caption.textContent : ''
      });
      
      // Add click event to thumbnail
      item.addEventListener('click', () => {
        openLightbox(index);
      });
    }
  });
  
  // Update total images count
  if (totalImagesSpan) {
    totalImagesSpan.textContent = images.length;
  }
  
  function openLightbox(index) {
    currentIndex = index;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadImage(currentIndex);
    updateNavigation();
    updateCounter();
    
    // Focus management for accessibility
    lightbox.setAttribute('aria-hidden', 'false');
    closeButton.focus();
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightbox.setAttribute('aria-hidden', 'true');
  }
  
  function loadImage(index) {
    if (index < 0 || index >= images.length) return;
    
    const imageData = images[index];
    
    // Show loading state
    loading.style.display = 'block';
    lightboxImage.style.display = 'none';
    
    // Update content
    lightboxTitle.textContent = imageData.alt || `Image ${index + 1}`;
    lightboxCaption.textContent = imageData.caption || '';
    
    // Load new image
    const newImage = new Image();
    newImage.onload = function() {
      lightboxImage.src = this.src;
      lightboxImage.alt = imageData.alt;
      loading.style.display = 'none';
      lightboxImage.style.display = 'block';
    };
    
    newImage.onerror = function() {
      loading.style.display = 'none';
      lightboxImage.style.display = 'block';
      lightboxImage.src = '/assets/images/placeholder-project.jpg';
      lightboxImage.alt = 'Image failed to load';
    };
    
    newImage.src = imageData.src;
  }
  
  function updateNavigation() {
    if (prevButton && nextButton) {
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === images.length - 1;
    }
  }
  
  function updateCounter() {
    if (currentImageSpan) {
      currentImageSpan.textContent = currentIndex + 1;
    }
  }
  
  function goToPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      loadImage(currentIndex);
      updateNavigation();
      updateCounter();
    }
  }
  
  function goToNext() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      loadImage(currentIndex);
      updateNavigation();
      updateCounter();
    }
  }
  
  // Event listeners
  if (closeButton) {
    closeButton.addEventListener('click', closeLightbox);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeLightbox);
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', goToPrevious);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', goToNext);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  });
  
  // Enhanced touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  let touchStartTime = 0;
  
  lightbox.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    touchStartTime = Date.now();
  }, { passive: true });
  
  lightbox.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const timeThreshold = 500;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const timeDiff = Date.now() - touchStartTime;
    
    // Only process swipes that are fast enough and primarily horizontal
    if (timeDiff < timeThreshold && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        // Swipe left - next image
        goToNext();
      } else {
        // Swipe right - previous image
        goToPrevious();
      }
    }
  }
}
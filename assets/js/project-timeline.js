/**
 * Project Timeline
 * Handles the main grid/timeline view toggle, chronological sorting,
 * year-based filtering, and scroll-based reveal animations.
 */
class ProjectTimeline {
  constructor() {
    this.timelineView = document.getElementById('timeline-view');
    this.gridView = document.getElementById('grid-view');
    this.filterControls = document.getElementById('grid-filter-controls');
    this.timelineTrack = document.getElementById('timeline-track');

    if (!this.timelineView) return;

    this.yearGroups = Array.from(document.querySelectorAll('.timeline-year-group'));
    this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
    this.yearPills = Array.from(document.querySelectorAll('.year-pill'));
    this.mainToggleBtns = Array.from(document.querySelectorAll('#main-view-toggle .view-toggle-btn'));
    this.sortBtn = document.querySelector('.sort-btn');

    this.activeYear = 'all';
    this.currentView = 'grid';
    this.sortDirection = 'desc';

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupScrollReveal();
  }

  bindEvents() {
    // Main view toggle (grid <-> timeline)
    this.mainToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchMainView(btn.dataset.view);
      });
    });

    // Year navigation pills
    this.yearPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.filterByYear(pill.dataset.year);
      });
    });

    // Sort toggle
    if (this.sortBtn) {
      this.sortBtn.addEventListener('click', () => {
        this.toggleSort();
      });
    }
  }

  /**
   * Switch between grid and timeline views
   */
  switchMainView(view) {
    this.currentView = view;

    // Update toggle button states
    this.mainToggleBtns.forEach(btn => {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (view === 'timeline') {
      // Hide grid and filter controls, show timeline
      this.gridView.style.display = 'none';
      this.filterControls.style.display = 'none';
      this.timelineView.style.display = 'block';

      // Trigger reveal animations
      requestAnimationFrame(() => this.revealVisibleItems());
    } else {
      // Show grid and filter controls, hide timeline
      this.gridView.style.display = '';
      this.filterControls.style.display = '';
      this.timelineView.style.display = 'none';
    }
  }

  /**
   * Filter timeline by year
   */
  filterByYear(year) {
    this.activeYear = year;

    // Update pill states
    this.yearPills.forEach(pill => {
      const isActive = pill.dataset.year === year;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Show/hide year groups
    this.yearGroups.forEach(group => {
      if (year === 'all' || group.dataset.year === year) {
        group.classList.remove('hidden');
      } else {
        group.classList.add('hidden');
      }
    });

    // Reset and re-trigger reveal for newly visible items
    this.timelineItems.forEach(item => {
      if (!item.closest('.timeline-year-group.hidden')) {
        item.classList.remove('visible');
      }
    });

    requestAnimationFrame(() => this.revealVisibleItems());
  }

  /**
   * Toggle sort direction
   */
  toggleSort() {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';

    // Update button icon and text
    const icon = this.sortBtn.querySelector('i');
    const text = this.sortBtn.querySelector('span');

    if (this.sortDirection === 'desc') {
      icon.className = 'fas fa-sort-amount-down';
      text.textContent = 'Newest First';
      this.sortBtn.setAttribute('aria-label', 'Sort order: newest first');
    } else {
      icon.className = 'fas fa-sort-amount-up';
      text.textContent = 'Oldest First';
      this.sortBtn.setAttribute('aria-label', 'Sort order: oldest first');
    }

    // Reverse the order of year groups in the DOM
    const track = this.timelineTrack;
    const groups = Array.from(track.querySelectorAll('.timeline-year-group'));
    groups.reverse().forEach(group => {
      track.appendChild(group);
    });

    // Reset and re-trigger animations
    this.timelineItems.forEach(item => {
      item.classList.remove('visible');
    });

    requestAnimationFrame(() => this.revealVisibleItems());
  }

  /**
   * Setup IntersectionObserver for scroll reveal
   */
  setupScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      this.timelineItems.forEach(item => item.classList.add('visible'));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    this.timelineItems.forEach(item => {
      this.observer.observe(item);
    });
  }

  /**
   * Immediately reveal items that are in the viewport
   */
  revealVisibleItems() {
    this.timelineItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      const notHidden = !item.closest('.timeline-year-group.hidden');

      if (inViewport && notHidden) {
        item.classList.add('visible');
      }

      // Re-observe items not yet visible
      if (!item.classList.contains('visible') && this.observer) {
        this.observer.observe(item);
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  window.projectTimeline = new ProjectTimeline();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectTimeline;
}

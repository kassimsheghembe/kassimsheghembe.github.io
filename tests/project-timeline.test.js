/**
 * @jest-environment jsdom
 */

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observedElements = [];
  }
  observe(el) { this.observedElements.push(el); }
  unobserve(el) {
    this.observedElements = this.observedElements.filter(e => e !== el);
  }
  disconnect() { this.observedElements = []; }
  // Helper to simulate intersection
  simulateIntersection(entries) {
    this.callback(entries, this);
  }
}

beforeAll(() => {
  window.IntersectionObserver = MockIntersectionObserver;
});

const ProjectTimeline = require('../assets/js/project-timeline');

function setupTimelineDOM() {
  document.body.innerHTML = `
    <div id="main-view-toggle">
      <button class="view-toggle-btn active" data-view="grid" aria-pressed="true">Grid</button>
      <button class="view-toggle-btn" data-view="timeline" aria-pressed="false">Timeline</button>
    </div>
    <div id="grid-view" style="display: block;">
      <div class="projects-grid">
        <div class="project-card">Project 1</div>
      </div>
    </div>
    <div id="grid-filter-controls" style="display: block;">
      <input type="text" id="project-search" />
    </div>
    <div id="timeline-view" style="display: none;">
      <div class="timeline-nav">
        <button class="year-pill active" data-year="all" aria-pressed="true">All</button>
        <button class="year-pill" data-year="2025" aria-pressed="false">2025</button>
        <button class="year-pill" data-year="2024" aria-pressed="false">2024</button>
      </div>
      <button class="sort-btn" aria-label="Sort order: newest first">
        <i class="fas fa-sort-amount-down"></i>
        <span>Newest First</span>
      </button>
      <div id="timeline-track">
        <div class="timeline-year-group" data-year="2025">
          <div class="timeline-item" id="item-2025-1">Project A (2025)</div>
          <div class="timeline-item" id="item-2025-2">Project B (2025)</div>
        </div>
        <div class="timeline-year-group" data-year="2024">
          <div class="timeline-item" id="item-2024-1">Project C (2024)</div>
        </div>
      </div>
    </div>
  `;
}

describe('ProjectTimeline', () => {
  let timeline;

  beforeEach(() => {
    setupTimelineDOM();
    timeline = new ProjectTimeline();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('finds the timeline and grid view elements', () => {
      expect(timeline.timelineView).not.toBeNull();
      expect(timeline.gridView).not.toBeNull();
    });

    test('initializes with grid view active', () => {
      expect(timeline.currentView).toBe('grid');
    });

    test('initializes with "all" year filter', () => {
      expect(timeline.activeYear).toBe('all');
    });

    test('initializes with descending sort', () => {
      expect(timeline.sortDirection).toBe('desc');
    });

    test('discovers all timeline items', () => {
      expect(timeline.timelineItems.length).toBe(3);
    });

    test('discovers all year groups', () => {
      expect(timeline.yearGroups.length).toBe(2);
    });

    test('sets up IntersectionObserver for scroll reveal', () => {
      expect(timeline.observer).toBeDefined();
      expect(timeline.observer).toBeInstanceOf(MockIntersectionObserver);
    });
  });

  describe('View Switching', () => {
    test('switches to timeline view', () => {
      timeline.switchMainView('timeline');
      expect(timeline.currentView).toBe('timeline');
      expect(timeline.timelineView.style.display).toBe('block');
      expect(timeline.gridView.style.display).toBe('none');
      expect(timeline.filterControls.style.display).toBe('none');
    });

    test('switches back to grid view', () => {
      timeline.switchMainView('timeline');
      timeline.switchMainView('grid');
      expect(timeline.currentView).toBe('grid');
      expect(timeline.gridView.style.display).toBe('');
      expect(timeline.filterControls.style.display).toBe('');
      expect(timeline.timelineView.style.display).toBe('none');
    });

    test('updates toggle button states', () => {
      timeline.switchMainView('timeline');
      const gridBtn = document.querySelector('[data-view="grid"]');
      const timelineBtn = document.querySelector('[data-view="timeline"]');

      expect(gridBtn.classList.contains('active')).toBe(false);
      expect(gridBtn.getAttribute('aria-pressed')).toBe('false');
      expect(timelineBtn.classList.contains('active')).toBe(true);
      expect(timelineBtn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Year Filtering', () => {
    test('filters to show only selected year', () => {
      timeline.filterByYear('2025');
      expect(timeline.activeYear).toBe('2025');

      const group2025 = document.querySelector('[data-year="2025"].timeline-year-group');
      const group2024 = document.querySelector('[data-year="2024"].timeline-year-group');

      expect(group2025.classList.contains('hidden')).toBe(false);
      expect(group2024.classList.contains('hidden')).toBe(true);
    });

    test('shows all year groups when "all" is selected', () => {
      timeline.filterByYear('2025');
      timeline.filterByYear('all');

      const groups = document.querySelectorAll('.timeline-year-group');
      groups.forEach(group => {
        expect(group.classList.contains('hidden')).toBe(false);
      });
    });

    test('updates year pill states', () => {
      timeline.filterByYear('2024');

      const allPill = document.querySelector('[data-year="all"]');
      const pill2024 = document.querySelector('.year-pill[data-year="2024"]');
      const pill2025 = document.querySelector('.year-pill[data-year="2025"]');

      expect(allPill.classList.contains('active')).toBe(false);
      expect(pill2024.classList.contains('active')).toBe(true);
      expect(pill2025.classList.contains('active')).toBe(false);
      expect(pill2024.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Sort Toggle', () => {
    test('toggles sort direction from desc to asc', () => {
      timeline.toggleSort();
      expect(timeline.sortDirection).toBe('asc');
    });

    test('toggles sort direction from asc back to desc', () => {
      timeline.toggleSort();
      timeline.toggleSort();
      expect(timeline.sortDirection).toBe('desc');
    });

    test('updates sort button text and icon', () => {
      timeline.toggleSort();
      const icon = timeline.sortBtn.querySelector('i');
      const text = timeline.sortBtn.querySelector('span');
      expect(icon.className).toBe('fas fa-sort-amount-up');
      expect(text.textContent).toBe('Oldest First');
    });

    test('reverses year group order in DOM', () => {
      const track = document.getElementById('timeline-track');
      const initialOrder = Array.from(track.querySelectorAll('.timeline-year-group'))
        .map(g => g.dataset.year);
      expect(initialOrder).toEqual(['2025', '2024']);

      timeline.toggleSort();

      const newOrder = Array.from(track.querySelectorAll('.timeline-year-group'))
        .map(g => g.dataset.year);
      expect(newOrder).toEqual(['2024', '2025']);
    });

    test('updates aria-label on sort button', () => {
      timeline.toggleSort();
      expect(timeline.sortBtn.getAttribute('aria-label')).toBe('Sort order: oldest first');

      timeline.toggleSort();
      expect(timeline.sortBtn.getAttribute('aria-label')).toBe('Sort order: newest first');
    });
  });

  describe('Scroll Reveal', () => {
    test('observes all timeline items', () => {
      expect(timeline.observer.observedElements.length).toBe(3);
    });

    test('adds visible class when item intersects', () => {
      const item = document.getElementById('item-2025-1');
      timeline.observer.simulateIntersection([
        { target: item, isIntersecting: true }
      ]);
      expect(item.classList.contains('visible')).toBe(true);
    });

    test('unobserves item after it becomes visible', () => {
      const item = document.getElementById('item-2025-1');
      const initialCount = timeline.observer.observedElements.length;

      timeline.observer.simulateIntersection([
        { target: item, isIntersecting: true }
      ]);

      expect(timeline.observer.observedElements.length).toBe(initialCount - 1);
    });

    test('does not add visible class when not intersecting', () => {
      const item = document.getElementById('item-2024-1');
      timeline.observer.simulateIntersection([
        { target: item, isIntersecting: false }
      ]);
      expect(item.classList.contains('visible')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles missing timeline view gracefully', () => {
      document.body.innerHTML = '<div>No timeline here</div>';
      const emptyTimeline = new ProjectTimeline();
      // Should not throw — constructor returns early
      expect(emptyTimeline.currentView).toBeUndefined();
    });

    test('handles missing sort button gracefully', () => {
      document.querySelector('.sort-btn').remove();
      const newTimeline = new ProjectTimeline();
      // Should not throw
      expect(newTimeline.sortBtn).toBeNull();
    });
  });
});

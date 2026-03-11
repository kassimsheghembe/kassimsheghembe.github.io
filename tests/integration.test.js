/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost/projects"}
 */

const ProjectFilter = require('../assets/js/project-filter');

// Mock window.history.replaceState
beforeAll(() => {
  window.history.replaceState = jest.fn();
});

/**
 * Integration tests: ProjectFilter with realistic DOM interactions
 */
describe('ProjectFilter Integration', () => {
  function setupRealisticDOM() {
    document.body.innerHTML = `
      <div class="filter-controls" id="grid-filter-controls">
        <input type="text" id="project-search" placeholder="Search projects..." />
        <div class="filter-buttons">
          <button class="tech-filter-btn" data-technology="Kotlin">Kotlin</button>
          <button class="tech-filter-btn" data-technology="Python">Python</button>
          <button class="tech-filter-btn" data-technology="FHIR">FHIR</button>
          <button class="tech-filter-btn" data-technology="Android">Android</button>
        </div>
        <div class="category-buttons">
          <button class="category-filter-btn" data-category="mobile">Mobile</button>
          <button class="category-filter-btn" data-category="web">Web</button>
        </div>
        <button id="clear-filters">Clear All</button>
        <select id="year-filter">
          <option value="">All Years</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>
      <div id="results-count"></div>
      <div id="filter-status"></div>
      <div class="projects-grid">
        <div class="project-card"
             data-project-id="ncd-fhir"
             data-title="NCD FHIR Healthcare App"
             data-description="A healthcare application for NCD screening"
             data-technologies="Kotlin,FHIR,Android"
             data-category="mobile"
             data-year="2025"
             data-status="completed">
          <a href="/projects/ncd-fhir/" class="project-link">View</a>
        </div>
        <div class="project-card"
             data-project-id="drug-shop"
             data-title="Drug Shop Management"
             data-description="Web app for managing drug shop inventory"
             data-technologies="Python,Django,PostgreSQL"
             data-category="web"
             data-year="2024"
             data-status="completed">
          <a href="/projects/drug-shop/" class="project-link">View</a>
        </div>
        <div class="project-card"
             data-project-id="kotlin-apps"
             data-title="Kotlin Android Apps"
             data-description="Collection of Android applications"
             data-technologies="Kotlin,Android,SQLite"
             data-category="mobile"
             data-year="2025"
             data-status="in-progress">
          <a href="/projects/kotlin-apps/" class="project-link">View</a>
        </div>
      </div>
    `;
  }

  let filter;

  beforeEach(() => {
    setupRealisticDOM();
    filter = new ProjectFilter();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('User interaction flows', () => {
    test('user types in search, then clicks a tech filter, then clears all', () => {
      // User searches
      filter.setSearchTerm('kotlin');
      expect(filter.projects.length).toBe(2); // ncd-fhir and kotlin-apps have Kotlin

      // User also clicks Android filter
      filter.toggleTechnologyFilter('Android');
      expect(filter.projects.length).toBe(2); // Both Kotlin-matching ones have Android too

      // User clears all
      filter.clearAllFilters();
      expect(filter.projects.length).toBe(3);
      expect(document.getElementById('project-search').value).toBe('');
    });

    test('user narrows down with category then tech, finding a single project', () => {
      filter.toggleCategoryFilter('mobile');
      expect(filter.projects.length).toBe(2);

      filter.toggleTechnologyFilter('FHIR');
      expect(filter.projects.length).toBe(1);
      expect(filter.projects[0].id).toBe('ncd-fhir');
    });

    test('user clicks tech filter button via DOM event', () => {
      const kotlinBtn = document.querySelector('.tech-filter-btn[data-technology="Kotlin"]');
      kotlinBtn.click();

      expect(filter.activeFilters.technologies.has('Kotlin')).toBe(true);
      expect(filter.projects.length).toBe(2);
    });

    test('user clicks category filter button via DOM event', () => {
      const webBtn = document.querySelector('.category-filter-btn[data-category="web"]');
      webBtn.click();

      expect(filter.activeFilters.categories.has('web')).toBe(true);
      expect(filter.projects.length).toBe(1);
      expect(filter.projects[0].id).toBe('drug-shop');
    });

    test('user types in search input via DOM event', () => {
      const searchInput = document.getElementById('project-search');
      searchInput.value = 'healthcare';
      searchInput.dispatchEvent(new Event('input'));

      expect(filter.activeFilters.search).toBe('healthcare');
      expect(filter.projects.length).toBe(1);
    });

    test('user clicks clear filters button via DOM event', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleCategoryFilter('mobile');
      expect(filter.projects.length).toBe(2);

      const clearBtn = document.getElementById('clear-filters');
      clearBtn.click();

      expect(filter.projects.length).toBe(3);
      expect(filter.activeFilters.technologies.size).toBe(0);
      expect(filter.activeFilters.categories.size).toBe(0);
    });
  });

  describe('Project data validation', () => {
    test('all projects have required fields', () => {
      filter.allProjects.forEach(project => {
        expect(project.id).toBeTruthy();
        expect(project.title).toBeTruthy();
        expect(project.technologies.length).toBeGreaterThan(0);
        expect(project.category).toBeTruthy();
        expect(project.year).toBeGreaterThan(0);
      });
    });

    test('project technologies are parsed as arrays', () => {
      filter.allProjects.forEach(project => {
        expect(Array.isArray(project.technologies)).toBe(true);
      });
    });

    test('project year is a number', () => {
      filter.allProjects.forEach(project => {
        expect(typeof project.year).toBe('number');
        expect(project.year).toBeGreaterThanOrEqual(2020);
      });
    });
  });

  describe('Filter state consistency', () => {
    test('filter stats match actual filtered results', () => {
      filter.toggleTechnologyFilter('Kotlin');
      const stats = filter.getFilterStats();
      expect(stats.filteredProjects).toBe(filter.projects.length);
      expect(stats.totalProjects).toBe(filter.allProjects.length);
    });

    test('visible cards match filter.projects count', () => {
      jest.useFakeTimers();
      filter.toggleCategoryFilter('web');
      jest.runAllTimers();

      const visibleCards = filter.allProjects.filter(p => p.element.style.display !== 'none');
      expect(visibleCards.length).toBe(filter.projects.length);
      jest.useRealTimers();
    });

    test('URL reflects current filter state accurately', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleCategoryFilter('mobile');
      filter.setSearchTerm('app');

      const lastCall = window.history.replaceState.mock.calls.at(-1);
      const url = lastCall[2];
      expect(url).toContain('tech=Kotlin');
      expect(url).toContain('category=mobile');
      expect(url).toContain('search=app');
    });
  });

  describe('Error handling', () => {
    test('filter works when projects-grid is empty', () => {
      document.querySelector('.projects-grid').innerHTML = '';
      const emptyFilter = new ProjectFilter();
      expect(emptyFilter.allProjects.length).toBe(0);
      emptyFilter.applyFilters();
      expect(emptyFilter.projects.length).toBe(0);
    });

    test('filter works when search input is missing', () => {
      document.getElementById('project-search').remove();
      const noSearchFilter = new ProjectFilter();
      // Should not throw
      expect(noSearchFilter.allProjects.length).toBe(3);
    });

    test('filter works when clear button is missing', () => {
      document.getElementById('clear-filters').remove();
      const noClearFilter = new ProjectFilter();
      expect(noClearFilter.allProjects.length).toBe(3);
    });
  });
});

/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost/projects"}
 */

const ProjectFilter = require('../assets/js/project-filter');

// Helper to create a mock project card DOM element
function createProjectCard({ id, title, description, technologies, category, year, status }) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.projectId = id;
  card.dataset.title = title;
  card.dataset.description = description || '';
  card.dataset.technologies = technologies.join(',');
  card.dataset.category = category;
  card.dataset.year = year.toString();
  card.dataset.status = status || 'completed';
  card.style.display = 'block';
  return card;
}

// Helper to set up the full DOM needed by ProjectFilter
function setupDOM(projects) {
  document.body.innerHTML = `
    <input type="text" id="project-search" />
    <div id="results-count"></div>
    <div id="filter-status"></div>
    <div id="clear-filters"></div>
    <select id="year-filter">
      <option value="">All</option>
      <option value="2024">2024</option>
      <option value="2025">2025</option>
    </select>
    <div class="tech-filter-container"></div>
    <div class="category-filter-container"></div>
    <div class="projects-grid"></div>
  `;

  const grid = document.querySelector('.projects-grid');
  const techContainer = document.querySelector('.tech-filter-container');
  const catContainer = document.querySelector('.category-filter-container');

  // Collect unique techs and categories for filter buttons
  const techs = new Set();
  const categories = new Set();

  projects.forEach(p => {
    const card = createProjectCard(p);
    grid.appendChild(card);
    p.technologies.forEach(t => techs.add(t));
    categories.add(p.category);
  });

  techs.forEach(tech => {
    const btn = document.createElement('button');
    btn.className = 'tech-filter-btn';
    btn.dataset.technology = tech;
    btn.textContent = tech;
    techContainer.appendChild(btn);
  });

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-filter-btn';
    btn.dataset.category = cat;
    btn.textContent = cat;
    catContainer.appendChild(btn);
  });
}

const sampleProjects = [
  {
    id: 'ncd-fhir',
    title: 'NCD FHIR Healthcare App',
    description: 'A healthcare application using FHIR standards',
    technologies: ['Kotlin', 'FHIR', 'Android'],
    category: 'mobile',
    year: 2025,
    status: 'completed'
  },
  {
    id: 'drug-shop',
    title: 'Drug Shop Management',
    description: 'A web application for managing drug shop inventory',
    technologies: ['Python', 'Django', 'PostgreSQL'],
    category: 'web',
    year: 2024,
    status: 'completed'
  },
  {
    id: 'acj-algorithm',
    title: 'ACJ Algorithm Implementation',
    description: 'Adaptive comparative judgement algorithm',
    technologies: ['Python', 'Flask'],
    category: 'data',
    year: 2024,
    status: 'completed'
  },
  {
    id: 'kotlin-apps',
    title: 'Kotlin Android Apps',
    description: 'Collection of Android applications built with Kotlin',
    technologies: ['Kotlin', 'Android', 'SQLite'],
    category: 'mobile',
    year: 2025,
    status: 'in-progress'
  }
];

// Mock window.history.replaceState
beforeAll(() => {
  window.history.replaceState = jest.fn();
});

describe('ProjectFilter', () => {
  let filter;

  beforeEach(() => {
    setupDOM(sampleProjects);
    // We need to manually create the instance since DOMContentLoaded already fired
    filter = new ProjectFilter();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('loads all project cards from the DOM', () => {
      expect(filter.allProjects.length).toBe(4);
    });

    test('parses project data correctly from data attributes', () => {
      const project = filter.allProjects.find(p => p.id === 'ncd-fhir');
      expect(project).toBeDefined();
      expect(project.title).toBe('ncd fhir healthcare app');
      expect(project.technologies).toEqual(['Kotlin', 'FHIR', 'Android']);
      expect(project.category).toBe('mobile');
      expect(project.year).toBe(2025);
    });

    test('initially shows all projects (no filters active)', () => {
      expect(filter.projects.length).toBe(4);
    });

    test('initializes with empty filter state', () => {
      expect(filter.activeFilters.technologies.size).toBe(0);
      expect(filter.activeFilters.categories.size).toBe(0);
      expect(filter.activeFilters.search).toBe('');
    });
  });

  describe('Technology Filtering', () => {
    test('filters projects by a single technology', () => {
      filter.toggleTechnologyFilter('Kotlin');
      expect(filter.projects.length).toBe(2);
      expect(filter.projects.every(p => p.technologies.includes('Kotlin'))).toBe(true);
    });

    test('filters projects by multiple technologies (OR logic)', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleTechnologyFilter('Django');
      // Should show projects that have Kotlin OR Django
      expect(filter.projects.length).toBe(3);
    });

    test('toggling a technology off removes the filter', () => {
      filter.toggleTechnologyFilter('Kotlin');
      expect(filter.projects.length).toBe(2);
      filter.toggleTechnologyFilter('Kotlin');
      expect(filter.projects.length).toBe(4);
    });

    test('updates UI button state when technology is toggled', () => {
      filter.toggleTechnologyFilter('Kotlin');
      const btn = document.querySelector('.tech-filter-btn[data-technology="Kotlin"]');
      expect(btn.classList.contains('active')).toBe(true);
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });

    test('filtering by a technology with no matches returns empty', () => {
      // toggleTechnologyFilter adds 'Rust' to the set and applies filters
      // Since no project has 'Rust', result is 0
      filter.toggleTechnologyFilter('Rust');
      expect(filter.projects.length).toBe(0);
    });
  });

  describe('Category Filtering', () => {
    test('filters projects by category', () => {
      filter.toggleCategoryFilter('mobile');
      expect(filter.projects.length).toBe(2);
      expect(filter.projects.every(p => p.category === 'mobile')).toBe(true);
    });

    test('filters by multiple categories (OR logic)', () => {
      filter.toggleCategoryFilter('mobile');
      filter.toggleCategoryFilter('web');
      expect(filter.projects.length).toBe(3);
    });

    test('toggling a category off removes the filter', () => {
      filter.toggleCategoryFilter('data');
      expect(filter.projects.length).toBe(1);
      filter.toggleCategoryFilter('data');
      expect(filter.projects.length).toBe(4);
    });
  });

  describe('Search Filtering', () => {
    test('filters projects by title search', () => {
      filter.setSearchTerm('healthcare');
      expect(filter.projects.length).toBe(1);
      expect(filter.projects[0].id).toBe('ncd-fhir');
    });

    test('filters projects by description search', () => {
      filter.setSearchTerm('inventory');
      expect(filter.projects.length).toBe(1);
      expect(filter.projects[0].id).toBe('drug-shop');
    });

    test('filters projects by technology name search', () => {
      filter.setSearchTerm('flask');
      expect(filter.projects.length).toBe(1);
      expect(filter.projects[0].id).toBe('acj-algorithm');
    });

    test('search is case insensitive', () => {
      filter.setSearchTerm('KOTLIN');
      expect(filter.projects.length).toBe(2);
    });

    test('search trims whitespace', () => {
      filter.setSearchTerm('  healthcare  ');
      expect(filter.projects.length).toBe(1);
    });

    test('empty search returns all projects', () => {
      filter.setSearchTerm('healthcare');
      expect(filter.projects.length).toBe(1);
      filter.setSearchTerm('');
      expect(filter.projects.length).toBe(4);
    });

    test('search with no matches returns empty', () => {
      filter.setSearchTerm('nonexistent');
      expect(filter.projects.length).toBe(0);
    });
  });

  describe('Year Filtering', () => {
    test('filters projects by year', () => {
      filter.setYearFilter('2025');
      expect(filter.projects.length).toBe(2);
      expect(filter.projects.every(p => p.year === 2025)).toBe(true);
    });

    test('clearing year filter shows all projects', () => {
      filter.setYearFilter('2025');
      expect(filter.projects.length).toBe(2);
      filter.setYearFilter('');
      expect(filter.projects.length).toBe(4);
    });
  });

  describe('Combined Filters', () => {
    test('technology + category filters combine correctly', () => {
      filter.toggleTechnologyFilter('Python');
      filter.toggleCategoryFilter('web');
      // Python projects in web category
      expect(filter.projects.length).toBe(1);
      expect(filter.projects[0].id).toBe('drug-shop');
    });

    test('technology + search filters combine correctly', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.setSearchTerm('healthcare');
      expect(filter.projects.length).toBe(1);
      expect(filter.projects[0].id).toBe('ncd-fhir');
    });

    test('all filter types combined', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleCategoryFilter('mobile');
      filter.setSearchTerm('android');
      // Kotlin + mobile + 'android' in title/description/technologies
      expect(filter.projects.length).toBe(2);
    });
  });

  describe('Clear All Filters', () => {
    test('resets all filter state', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleCategoryFilter('mobile');
      filter.setSearchTerm('app');
      filter.setYearFilter('2025');

      filter.clearAllFilters();

      expect(filter.activeFilters.technologies.size).toBe(0);
      expect(filter.activeFilters.categories.size).toBe(0);
      expect(filter.activeFilters.search).toBe('');
      expect(filter.activeFilters.year).toBeNull();
      expect(filter.projects.length).toBe(4);
    });

    test('resets search input value', () => {
      const searchInput = document.getElementById('project-search');
      searchInput.value = 'test';
      filter.setSearchTerm('test');

      filter.clearAllFilters();

      expect(searchInput.value).toBe('');
    });

    test('resets year select value', () => {
      filter.setYearFilter('2025');
      filter.clearAllFilters();
      const yearSelect = document.getElementById('year-filter');
      expect(yearSelect.value).toBe('');
    });
  });

  describe('Rendering', () => {
    test('hides non-matching projects', () => {
      filter.toggleCategoryFilter('mobile');
      const webCard = filter.allProjects.find(p => p.id === 'drug-shop');
      expect(webCard.element.style.display).toBe('none');
    });

    test('updates results count text', () => {
      filter.toggleCategoryFilter('mobile');
      // Need to wait for staggered animation setTimeout
      jest.useFakeTimers();
      filter.applyFilters();
      jest.runAllTimers();

      const countEl = document.getElementById('results-count');
      expect(countEl.textContent).toBe('Showing 2 of 4 projects');
      jest.useRealTimers();
    });

    test('shows no-results message when no projects match', () => {
      filter.activeFilters.technologies.add('Rust');
      filter.applyFilters();

      const noResults = document.getElementById('no-results-message');
      expect(noResults).not.toBeNull();
      expect(noResults.style.display).toBe('block');
    });

    test('hides no-results message when projects match', () => {
      // First trigger no results
      filter.activeFilters.technologies.add('Rust');
      filter.applyFilters();

      // Then clear filters
      filter.clearAllFilters();

      const noResults = document.getElementById('no-results-message');
      expect(noResults.style.display).toBe('none');
    });
  });

  describe('URL State Management', () => {
    test('updates URL when technology filter is applied', () => {
      filter.toggleTechnologyFilter('Kotlin');
      expect(window.history.replaceState).toHaveBeenCalled();
      const lastCall = window.history.replaceState.mock.calls.at(-1);
      expect(lastCall[2]).toContain('tech=Kotlin');
    });

    test('updates URL when category filter is applied', () => {
      filter.toggleCategoryFilter('mobile');
      const lastCall = window.history.replaceState.mock.calls.at(-1);
      expect(lastCall[2]).toContain('category=mobile');
    });

    test('updates URL when search is applied', () => {
      filter.setSearchTerm('healthcare');
      const lastCall = window.history.replaceState.mock.calls.at(-1);
      expect(lastCall[2]).toContain('search=healthcare');
    });

    test('removes parameters from URL when filters are cleared', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.clearAllFilters();
      const lastCall = window.history.replaceState.mock.calls.at(-1);
      // URL should be just the pathname with no query params
      expect(lastCall[2]).toBe(window.location.pathname);
    });
  });

  describe('Filter Statistics', () => {
    test('returns correct stats with no filters', () => {
      const stats = filter.getFilterStats();
      expect(stats.totalProjects).toBe(4);
      expect(stats.filteredProjects).toBe(4);
      expect(stats.activeFilters.technologies).toEqual([]);
      expect(stats.activeFilters.categories).toEqual([]);
      expect(stats.activeFilters.search).toBe('');
    });

    test('returns correct stats with active filters', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.setSearchTerm('app');

      const stats = filter.getFilterStats();
      expect(stats.totalProjects).toBe(4);
      expect(stats.filteredProjects).toBe(2);
      expect(stats.activeFilters.technologies).toContain('Kotlin');
      expect(stats.activeFilters.search).toBe('app');
    });
  });

  describe('Filter Status Display', () => {
    test('shows active filter count', () => {
      const statusEl = document.getElementById('filter-status');
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleCategoryFilter('mobile');
      expect(statusEl.style.display).toBe('block');
      expect(statusEl.textContent).toContain('2 filters active');
    });

    test('hides status when no filters active', () => {
      const statusEl = document.getElementById('filter-status');
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleTechnologyFilter('Kotlin'); // toggle off
      expect(statusEl.style.display).toBe('none');
    });
  });

  describe('Edge Cases', () => {
    test('handles project card with missing data attributes gracefully', () => {
      const grid = document.querySelector('.projects-grid');
      const emptyCard = document.createElement('div');
      emptyCard.className = 'project-card';
      grid.appendChild(emptyCard);

      const newFilter = new ProjectFilter();
      expect(newFilter.allProjects.length).toBe(5);
      const emptyProject = newFilter.allProjects[4];
      expect(emptyProject.title).toBe('');
      expect(emptyProject.technologies).toEqual(['']);
      expect(emptyProject.year).toBe(0);
    });

    test('handles rapid successive filter toggles', () => {
      filter.toggleTechnologyFilter('Kotlin');
      filter.toggleTechnologyFilter('Python');
      filter.toggleTechnologyFilter('Kotlin');
      // Only Python should remain active
      expect(filter.activeFilters.technologies.size).toBe(1);
      expect(filter.activeFilters.technologies.has('Python')).toBe(true);
      expect(filter.projects.length).toBe(2); // drug-shop + acj-algorithm
    });
  });
});

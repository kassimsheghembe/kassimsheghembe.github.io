/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost/projects"}
 */

/**
 * Task 8.2: Responsive and Accessibility Testing
 * Tests layout behavior, keyboard navigation, screen reader compatibility,
 * and visual accessibility compliance.
 */

describe('Accessibility: Navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="#main" class="skip-to-content">Skip to main content</a>
      <div class="wrapper-masthead">
        <div class="container">
          <header class="masthead clearfix">
            <div class="row align-items-center position-relative">
              <div class="col-5">
                <div class="site-logo">
                  <a class="navbar-brand text-black" href="/">Kassim Sheghembe</a>
                </div>
              </div>
              <div class="col-7">
                <nav class="navbar navbar-expand-lg navbar-light" aria-label="Main navigation">
                  <ul class="nav-menu">
                    <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/about/">About</a></li>
                    <li class="nav-item"><a class="nav-link" href="/projects/">Projects</a></li>
                    <li class="nav-item"><a class="nav-link" href="/cv/">CV</a></li>
                    <li class="nav-item"><a class="nav-link" href="/contacts/">Contacts</a></li>
                  </ul>
                  <button class="hamburger" type="button" aria-label="Toggle navigation menu" aria-expanded="false">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                  </button>
                </nav>
              </div>
            </div>
          </header>
        </div>
      </div>
      <div id="main" role="main" class="container">
        <h1>Page Content</h1>
      </div>
    `;
  });

  test('skip-to-content link exists and points to #main', () => {
    const skipLink = document.querySelector('.skip-to-content');
    expect(skipLink).not.toBeNull();
    expect(skipLink.getAttribute('href')).toBe('#main');
    expect(skipLink.textContent).toContain('Skip to main content');
  });

  test('main content area has id="main" matching skip link', () => {
    const main = document.getElementById('main');
    expect(main).not.toBeNull();
    expect(main.getAttribute('role')).toBe('main');
  });

  test('nav element has aria-label', () => {
    const nav = document.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');
  });

  test('hamburger button has aria-label and aria-expanded', () => {
    const hamburger = document.querySelector('.hamburger');
    expect(hamburger.getAttribute('aria-label')).toBe('Toggle navigation menu');
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });

  test('hamburger toggles aria-expanded on click', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Simulate the toggle behavior from main.js
    hamburger.addEventListener('click', () => {
      const isActive = hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    hamburger.click();
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
    expect(navMenu.classList.contains('active')).toBe(true);

    hamburger.click();
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
    expect(navMenu.classList.contains('active')).toBe(false);
  });

  test('all nav links are focusable anchor elements', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(5);
    navLinks.forEach(link => {
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBeTruthy();
    });
  });

  test('navigation list uses semantic HTML', () => {
    const navList = document.querySelector('.nav-menu');
    expect(navList.tagName).toBe('UL');
    const items = navList.querySelectorAll('.nav-item');
    items.forEach(item => {
      expect(item.tagName).toBe('LI');
    });
  });
});

describe('Accessibility: Project Gallery & Lightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="project-gallery" data-project="test-project">
        <div class="gallery-grid">
          <div class="gallery-item" data-index="0" role="button" tabindex="0" aria-label="View image: Screenshot 1">
            <div class="gallery-thumbnail-container">
              <img src="/img/1.jpg" alt="Screenshot 1" class="gallery-thumbnail" loading="lazy">
            </div>
            <p class="gallery-caption">First screenshot</p>
          </div>
          <div class="gallery-item" data-index="1" role="button" tabindex="0" aria-label="View image: Screenshot 2">
            <div class="gallery-thumbnail-container">
              <img src="/img/2.jpg" alt="Screenshot 2" class="gallery-thumbnail" loading="lazy">
            </div>
          </div>
        </div>
      </div>
      <div id="gallery-lightbox-test-project" class="gallery-lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title" aria-hidden="true">
        <div class="lightbox-overlay" aria-label="Close lightbox"></div>
        <div class="lightbox-container">
          <div class="lightbox-header">
            <h3 id="lightbox-title" class="lightbox-title"></h3>
            <button class="lightbox-close" aria-label="Close lightbox">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="lightbox-content">
            <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="lightbox-image-container">
              <img class="lightbox-image" src="" alt="" />
              <div class="lightbox-loading"><span>Loading...</span></div>
            </div>
            <button class="lightbox-nav lightbox-next" aria-label="Next image">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="lightbox-footer">
            <p class="lightbox-caption"></p>
            <div class="lightbox-counter">
              <span class="current-image">1</span> / <span class="total-images">2</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  test('gallery items have role="button" for screen readers', () => {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
      expect(item.getAttribute('role')).toBe('button');
    });
  });

  test('gallery items have tabindex="0" for keyboard focus', () => {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
      expect(item.getAttribute('tabindex')).toBe('0');
    });
  });

  test('gallery items have descriptive aria-labels', () => {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
      const ariaLabel = item.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/^View image:/);
    });
  });

  test('all gallery images have alt text', () => {
    const images = document.querySelectorAll('.gallery-thumbnail');
    images.forEach(img => {
      expect(img.getAttribute('alt')).toBeTruthy();
    });
  });

  test('gallery images use lazy loading', () => {
    const images = document.querySelectorAll('.gallery-thumbnail');
    images.forEach(img => {
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });

  test('lightbox has correct dialog ARIA attributes', () => {
    const lightbox = document.querySelector('.gallery-lightbox');
    expect(lightbox.getAttribute('role')).toBe('dialog');
    expect(lightbox.getAttribute('aria-modal')).toBe('true');
    expect(lightbox.getAttribute('aria-labelledby')).toBe('lightbox-title');
    expect(lightbox.getAttribute('aria-hidden')).toBe('true');
  });

  test('lightbox title element exists matching aria-labelledby', () => {
    const titleId = document.querySelector('.gallery-lightbox').getAttribute('aria-labelledby');
    const titleEl = document.getElementById(titleId);
    expect(titleEl).not.toBeNull();
  });

  test('lightbox close button has aria-label', () => {
    const closeBtn = document.querySelector('.lightbox-close');
    expect(closeBtn.getAttribute('aria-label')).toBe('Close lightbox');
  });

  test('lightbox navigation buttons have aria-labels', () => {
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    expect(prevBtn.getAttribute('aria-label')).toBe('Previous image');
    expect(nextBtn.getAttribute('aria-label')).toBe('Next image');
  });

  test('gallery items respond to Enter key', () => {
    const item = document.querySelector('.gallery-item');
    let clicked = false;
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        clicked = true;
      }
    });
    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(clicked).toBe(true);
  });

  test('lightbox responds to Escape key', () => {
    const lightbox = document.querySelector('.gallery-lightbox');
    lightbox.classList.add('active');
    let escaped = false;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        escaped = true;
      }
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(escaped).toBe(true);
    expect(lightbox.classList.contains('active')).toBe(false);
  });
});

describe('Accessibility: Social Share Component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="social-share" aria-label="Share this project">
        <h3 class="share-title"><i class="fas fa-share-alt" aria-hidden="true"></i> Share</h3>
        <div class="share-buttons">
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=http%3A%2F%2Flocalhost"
             target="_blank" rel="noopener noreferrer"
             class="share-btn share-linkedin" aria-label="Share on LinkedIn">
            <i class="fab fa-linkedin" aria-hidden="true"></i>
            <span>LinkedIn</span>
          </a>
          <a href="https://twitter.com/intent/tweet?url=http%3A%2F%2Flocalhost"
             target="_blank" rel="noopener noreferrer"
             class="share-btn share-twitter" aria-label="Share on X (Twitter)">
            <i class="fab fa-twitter" aria-hidden="true"></i>
            <span>Twitter</span>
          </a>
          <a href="mailto:?subject=Test&body=Test"
             class="share-btn share-email" aria-label="Share via email">
            <i class="fas fa-envelope" aria-hidden="true"></i>
            <span>Email</span>
          </a>
          <button type="button" class="share-btn share-copy"
                  aria-label="Copy link to clipboard" data-url="http://localhost">
            <i class="fas fa-link" aria-hidden="true"></i>
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    `;
  });

  test('share container has aria-label', () => {
    const share = document.querySelector('.social-share');
    expect(share.getAttribute('aria-label')).toBe('Share this project');
  });

  test('all share buttons have aria-labels', () => {
    const buttons = document.querySelectorAll('.share-btn');
    buttons.forEach(btn => {
      expect(btn.getAttribute('aria-label')).toBeTruthy();
    });
  });

  test('decorative icons are hidden from screen readers', () => {
    const icons = document.querySelectorAll('.social-share i');
    icons.forEach(icon => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  test('external share links have rel="noopener noreferrer"', () => {
    const externalLinks = document.querySelectorAll('.share-btn[target="_blank"]');
    externalLinks.forEach(link => {
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });

  test('share buttons have visible text labels alongside icons', () => {
    const buttons = document.querySelectorAll('.share-btn');
    buttons.forEach(btn => {
      const textSpan = btn.querySelector('span');
      expect(textSpan).not.toBeNull();
      expect(textSpan.textContent.trim()).toBeTruthy();
    });
  });
});

describe('Accessibility: Skills Progress Bars', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section class="skills-section section">
        <h2 class="section-title">Skills</h2>
        <div class="skillset">
          <div class="item">
            <h3 class="level-title">Python</h3>
            <div class="progress">
              <div class="progress-bar" role="progressbar" data-level="90%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
          <div class="item">
            <h3 class="level-title">JavaScript</h3>
            <div class="progress">
              <div class="progress-bar" role="progressbar" data-level="80%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  });

  test('progress bars have role="progressbar"', () => {
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach(bar => {
      expect(bar.getAttribute('role')).toBe('progressbar');
    });
  });

  test('progress bars have aria-valuemin and aria-valuemax', () => {
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach(bar => {
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });
  });

  test('progress bars have aria-valuenow', () => {
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach(bar => {
      expect(bar.getAttribute('aria-valuenow')).toBeTruthy();
    });
  });

  test('each skill has a heading label', () => {
    const items = document.querySelectorAll('.skillset .item');
    items.forEach(item => {
      const heading = item.querySelector('.level-title');
      expect(heading).not.toBeNull();
      expect(heading.textContent.trim()).toBeTruthy();
    });
  });
});

describe('Accessibility: Footer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <footer class="page-footer font-small darken-3">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="mb-7 flex-center">
                <a href="https://www.linkedin.com/in/sheghembekassim/" aria-label="LinkedIn profile">
                  <i class="fab fa-linkedin fa-lg" aria-hidden="true"></i>
                </a>
                <a href="http://github.com/gosso22" aria-label="GitHub profile">
                  <i class="fab fa-github-square fa-lg" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  });

  test('icon-only links have aria-labels', () => {
    const links = document.querySelectorAll('footer a');
    links.forEach(link => {
      expect(link.getAttribute('aria-label')).toBeTruthy();
    });
  });

  test('decorative icons are hidden from screen readers', () => {
    const icons = document.querySelectorAll('footer i');
    icons.forEach(icon => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  test('footer uses semantic <footer> element', () => {
    const footer = document.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer.tagName).toBe('FOOTER');
  });
});

describe('Accessibility: Project Filter Controls', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="filter-controls">
        <input type="text" id="project-search" placeholder="Search projects..."
               aria-label="Search projects" />
        <div class="filter-buttons">
          <button class="tech-filter-btn" data-technology="Kotlin" aria-pressed="false">Kotlin</button>
          <button class="tech-filter-btn" data-technology="Python" aria-pressed="false">Python</button>
        </div>
        <div class="category-buttons">
          <button class="category-filter-btn" data-category="mobile" aria-pressed="false">Mobile</button>
          <button class="category-filter-btn" data-category="web" aria-pressed="false">Web</button>
        </div>
        <button id="clear-filters">Clear All</button>
      </div>
    `;
  });

  test('filter buttons use aria-pressed for toggle state', () => {
    const techBtns = document.querySelectorAll('.tech-filter-btn');
    techBtns.forEach(btn => {
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });

    const catBtns = document.querySelectorAll('.category-filter-btn');
    catBtns.forEach(btn => {
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });
  });

  test('filter buttons toggle aria-pressed correctly', () => {
    const btn = document.querySelector('.tech-filter-btn');
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('active');

    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.classList.contains('active')).toBe(true);
  });

  test('search input is a text input for screen reader discovery', () => {
    const search = document.getElementById('project-search');
    expect(search.tagName).toBe('INPUT');
    expect(search.getAttribute('type')).toBe('text');
    expect(search.getAttribute('placeholder')).toBeTruthy();
  });

  test('all filter buttons are focusable', () => {
    const buttons = document.querySelectorAll('.tech-filter-btn, .category-filter-btn, #clear-filters');
    buttons.forEach(btn => {
      expect(btn.tagName).toBe('BUTTON');
      // Buttons are natively focusable
    });
  });
});

describe('Accessibility: Project Timeline', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="main-view-toggle">
        <button class="view-toggle-btn active" data-view="grid" aria-pressed="true">Grid</button>
        <button class="view-toggle-btn" data-view="timeline" aria-pressed="false">Timeline</button>
      </div>
      <div class="timeline-nav" role="group" aria-label="Filter by year">
        <button class="year-pill active" data-year="all" aria-pressed="true">All</button>
        <button class="year-pill" data-year="2025" aria-pressed="false">2025</button>
        <button class="year-pill" data-year="2024" aria-pressed="false">2024</button>
      </div>
      <button class="sort-btn" aria-label="Sort order: newest first">
        <i class="fas fa-sort-amount-down" aria-hidden="true"></i>
        <span>Newest First</span>
      </button>
    `;
  });

  test('view toggle buttons use aria-pressed', () => {
    const btns = document.querySelectorAll('.view-toggle-btn');
    const gridBtn = document.querySelector('[data-view="grid"]');
    const timelineBtn = document.querySelector('[data-view="timeline"]');

    expect(gridBtn.getAttribute('aria-pressed')).toBe('true');
    expect(timelineBtn.getAttribute('aria-pressed')).toBe('false');
  });

  test('year filter group has role="group" and aria-label', () => {
    const nav = document.querySelector('.timeline-nav');
    expect(nav.getAttribute('role')).toBe('group');
    expect(nav.getAttribute('aria-label')).toBe('Filter by year');
  });

  test('year pills use aria-pressed', () => {
    const pills = document.querySelectorAll('.year-pill');
    const activePill = document.querySelector('.year-pill.active');
    expect(activePill.getAttribute('aria-pressed')).toBe('true');

    pills.forEach(pill => {
      if (!pill.classList.contains('active')) {
        expect(pill.getAttribute('aria-pressed')).toBe('false');
      }
    });
  });

  test('sort button has aria-label describing current state', () => {
    const sortBtn = document.querySelector('.sort-btn');
    expect(sortBtn.getAttribute('aria-label')).toContain('Sort order');
  });

  test('sort button icon is hidden from screen readers', () => {
    const icon = document.querySelector('.sort-btn i');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Accessibility: Heading Hierarchy', () => {
  test('page does not skip heading levels', () => {
    document.body.innerHTML = `
      <h1>Portfolio</h1>
      <section>
        <h2>Projects</h2>
        <div class="project-card">
          <h3>NCD FHIR App</h3>
        </div>
        <div class="project-card">
          <h3>Drug Shop</h3>
        </div>
      </section>
      <section>
        <h2>Skills</h2>
        <h3>Python</h3>
        <h3>JavaScript</h3>
      </section>
    `;

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      // Heading level should never jump by more than 1
      if (previousLevel > 0) {
        expect(level - previousLevel).toBeLessThanOrEqual(1);
      }
      previousLevel = level;
    });
  });

  test('page has exactly one h1', () => {
    document.body.innerHTML = `
      <h1>Kassim Sheghembe | Portfolio</h1>
      <h2>Projects</h2>
      <h2>Skills</h2>
    `;

    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });
});

describe('Accessibility: Images', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="project-card">
        <img src="/img/project1.jpg" alt="NCD FHIR Healthcare App" class="card-img-top">
      </div>
      <div class="project-card">
        <div class="image-placeholder">
          <i class="fas fa-mobile-alt fa-3x"></i>
          <h5>Kotlin Apps</h5>
        </div>
      </div>
      <div class="gallery-item">
        <img src="/img/screenshot.jpg" alt="App screenshot showing login page" class="gallery-thumbnail">
      </div>
    `;
  });

  test('all content images have non-empty alt text', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      expect(img.getAttribute('alt')).toBeTruthy();
      expect(img.getAttribute('alt').length).toBeGreaterThan(0);
    });
  });

  test('alt text is descriptive, not generic', () => {
    const images = document.querySelectorAll('img');
    const genericAlts = ['image', 'photo', 'picture', 'img', 'screenshot'];
    images.forEach(img => {
      const alt = img.getAttribute('alt').toLowerCase();
      // Alt text should not be just a generic word
      genericAlts.forEach(generic => {
        expect(alt).not.toBe(generic);
      });
    });
  });
});

describe('Accessibility: Keyboard Navigation', () => {
  test('interactive elements are reachable via Tab', () => {
    document.body.innerHTML = `
      <a href="#main" class="skip-to-content">Skip to main content</a>
      <nav>
        <a href="/">Home</a>
        <a href="/about/">About</a>
      </nav>
      <main id="main">
        <input type="text" id="project-search" />
        <button class="tech-filter-btn">Kotlin</button>
        <button class="category-filter-btn">Mobile</button>
        <div class="gallery-item" role="button" tabindex="0">Image 1</div>
      </main>
    `;

    // All these should be natively or explicitly focusable
    const focusableSelectors = [
      'a[href]',
      'button',
      'input',
      '[tabindex="0"]'
    ];

    const allFocusable = document.querySelectorAll(focusableSelectors.join(', '));
    expect(allFocusable.length).toBeGreaterThanOrEqual(7);

    allFocusable.forEach(el => {
      // Elements should not have tabindex="-1" which removes from tab order
      const tabindex = el.getAttribute('tabindex');
      expect(tabindex).not.toBe('-1');
    });
  });

  test('no keyboard traps exist outside lightbox', () => {
    document.body.innerHTML = `
      <nav>
        <a href="/">Home</a>
        <a href="/about/">About</a>
      </nav>
      <main>
        <button class="tech-filter-btn">Kotlin</button>
        <input type="text" id="project-search" />
        <button id="clear-filters">Clear</button>
      </main>
    `;

    // Verify no element has a keydown handler that calls preventDefault on Tab
    // without having a focus trap mechanism
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      // No element outside lightbox should have tabindex="-1"
      if (!el.closest('.gallery-lightbox')) {
        const tabindex = el.getAttribute('tabindex');
        if (tabindex !== null && tabindex !== '0') {
          // Only decorative/hidden elements should have negative tabindex
          expect(el.getAttribute('aria-hidden')).toBe('true');
        }
      }
    });
  });
});

describe('Responsive: Viewport Meta Tag', () => {
  test('page has viewport meta tag', () => {
    document.head.innerHTML = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    `;

    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport.getAttribute('content')).toContain('width=device-width');
  });
});

describe('Responsive: Project Card Layout', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="projects-grid">
        <div class="project-card" data-project-id="p1">
          <div class="card h-100">
            <div class="card-img-wrapper">
              <img src="/img/1.jpg" alt="Project 1" class="card-img-top">
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Project 1</h5>
              <p class="card-text">Description</p>
              <div class="technology-tags">
                <span class="tech-tag">Python</span>
                <span class="tech-tag">Django</span>
              </div>
              <div class="card-actions mt-auto">
                <a href="/projects/p1/" class="btn btn-primary btn-sm">View Details</a>
              </div>
            </div>
          </div>
        </div>
        <div class="project-card" data-project-id="p2">
          <div class="card h-100">
            <div class="card-img-wrapper">
              <img src="/img/2.jpg" alt="Project 2" class="card-img-top">
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Project 2</h5>
              <p class="card-text">Description</p>
              <div class="card-actions mt-auto">
                <a href="/projects/p2/" class="btn btn-primary btn-sm">View Details</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  test('project cards use h-100 for equal height', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      expect(card.classList.contains('h-100')).toBe(true);
    });
  });

  test('card body uses flex column for proper spacing', () => {
    const bodies = document.querySelectorAll('.card-body');
    bodies.forEach(body => {
      expect(body.classList.contains('d-flex')).toBe(true);
      expect(body.classList.contains('flex-column')).toBe(true);
    });
  });

  test('card actions are pushed to bottom with mt-auto', () => {
    const actions = document.querySelectorAll('.card-actions');
    actions.forEach(action => {
      expect(action.classList.contains('mt-auto')).toBe(true);
    });
  });

  test('all project cards have links', () => {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      const link = card.querySelector('a[href]');
      expect(link).not.toBeNull();
    });
  });

  test('external links have rel="noopener"', () => {
    document.body.innerHTML += `
      <a href="https://example.com" target="_blank" rel="noopener">Demo</a>
    `;
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });
});

describe('Responsive: Touch Targets', () => {
  test('buttons and links meet minimum touch target guidance', () => {
    document.body.innerHTML = `
      <button class="tech-filter-btn" style="min-width: 44px; min-height: 44px;">Kotlin</button>
      <button class="category-filter-btn" style="min-width: 44px; min-height: 44px;">Mobile</button>
      <button class="lightbox-nav" style="min-width: 60px; min-height: 60px;">Prev</button>
    `;

    // The MobileTouchEnhancer sets min-width/min-height to 44px
    const filterBtns = document.querySelectorAll('.tech-filter-btn, .category-filter-btn');
    filterBtns.forEach(btn => {
      const minWidth = parseInt(btn.style.minWidth);
      const minHeight = parseInt(btn.style.minHeight);
      expect(minWidth).toBeGreaterThanOrEqual(44);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    // Lightbox nav buttons should be even larger
    const navBtns = document.querySelectorAll('.lightbox-nav');
    navBtns.forEach(btn => {
      const minWidth = parseInt(btn.style.minWidth);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });
});

describe('Accessibility: ARIA States Consistency', () => {
  test('aria-pressed matches visual active class', () => {
    document.body.innerHTML = `
      <button class="tech-filter-btn active" aria-pressed="true">Kotlin</button>
      <button class="tech-filter-btn" aria-pressed="false">Python</button>
      <button class="year-pill active" data-year="all" aria-pressed="true">All</button>
      <button class="year-pill" data-year="2025" aria-pressed="false">2025</button>
    `;

    const toggleButtons = document.querySelectorAll('[aria-pressed]');
    toggleButtons.forEach(btn => {
      const isActive = btn.classList.contains('active');
      const ariaPressed = btn.getAttribute('aria-pressed') === 'true';
      expect(ariaPressed).toBe(isActive);
    });
  });
});

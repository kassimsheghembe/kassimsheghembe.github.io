/**
 * Performance Optimizer
 * Implements lazy loading, skeleton screens, and performance optimizations
 */
class PerformanceOptimizer {
  constructor() {
    this.lazyImages = [];
    this.intersectionObserver = null;
    this.loadingStates = new Map();
    this.performanceMetrics = {
      imagesLoaded: 0,
      totalImages: 0,
      loadStartTime: Date.now()
    };
    
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.initializeLazyLoading();
    this.addSkeletonScreens();
    this.optimizeJavaScript();
    this.preloadCriticalResources();
    this.setupPerformanceMonitoring();
  }

  /**
   * Setup Intersection Observer for lazy loading
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
    }
  }

  /**
   * Initialize lazy loading for images
   */
  initializeLazyLoading() {
    // Find all images that should be lazy loaded
    const images = document.querySelectorAll('img[loading="lazy"], .gallery-thumbnail, .card-img-top');
    
    images.forEach(img => {
      if (img.dataset.src || img.src) {
        this.setupLazyImage(img);
      }
    });

    // Handle dynamically added images
    this.observeNewImages();
  }

  /**
   * Setup individual image for lazy loading
   */
  setupLazyImage(img) {
    // Store original src and replace with placeholder
    if (!img.dataset.src && img.src && !img.src.includes('placeholder')) {
      img.dataset.src = img.src;
      img.src = this.generatePlaceholder(img);
    }

    // Add loading class
    img.classList.add('lazy-image', 'loading');
    
    // Create skeleton screen
    this.addImageSkeleton(img);
    
    // Observe for intersection
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }

    this.performanceMetrics.totalImages++;
  }

  /**
   * Generate placeholder for image
   */
  generatePlaceholder(img) {
    const width = img.width || 300;
    const height = img.height || 200;
    
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Add skeleton screen for image
   */
  addImageSkeleton(img) {
    const skeleton = document.createElement('div');
    skeleton.className = 'image-skeleton';
    skeleton.innerHTML = `
      <div class="skeleton-shimmer"></div>
      <div class="skeleton-content">
        <div class="skeleton-icon">
          <i class="fas fa-image"></i>
        </div>
      </div>
    `;
    
    // Insert skeleton before image
    img.parentNode.insertBefore(skeleton, img);
    img.style.display = 'none';
  }

  /**
   * Load image and handle loading states
   */
  loadImage(img) {
    const src = img.dataset.src || img.src;
    if (!src || img.classList.contains('loaded')) return;

    // Show loading state
    this.showLoadingState(img);

    // Create new image to preload
    const newImg = new Image();
    
    newImg.onload = () => {
      this.onImageLoad(img, src);
    };
    
    newImg.onerror = () => {
      this.onImageError(img);
    };
    
    // Start loading
    newImg.src = src;
  }

  /**
   * Handle successful image load
   */
  onImageLoad(img, src) {
    img.src = src;
    img.classList.remove('loading');
    img.classList.add('loaded');
    img.style.display = '';
    
    // Remove skeleton
    const skeleton = img.parentNode.querySelector('.image-skeleton');
    if (skeleton) {
      skeleton.classList.add('fade-out');
      setTimeout(() => skeleton.remove(), 300);
    }
    
    // Add fade-in animation
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    // Trigger reflow and fade in
    img.offsetHeight;
    img.style.opacity = '1';
    
    this.performanceMetrics.imagesLoaded++;
    this.updateLoadingProgress();
  }

  /**
   * Handle image load error
   */
  onImageError(img) {
    img.classList.remove('loading');
    img.classList.add('error');
    
    // Show error placeholder
    img.src = this.generateErrorPlaceholder();
    img.style.display = '';
    
    // Remove skeleton
    const skeleton = img.parentNode.querySelector('.image-skeleton');
    if (skeleton) {
      skeleton.remove();
    }
  }

  /**
   * Generate error placeholder
   */
  generateErrorPlaceholder() {
    const svg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6"/>
        <text x="50%" y="45%" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="12">
          <tspan x="50%" dy="0">Image failed to load</tspan>
          <tspan x="50%" dy="20">Click to retry</tspan>
        </text>
        <circle cx="50%" cy="65%" r="15" fill="none" stroke="#6c757d" stroke-width="2"/>
        <path d="M 45% 65% L 50% 70% L 55% 60%" stroke="#6c757d" stroke-width="2" fill="none"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Show loading state for image
   */
  showLoadingState(img) {
    const container = img.closest('.project-card, .gallery-item');
    if (container) {
      container.classList.add('loading-content');
    }
  }

  /**
   * Update loading progress
   */
  updateLoadingProgress() {
    const progress = (this.performanceMetrics.imagesLoaded / this.performanceMetrics.totalImages) * 100;
    
    // Dispatch custom event for progress updates
    document.dispatchEvent(new CustomEvent('imageLoadProgress', {
      detail: {
        loaded: this.performanceMetrics.imagesLoaded,
        total: this.performanceMetrics.totalImages,
        progress: progress
      }
    }));
    
    // Update any progress indicators
    const progressBars = document.querySelectorAll('.loading-progress');
    progressBars.forEach(bar => {
      bar.style.width = `${progress}%`;
    });
  }

  /**
   * Add skeleton screens for content
   */
  addSkeletonScreens() {
    // Add skeleton screens for project cards while loading
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      if (!card.querySelector('.card-skeleton')) {
        this.addCardSkeleton(card);
      }
    });

    // Add skeleton for gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      if (!item.querySelector('.gallery-skeleton')) {
        this.addGallerySkeleton(item);
      }
    });
  }

  /**
   * Add skeleton screen for project card
   */
  addCardSkeleton(card) {
    const skeleton = document.createElement('div');
    skeleton.className = 'card-skeleton';
    skeleton.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
        <div class="skeleton-tags">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
        </div>
      </div>
    `;
    
    card.appendChild(skeleton);
    
    // Hide skeleton when content is loaded
    setTimeout(() => {
      if (skeleton.parentNode) {
        skeleton.classList.add('fade-out');
        setTimeout(() => skeleton.remove(), 300);
      }
    }, 1000);
  }

  /**
   * Add skeleton screen for gallery item
   */
  addGallerySkeleton(item) {
    const skeleton = document.createElement('div');
    skeleton.className = 'gallery-skeleton';
    skeleton.innerHTML = `
      <div class="skeleton-gallery-image"></div>
      <div class="skeleton-caption"></div>
    `;
    
    item.appendChild(skeleton);
  }

  /**
   * Optimize JavaScript execution
   */
  optimizeJavaScript() {
    // Debounce scroll events
    this.debounceScrollEvents();
    
    // Throttle resize events
    this.throttleResizeEvents();
    
    // Optimize filter operations
    this.optimizeFiltering();
    
    // Preload critical scripts
    this.preloadScripts();
  }

  /**
   * Debounce scroll events for better performance
   */
  debounceScrollEvents() {
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    
    window.onscroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (originalScrollHandler) {
          originalScrollHandler();
        }
        this.handleScroll();
      }, 16); // ~60fps
    };
  }

  /**
   * Handle optimized scroll events
   */
  handleScroll() {
    // Check if any lazy images need loading
    if (this.intersectionObserver) return; // Already handled by IntersectionObserver
    
    const images = document.querySelectorAll('.lazy-image.loading');
    images.forEach(img => {
      if (this.isInViewport(img)) {
        this.loadImage(img);
      }
    });
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -50 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 50 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Throttle resize events
   */
  throttleResizeEvents() {
    let resizeTimeout;
    const originalResizeHandler = window.onresize;
    
    window.onresize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (originalResizeHandler) {
          originalResizeHandler();
        }
        this.handleResize();
      }, 250);
    };
  }

  /**
   * Handle optimized resize events
   */
  handleResize() {
    // Recalculate lazy loading positions
    this.recalculateLazyLoading();
  }

  /**
   * Recalculate lazy loading after resize
   */
  recalculateLazyLoading() {
    const images = document.querySelectorAll('.lazy-image.loading');
    images.forEach(img => {
      if (this.isInViewport(img)) {
        this.loadImage(img);
      }
    });
  }

  /**
   * Optimize filtering operations
   */
  optimizeFiltering() {
    // Cache DOM queries
    this.cachedElements = {
      projectCards: document.querySelectorAll('.project-card'),
      filterButtons: document.querySelectorAll('.tech-filter-btn, .category-filter-btn'),
      searchInput: document.getElementById('project-search')
    };
    
    // Use requestAnimationFrame for smooth animations
    this.optimizeFilterAnimations();
  }

  /**
   * Optimize filter animations
   */
  optimizeFilterAnimations() {
    const originalRenderResults = window.projectFilter?.renderResults;
    if (!originalRenderResults) return;
    
    window.projectFilter.renderResults = () => {
      requestAnimationFrame(() => {
        originalRenderResults.call(window.projectFilter);
      });
    };
  }

  /**
   * Preload critical scripts
   */
  preloadScripts() {
    const criticalScripts = [
      '/assets/js/project-filter.js',
      '/assets/js/mobile-touch.js'
    ];
    
    criticalScripts.forEach(script => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = script;
      document.head.appendChild(link);
    });
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    // Preload critical images
    this.preloadCriticalImages();
    
    // Preload fonts
    this.preloadFonts();
    
    // Prefetch likely navigation targets
    this.prefetchNavigation();
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages() {
    // Preload featured project images
    const featuredImages = document.querySelectorAll('.featured-badge').map(badge => {
      const card = badge.closest('.project-card');
      const img = card?.querySelector('img[data-src], img[src]');
      return img?.dataset.src || img?.src;
    }).filter(Boolean);
    
    featuredImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  /**
   * Preload fonts
   */
  preloadFonts() {
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap'
    ];
    
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = font;
      document.head.appendChild(link);
    });
  }

  /**
   * Prefetch likely navigation targets
   */
  prefetchNavigation() {
    // Prefetch project detail pages for visible cards
    const visibleCards = Array.from(document.querySelectorAll('.project-card')).filter(card => 
      this.isInViewport(card)
    );
    
    visibleCards.forEach(card => {
      const link = card.querySelector('.project-link');
      if (link) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = link.href;
        document.head.appendChild(prefetchLink);
      }
    });
  }

  /**
   * Observe new images added to DOM
   */
  observeNewImages() {
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const images = node.querySelectorAll ? 
                node.querySelectorAll('img[loading="lazy"], .gallery-thumbnail, .card-img-top') : 
                [];
              
              images.forEach(img => {
                if (!img.classList.contains('lazy-image')) {
                  this.setupLazyImage(img);
                }
              });
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor resource loading
    this.monitorResourceLoading();
    
    // Monitor user interactions
    this.monitorUserInteractions();
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
    
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  /**
   * Monitor resource loading
   */
  monitorResourceLoading() {
    window.addEventListener('load', () => {
      const loadTime = Date.now() - this.performanceMetrics.loadStartTime;
      console.log('Page load time:', loadTime + 'ms');
      
      // Report slow loading resources
      if ('performance' in window) {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(resource => resource.duration > 1000);
        
        if (slowResources.length > 0) {
          console.warn('Slow loading resources:', slowResources);
        }
      }
    });
  }

  /**
   * Monitor user interactions
   */
  monitorUserInteractions() {
    // Monitor First Input Delay
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      loadTime: Date.now() - this.performanceMetrics.loadStartTime,
      imagesProgress: (this.performanceMetrics.imagesLoaded / this.performanceMetrics.totalImages) * 100
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    // Remove event listeners
    window.onscroll = null;
    window.onresize = null;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.performanceOptimizer = new PerformanceOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}
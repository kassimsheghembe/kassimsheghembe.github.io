/**
 * Responsive Images Handler
 * Handles responsive image loading, WebP detection, and fallbacks
 */
class ResponsiveImages {
  constructor() {
    this.supportsWebP = false;
    this.breakpoints = [320, 480, 768, 1024, 1200, 1600];
    this.imageCache = new Map();
    
    this.init();
  }

  init() {
    this.detectWebPSupport();
    this.setupResponsiveImages();
    this.handleImageErrors();
    this.optimizeImageLoading();
  }

  /**
   * Detect WebP support
   */
  detectWebPSupport() {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      this.supportsWebP = (webP.height === 2);
      document.documentElement.classList.toggle('webp', this.supportsWebP);
      document.documentElement.classList.toggle('no-webp', !this.supportsWebP);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }

  /**
   * Setup responsive images
   */
  setupResponsiveImages() {
    const images = document.querySelectorAll('.responsive-image');
    
    images.forEach(img => {
      this.setupResponsiveImage(img);
    });

    // Handle dynamically added images
    this.observeNewImages();
  }

  /**
   * Setup individual responsive image
   */
  setupResponsiveImage(img) {
    // Skip if already processed
    if (img.dataset.processed) return;
    
    img.dataset.processed = 'true';
    
    // Get image data
    const src = img.dataset.src || img.src;
    
    if (!src) return;
    
    // Only process lazy images - let browser handle eager loading naturally
    if (img.classList.contains('lazy-image')) {
      this.setupLazyLoading(img);
    } else {
      // For non-lazy images, just mark as loaded and let browser handle everything
      img.classList.add('loaded');
    }
  }

  /**
   * Setup lazy loading for responsive image
   */
  setupLazyLoading(img) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadResponsiveImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
      
      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadResponsiveImage(img);
    }
  }

  /**
   * Load responsive image (simplified)
   */
  loadResponsiveImage(img) {
    const src = img.dataset.src || img.src;
    
    if (!src) return;
    
    // For lazy loading, just set the src and let the browser handle the rest
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    
    // Add loaded class after a short delay to allow browser to load
    setTimeout(() => {
      img.classList.add('loaded');
      this.hideImageLoading(img);
    }, 100);
  }

  /**
   * Get best image source based on device capabilities
   */
  getBestImageSource(src, srcset, img) {
    if (!srcset) return src;
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const imgWidth = img.clientWidth || 300;
    const targetWidth = imgWidth * devicePixelRatio;
    
    // Parse srcset
    const sources = srcset.split(',').map(source => {
      const [url, descriptor] = source.trim().split(' ');
      const width = parseInt(descriptor.replace('w', ''));
      return { url, width };
    });
    
    // Find best match
    let bestSource = sources[0];
    for (const source of sources) {
      if (source.width >= targetWidth) {
        bestSource = source;
        break;
      }
      if (source.width > bestSource.width) {
        bestSource = source;
      }
    }
    
    return bestSource.url;
  }

  /**
   * Load image with caching
   */
  loadImage(src, img) {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (this.imageCache.has(src)) {
        const cachedImage = this.imageCache.get(src);
        if (cachedImage.complete) {
          resolve(cachedImage);
          return;
        }
      }
      
      const image = new Image();
      
      image.onload = () => {
        this.imageCache.set(src, image);
        resolve(image);
      };
      
      image.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      // Copy attributes for proper loading
      if (img.sizes) image.sizes = img.sizes;
      if (img.srcset) image.srcset = img.srcset;
      
      image.src = src;
    });
  }

  /**
   * Handle successful image load
   */
  onImageLoad(img, src, srcset) {
    // Update image source
    img.src = src;
    if (srcset) {
      img.srcset = srcset;
    }
    
    // Remove loading state
    this.hideImageLoading(img);
    
    // Add loaded class
    img.classList.remove('loading');
    img.classList.add('loaded');
    
    // Fade in animation
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    // Trigger reflow and fade in
    img.offsetHeight;
    img.style.opacity = '1';
    
    // Dispatch load event
    img.dispatchEvent(new CustomEvent('responsiveImageLoaded', {
      detail: { src, srcset }
    }));
  }

  /**
   * Handle image load error
   */
  onImageError(img, originalSrc) {
    // Try fallback sources
    const fallbackSources = this.generateFallbackSources(originalSrc);
    
    this.tryFallbackSources(img, fallbackSources).then((successSrc) => {
      this.onImageLoad(img, successSrc, null);
    }).catch(() => {
      // All sources failed, show error placeholder
      this.showImageError(img);
    });
  }

  /**
   * Generate fallback sources
   */
  generateFallbackSources(src) {
    const fallbacks = [];
    
    // Try different formats
    if (src.includes('.webp')) {
      fallbacks.push(src.replace('.webp', '.jpg'));
      fallbacks.push(src.replace('.webp', '.png'));
    } else if (src.includes('.jpg')) {
      fallbacks.push(src.replace('.jpg', '.png'));
    } else if (src.includes('.png')) {
      fallbacks.push(src.replace('.png', '.jpg'));
    }
    
    // Try placeholder
    fallbacks.push('/assets/images/placeholder-project.jpg');
    fallbacks.push('/assets/images/placeholder-project.png');
    fallbacks.push('data:image/svg+xml;base64,' + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">
          Image not available
        </text>
      </svg>
    `));
    
    return fallbacks;
  }

  /**
   * Try fallback sources
   */
  tryFallbackSources(img, sources) {
    return new Promise((resolve, reject) => {
      let currentIndex = 0;
      
      const tryNext = () => {
        if (currentIndex >= sources.length) {
          reject(new Error('All fallback sources failed'));
          return;
        }
        
        const src = sources[currentIndex];
        currentIndex++;
        
        this.loadImage(src, img).then(() => {
          resolve(src);
        }).catch(() => {
          tryNext();
        });
      };
      
      tryNext();
    });
  }

  /**
   * Show image loading state
   */
  showImageLoading(img) {
    img.classList.add('loading');
    
    const container = img.closest('.responsive-image-container');
    if (container) {
      container.classList.add('loading');
    }
  }

  /**
   * Hide image loading state
   */
  hideImageLoading(img) {
    img.classList.remove('loading');
    
    const container = img.closest('.responsive-image-container');
    if (container) {
      container.classList.remove('loading');
      
      // Hide skeleton
      const skeleton = container.querySelector('.image-skeleton');
      if (skeleton) {
        skeleton.classList.add('fade-out');
        setTimeout(() => skeleton.remove(), 300);
      }
    }
  }

  /**
   * Show image error state
   */
  showImageError(img) {
    img.classList.remove('loading');
    img.classList.add('error');
    
    // Generate error placeholder
    const errorSrc = this.generateErrorPlaceholder(img);
    img.src = errorSrc;
    
    // Hide skeleton
    this.hideImageLoading(img);
    
    // Add click to retry
    img.style.cursor = 'pointer';
    img.title = 'Click to retry loading';
    
    img.addEventListener('click', () => {
      this.retryImageLoad(img);
    }, { once: true });
  }

  /**
   * Generate error placeholder
   */
  generateErrorPlaceholder(img) {
    const width = img.width || 300;
    const height = img.height || 200;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6"/>
        <text x="50%" y="40%" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="12">
          <tspan x="50%" dy="0">Image failed to load</tspan>
          <tspan x="50%" dy="20">Click to retry</tspan>
        </text>
        <circle cx="50%" cy="70%" r="15" fill="none" stroke="#6c757d" stroke-width="2"/>
        <path d="M 45% 70% L 50% 75% L 55% 65%" stroke="#6c757d" stroke-width="2" fill="none"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Retry image load
   */
  retryImageLoad(img) {
    img.classList.remove('error');
    img.style.cursor = '';
    img.title = '';
    
    const originalSrc = img.dataset.src || img.dataset.originalSrc;
    if (originalSrc) {
      this.loadResponsiveImage(img);
    }
  }

  /**
   * Handle image errors globally
   */
  handleImageErrors() {
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG' && e.target.classList.contains('responsive-image')) {
        this.onImageError(e.target, e.target.src);
      }
    }, true);
  }

  /**
   * Optimize image loading
   */
  optimizeImageLoading() {
    // Preload critical images
    this.preloadCriticalImages();
    
    // Setup connection-aware loading
    this.setupConnectionAwareLoading();
    
    // Setup viewport-based loading
    this.setupViewportBasedLoading();
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('.responsive-image[loading="eager"], .hero-image, .featured-image');
    
    criticalImages.forEach(img => {
      const src = img.dataset.src || img.src;
      if (src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Setup connection-aware loading
   */
  setupConnectionAwareLoading() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Adjust loading strategy based on connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.enableDataSaverMode();
      }
      
      // Listen for connection changes
      connection.addEventListener('change', () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.enableDataSaverMode();
        } else {
          this.disableDataSaverMode();
        }
      });
    }
  }

  /**
   * Enable data saver mode
   */
  enableDataSaverMode() {
    document.documentElement.classList.add('data-saver');
    
    // Use smaller images
    const images = document.querySelectorAll('.responsive-image[data-srcset]');
    images.forEach(img => {
      if (!img.classList.contains('loaded')) {
        // Force smaller image sizes
        const srcset = img.dataset.srcset;
        if (srcset) {
          const sources = srcset.split(',');
          const smallestSource = sources[0]; // First source is usually smallest
          img.dataset.srcset = smallestSource;
        }
      }
    });
  }

  /**
   * Disable data saver mode
   */
  disableDataSaverMode() {
    document.documentElement.classList.remove('data-saver');
  }

  /**
   * Setup viewport-based loading
   */
  setupViewportBasedLoading() {
    // Adjust loading based on viewport size
    const updateImageSizes = () => {
      const images = document.querySelectorAll('.responsive-image');
      
      images.forEach(img => {
        if (!img.classList.contains('loaded')) {
          const sizes = this.calculateOptimalSizes(img);
          img.sizes = sizes;
        }
      });
    };
    
    // Update on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateImageSizes, 250);
    });
    
    // Initial calculation
    updateImageSizes();
  }

  /**
   * Calculate optimal sizes attribute
   */
  calculateOptimalSizes(img) {
    const container = img.closest('.project-card, .gallery-item, .hero-section');
    if (!container) return '100vw';
    
    const containerWidth = container.clientWidth;
    const viewportWidth = window.innerWidth;
    
    // Calculate percentage of viewport
    const percentage = Math.round((containerWidth / viewportWidth) * 100);
    
    // Generate sizes string
    if (viewportWidth <= 768) {
      return '100vw';
    } else if (viewportWidth <= 1200) {
      return `${Math.min(percentage, 50)}vw`;
    } else {
      return `${Math.min(percentage, 33)}vw`;
    }
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
                node.querySelectorAll('.responsive-image') : 
                [];
              
              images.forEach(img => {
                if (!img.dataset.processed) {
                  this.setupResponsiveImage(img);
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
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      supportsWebP: this.supportsWebP,
      cachedImages: this.imageCache.size,
      totalImages: document.querySelectorAll('.responsive-image').length,
      loadedImages: document.querySelectorAll('.responsive-image.loaded').length,
      errorImages: document.querySelectorAll('.responsive-image.error').length
    };
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.responsiveImages = new ResponsiveImages();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveImages;
}
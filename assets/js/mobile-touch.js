/**
 * Mobile Touch Interactions Enhancement
 * Optimizes touch interactions for mobile devices across the project showcase
 */
class MobileTouchEnhancer {
  constructor() {
    this.touchThreshold = 50;
    this.touchStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.touchEndPos = { x: 0, y: 0 };
    this.isTouch = false;
    
    this.init();
  }

  init() {
    this.detectTouchDevice();
    this.enhanceProjectCards();
    this.enhanceGalleryNavigation();
    this.enhanceFilterControls();
    this.addTouchFeedback();
    this.optimizeTouchTargets();
  }

  /**
   * Detect if device supports touch
   */
  detectTouchDevice() {
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (this.isTouch) {
      document.body.classList.add('touch-device');
    }
  }

  /**
   * Enhance project card touch interactions
   */
  enhanceProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      this.addTouchInteraction(card, {
        onTap: () => {
          const link = card.querySelector('.project-link');
          if (link) {
            window.location.href = link.href;
          }
        },
        onLongPress: () => {
          this.showProjectQuickActions(card);
        }
      });

      // Improve hover states for touch devices
      if (this.isTouch) {
        card.addEventListener('touchstart', () => {
          card.classList.add('touch-active');
        });

        card.addEventListener('touchend', () => {
          setTimeout(() => {
            card.classList.remove('touch-active');
          }, 150);
        });
      }
    });
  }

  /**
   * Enhanced gallery navigation with better touch support
   */
  enhanceGalleryNavigation() {
    const galleries = document.querySelectorAll('.project-gallery');
    
    galleries.forEach(gallery => {
      this.addGallerySwipeNavigation(gallery);
      this.enhanceGalleryThumbnails(gallery);
    });

    // Enhance lightbox touch interactions
    this.enhanceLightboxTouch();
  }

  /**
   * Add swipe navigation to gallery
   */
  addGallerySwipeNavigation(gallery) {
    const galleryGrid = gallery.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;

    galleryGrid.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      currentY = startY;
      isDragging = true;
    }, { passive: true });

    galleryGrid.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      // Prevent default scrolling if horizontal swipe is detected
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    galleryGrid.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      // Only process horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.touchThreshold) {
        if (deltaX > 0) {
          this.navigateGallery(gallery, 'prev');
        } else {
          this.navigateGallery(gallery, 'next');
        }
      }
      
      isDragging = false;
    }, { passive: true });
  }

  /**
   * Navigate gallery programmatically
   */
  navigateGallery(gallery, direction) {
    const items = gallery.querySelectorAll('.gallery-item');
    const visibleItems = Array.from(items).filter(item => 
      item.getBoundingClientRect().left >= 0
    );
    
    if (visibleItems.length === 0) return;
    
    const currentItem = visibleItems[0];
    let targetItem;
    
    if (direction === 'next') {
      targetItem = currentItem.nextElementSibling;
    } else {
      targetItem = currentItem.previousElementSibling;
    }
    
    if (targetItem) {
      targetItem.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'start'
      });
    }
  }

  /**
   * Enhance gallery thumbnails for touch
   */
  enhanceGalleryThumbnails(gallery) {
    const thumbnails = gallery.querySelectorAll('.gallery-thumbnail-container');
    
    thumbnails.forEach(thumbnail => {
      // Increase touch target size
      thumbnail.style.minHeight = '44px';
      thumbnail.style.minWidth = '44px';
      
      // Add touch feedback
      thumbnail.addEventListener('touchstart', () => {
        thumbnail.classList.add('touch-pressed');
      });
      
      thumbnail.addEventListener('touchend', () => {
        setTimeout(() => {
          thumbnail.classList.remove('touch-pressed');
        }, 150);
      });
    });
  }

  /**
   * Enhanced lightbox touch interactions
   */
  enhanceLightboxTouch() {
    const lightboxes = document.querySelectorAll('.gallery-lightbox');
    
    lightboxes.forEach(lightbox => {
      this.addLightboxGestures(lightbox);
      this.improveLightboxNavigation(lightbox);
    });
  }

  /**
   * Add advanced gesture support to lightbox
   */
  addLightboxGestures(lightbox) {
    const imageContainer = lightbox.querySelector('.lightbox-image-container');
    if (!imageContainer) return;

    let scale = 1;
    let startDistance = 0;
    let startScale = 1;
    let isPinching = false;

    // Pinch to zoom
    imageContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        startDistance = this.getDistance(e.touches[0], e.touches[1]);
        startScale = scale;
        e.preventDefault();
      }
    });

    imageContainer.addEventListener('touchmove', (e) => {
      if (isPinching && e.touches.length === 2) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scaleChange = currentDistance / startDistance;
        scale = Math.min(Math.max(startScale * scaleChange, 0.5), 3);
        
        const image = imageContainer.querySelector('.lightbox-image');
        if (image) {
          image.style.transform = `scale(${scale})`;
        }
        e.preventDefault();
      }
    });

    imageContainer.addEventListener('touchend', (e) => {
      if (isPinching) {
        isPinching = false;
        
        // Reset zoom if scale is close to 1
        if (scale > 0.9 && scale < 1.1) {
          scale = 1;
          const image = imageContainer.querySelector('.lightbox-image');
          if (image) {
            image.style.transform = 'scale(1)';
          }
        }
      }
    });

    // Double tap to zoom
    let lastTap = 0;
    imageContainer.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0 && e.touches.length === 0) {
        const image = imageContainer.querySelector('.lightbox-image');
        if (image) {
          if (scale === 1) {
            scale = 2;
            image.style.transform = 'scale(2)';
          } else {
            scale = 1;
            image.style.transform = 'scale(1)';
          }
        }
        e.preventDefault();
      }
      lastTap = currentTime;
    });
  }

  /**
   * Get distance between two touch points
   */
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Improve lightbox navigation for touch
   */
  improveLightboxNavigation(lightbox) {
    const navButtons = lightbox.querySelectorAll('.lightbox-nav');
    
    navButtons.forEach(button => {
      // Increase touch target size
      button.style.minWidth = '60px';
      button.style.minHeight = '60px';
      
      // Add touch feedback
      button.addEventListener('touchstart', () => {
        button.classList.add('touch-pressed');
      });
      
      button.addEventListener('touchend', () => {
        setTimeout(() => {
          button.classList.remove('touch-pressed');
        }, 150);
      });
    });

    // Add swipe zones for easier navigation
    const content = lightbox.querySelector('.lightbox-content');
    if (content) {
      this.addSwipeZones(content, lightbox);
    }
  }

  /**
   * Add invisible swipe zones for easier navigation
   */
  addSwipeZones(content, lightbox) {
    const leftZone = document.createElement('div');
    const rightZone = document.createElement('div');
    
    leftZone.className = 'lightbox-swipe-zone left-zone';
    rightZone.className = 'lightbox-swipe-zone right-zone';
    
    // Style the zones
    const zoneStyle = {
      position: 'absolute',
      top: '0',
      width: '25%',
      height: '100%',
      zIndex: '10',
      cursor: 'pointer'
    };
    
    Object.assign(leftZone.style, zoneStyle, { left: '0' });
    Object.assign(rightZone.style, zoneStyle, { right: '0' });
    
    content.appendChild(leftZone);
    content.appendChild(rightZone);
    
    // Add swipe functionality
    this.addTouchInteraction(leftZone, {
      onSwipeRight: () => {
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        if (prevBtn && !prevBtn.disabled) {
          prevBtn.click();
        }
      }
    });
    
    this.addTouchInteraction(rightZone, {
      onSwipeLeft: () => {
        const nextBtn = lightbox.querySelector('.lightbox-next');
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click();
        }
      }
    });
  }

  /**
   * Enhance filter controls for touch
   */
  enhanceFilterControls() {
    const filterButtons = document.querySelectorAll('.tech-filter-btn, .category-filter-btn');
    
    filterButtons.forEach(button => {
      // Ensure minimum touch target size
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        button.style.minWidth = '44px';
        button.style.minHeight = '44px';
        button.style.padding = '0.5rem 1rem';
      }
      
      // Add touch feedback
      this.addTouchFeedback(button);
    });

    // Enhance search input for mobile
    const searchInput = document.getElementById('project-search');
    if (searchInput) {
      searchInput.style.fontSize = '16px'; // Prevent zoom on iOS
      searchInput.setAttribute('autocomplete', 'off');
      searchInput.setAttribute('autocorrect', 'off');
      searchInput.setAttribute('spellcheck', 'false');
    }
  }

  /**
   * Add visual touch feedback to elements
   */
  addTouchFeedback(element = null) {
    const elements = element ? [element] : document.querySelectorAll('button, .btn, .project-card, .gallery-item');
    
    elements.forEach(el => {
      if (el.classList.contains('touch-enhanced')) return;
      
      el.classList.add('touch-enhanced');
      
      el.addEventListener('touchstart', () => {
        el.classList.add('touch-active');
      });
      
      el.addEventListener('touchend', () => {
        setTimeout(() => {
          el.classList.remove('touch-active');
        }, 150);
      });
      
      el.addEventListener('touchcancel', () => {
        el.classList.remove('touch-active');
      });
    });
  }

  /**
   * Optimize touch targets across the interface
   */
  optimizeTouchTargets() {
    // Ensure all interactive elements meet minimum touch target size (44x44px)
    const interactiveElements = document.querySelectorAll('button, .btn, a, input, .tech-tag, .gallery-item');
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      
      if (rect.width > 0 && rect.height > 0) {
        if (rect.width < 44) {
          element.style.minWidth = '44px';
        }
        if (rect.height < 44) {
          element.style.minHeight = '44px';
        }
      }
    });

    // Add spacing between touch targets
    const buttonGroups = document.querySelectorAll('.action-buttons, .filter-controls, .technology-tags');
    buttonGroups.forEach(group => {
      group.style.gap = '0.75rem';
    });
  }

  /**
   * Show quick actions for project card on long press
   */
  showProjectQuickActions(card) {
    const existingMenu = document.querySelector('.project-quick-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'project-quick-menu';
    
    const projectData = {
      title: card.dataset.title,
      demo: card.querySelector('a[href*="demo"]')?.href,
      github: card.querySelector('a[href*="github"]')?.href,
      details: card.querySelector('.project-link')?.href
    };

    menu.innerHTML = `
      <div class="quick-menu-header">
        <h6>${projectData.title}</h6>
        <button class="close-menu" aria-label="Close menu">×</button>
      </div>
      <div class="quick-menu-actions">
        ${projectData.details ? `<a href="${projectData.details}" class="quick-action">View Details</a>` : ''}
        ${projectData.demo ? `<a href="${projectData.demo}" class="quick-action" target="_blank">Live Demo</a>` : ''}
        ${projectData.github ? `<a href="${projectData.github}" class="quick-action" target="_blank">Source Code</a>` : ''}
      </div>
    `;

    document.body.appendChild(menu);

    // Position menu
    const rect = card.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.top + window.scrollY}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.width = `${rect.width}px`;

    // Close menu handlers
    const closeMenu = () => menu.remove();
    menu.querySelector('.close-menu').addEventListener('click', closeMenu);
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu, { once: true });
    }, 100);
  }

  /**
   * Generic touch interaction handler
   */
  addTouchInteraction(element, options = {}) {
    let startTime = 0;
    let startPos = { x: 0, y: 0 };
    let endPos = { x: 0, y: 0 };
    let longPressTimer = null;

    element.addEventListener('touchstart', (e) => {
      startTime = Date.now();
      startPos.x = e.touches[0].clientX;
      startPos.y = e.touches[0].clientY;
      
      // Long press detection
      if (options.onLongPress) {
        longPressTimer = setTimeout(() => {
          options.onLongPress(e);
          navigator.vibrate && navigator.vibrate(50); // Haptic feedback
        }, 500);
      }
    });

    element.addEventListener('touchmove', (e) => {
      const currentPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      
      const distance = Math.sqrt(
        Math.pow(currentPos.x - startPos.x, 2) + 
        Math.pow(currentPos.y - startPos.y, 2)
      );
      
      // Cancel long press if moved too much
      if (distance > 10 && longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    element.addEventListener('touchend', (e) => {
      const endTime = Date.now();
      endPos.x = e.changedTouches[0].clientX;
      endPos.y = e.changedTouches[0].clientY;
      
      const duration = endTime - startTime;
      const deltaX = endPos.x - startPos.x;
      const deltaY = endPos.y - startPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      
      // Tap detection
      if (duration < 500 && distance < 10 && options.onTap) {
        options.onTap(e);
      }
      
      // Swipe detection
      if (distance > this.touchThreshold) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        if (Math.abs(angle) < 45 && options.onSwipeRight) {
          options.onSwipeRight(e);
        } else if (Math.abs(angle) > 135 && options.onSwipeLeft) {
          options.onSwipeLeft(e);
        } else if (angle > 45 && angle < 135 && options.onSwipeDown) {
          options.onSwipeDown(e);
        } else if (angle < -45 && angle > -135 && options.onSwipeUp) {
          options.onSwipeUp(e);
        }
      }
    });

    element.addEventListener('touchcancel', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    window.mobileTouchEnhancer = new MobileTouchEnhancer();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileTouchEnhancer;
}
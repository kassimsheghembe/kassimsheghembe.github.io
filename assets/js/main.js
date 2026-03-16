document.addEventListener('DOMContentLoaded', function () {

  // Progress bar animation
  var bars = document.querySelectorAll('.progress-bar');
  bars.forEach(function (bar) {
    bar.style.width = '0';
    bar.style.transition = 'width 0.8s ease';
  });

  window.addEventListener('load', function () {
    bars.forEach(function (bar) {
      var level = bar.dataset.level;
      if (level) {
        bar.style.width = level;
      }
    });
  });

  // Hamburger menu
  var hamburger = document.querySelector('.hamburger');
  var navMenu = document.querySelector('.nav-menu');

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMobileMenu();
        hamburger.focus();
      }
    });
  }

  function toggleMobileMenu() {
    var isActive = hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  }

  if (navMenu) {
    navMenu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMobileMenu();
        hamburger.focus();
      }
    });
  }

});

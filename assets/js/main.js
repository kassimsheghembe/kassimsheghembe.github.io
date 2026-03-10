$(document).ready(function($) {

    $('.progress-bar').css('width', '0');
    
    $(window).on('load', function() {

        $('.progress-bar').each(function() {
        
            var itemWidth = $(this).data('level');
            
            $(this).animate({
                width: itemWidth
            }, 800);
            
        });

    });

    $(window).on('load', function() {
        const hamburger = document.querySelector(".hamburger");
        const navMenu = document.querySelector(".nav-menu");

        if (hamburger) {
            hamburger.addEventListener("click", toggleMobileMenu);
            hamburger.addEventListener("keydown", function(e) {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                    hamburger.focus();
                }
            });
        }

        function toggleMobileMenu() {
            const isActive = hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive ? "true" : "false");
        }

        // Close mobile menu on Escape from nav links
        if (navMenu) {
            navMenu.addEventListener("keydown", function(e) {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                    hamburger.focus();
                }
            });
        }
    });

});


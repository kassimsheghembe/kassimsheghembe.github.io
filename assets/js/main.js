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
    
        hamburger.addEventListener("click", showMobileMenu);
    
        function showMobileMenu() {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        }
    });

});
jQuery(document).ready(function($) {

    $('.progress-bar').css('width', '0');
    
    $(window).on('load', function() {

        $('.progress-bar').each(function() {
        
            var itemWidth = $(this).data('level');
            
            $(this).animate({
                width: itemWidth
            }, 800);
            
        });

    });
   
    

});
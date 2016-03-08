/**
 * Main styling and functionality
 *
 * @author  Pattie Reaves <preaves@bangordailynews.com>
 * @copyright 2014 Bangor Daily News
 */
/*jshint strict:false */
/*global $:false */
/*global Handlebars:false */
/*global BootstrapDialog:false */
/*global Modernizr:false */
/*global _V_:false */
/*global ga:false */
function sizeFunctions() {
    $('#intro').css({
        'width': $(window).width(),
        'height': $(window).height()
    });
}

$(function() {

    var videos = new Object;

    // Initialize Handlebars templates
    var cards = Handlebars.compile($('#card-template').html());

    sizeFunctions();

       $.getJSON(
        'data/chapters.json',
        function(mainChapters) {

            console.log(mainChapters);

            // Find the chapter we want to display based on the URL.
            var displayChapter = mainChapters[0]; //initialize at first chapter
            displayChapter.count = 0;

            $.each(mainChapters, function(index, value){
                if( location.href.indexOf( value.name ) > 0 ) {
                    displayChapter = value;
                    displayChapter.count = index;
                }
            });//each mainChapters 

            $.each(mainChapters, function(chapterNumber, chapterMeta) {
                 var chapterMachineName = chapterMeta.name.replace(/ /g, "-");
                 chapterMachineName = chapterMachineName.toLowerCase();
                //In the GoodLife, we only loaded the chapter we wanted to display based on the URL.
                $.getJSON(

                    'data/' + chapterMachineName + '.json',
                    function(chapter) {

                        console.log(chapter);

                        // Insert the chapter information
                        $.each(chapter.chapters, function(index, value) {
                            value.index = parseInt(index) + 1;
                            $('#chapters').append(cards(value));

                        }); //each chapter.chapters                    

                        if (Modernizr.touch) {
                            $("img.lazy").lazyload({
                                threshold: 1000,
                                effect: "fadeIn",
                                failure_limit: 100,
                                load: function() {
                                    if(!!(cardID = $(this).offsetParent().attr('id'))) {
                                    // Add Google Analytics listener
                                    ga('send', {
                                        'hitType': 'event',          // Required.
                                        'eventCategory': 'young farmers',   // Required.
                                        'eventAction': 'Image Load',      // Required.
                                        'eventLabel': displayChapter.name + '-' + cardID,
                                        'eventValue': 1
                                        });    
                                    }
                                }
                            });
                        } else {
                            $('img.lazy').lazyload({
                                effect: 'fadeIn',
                                load: function() {
                                    if(!!(cardID = $(this).offsetParent().attr('id'))) {
                                    // Add Google Analytics listener
                                    ga('send', {
                                        'hitType': 'event',          // Required.
                                        'eventCategory': 'young farmers',   // Required.
                                        'eventAction': 'Image Load',      // Required.
                                        'eventLabel': displayChapter.name + '-' + cardID,
                                        'eventValue': 1
                                    });    
                                }
                                }
                            });
                        } //if Modernizr.touch

                        $.each($('a'), function() {
                            $(this).attr('target', '_blank');
                        });

                        $('#card-3').prepend('<div class="byline">By '+ displayChapter.byline +'</div>')




                        $('#intro').css({
                            'background':'no-repeat center center url("images/' + displayChapter.poster + '")',
                            'background-size':'cover'
                        });

                    

                      

                        $('.ad').prepend('<h6><span>Story continues after </span>Paid Advertisement</h6>');

                    } //success chapter data
                ); //getJSON chapter

            }); //each mainChapters
        } //success chapters
    ); //getJSON mainChapters

    // Checks if element is on screen
    $.fn.isOnScreen = function() {
        var win = $(window);

        var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    }; //fn.isOnScreen

    $(window).scroll(function() {
        $('.rich-media .video-js').each(function(index, value) {
            if ($(this).isOnScreen() === false) {
                videos[$(this).attr('id')].pause();
            }
        });

        // Show and hide the scroll cue if you aren't scrolling.
        $( '.scroll-cue' ).fadeOut();
        $.doTimeout( 'scroll', 1000, function(){
            // Only bring back the scroll cue if we aren't at the bottom 
            // And the video is not playing. 
            if( ( $(window).scrollTop() + $(window).height() ) < $( document ).height() && !$( '.video-js' ).hasClass( 'vjs-playing' )) {
                $( '.scroll-cue' ).fadeIn(600);
            }
        });
        
    }); //window scroll 

    $(window).resize(function() {
        sizeFunctions();
    });

}); //document ready
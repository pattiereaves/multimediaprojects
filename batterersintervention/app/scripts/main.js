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
    // $('#intro').css({
    //     'width': $(window).width(),
    //     'height': $(window).height() - 100
    // });
}

// Must run after templates are registered
function setUpVideos(videos) {

    $('video').each(function(index, value) {
        videos[$(this).get(0).id] = _V_($(this).get(0).id);
    }); //video.each

    //Adds hover listener
    $('video').hover(function() {
        //Only play videos that haven't started yet.
        if (this.currentTime === 0) {
            this.play();
        }
    });

    // Google Analytics event Listeners
    for (var key in videos) {
        // We don't want the listener on the cinemagraph
        if (videos.hasOwnProperty(key) && key !== 'big-video-vid_html5_api') {
            videos[key].on('firstplay', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'charlie', // Required.
                    'eventAction': 'Played Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('play', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'charlie', // Required.
                    'eventAction': 'Played Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('ended', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'charlie', // Required.
                    'eventAction': 'Completed Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('pause', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'charlie', // Required.
                    'eventAction': 'Paused Video', // Required.
                    'eventLabel': $(this).get(0).id(),
                    'eventValue': videos[$(this).get(0).id()].currentTime()
                });
            });
        } //if video has key
    } //for key in videos
} // Set up Videos

$(function() {

    var videos = new Object;

    // // Initialize Handlebars templates
    var cards = Handlebars.compile($('#card-template').html());


    // sizeFunctions();

    $.getJSON(
        'data/chapters.json',
        function(mainChapters) {

            $.each(mainChapters, function(chapterNumber, chapterMeta) {

                var chapterMachineName = chapterMeta.name.replace(/ /g, "-").toLowerCase();

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

                         
                            $("img.lazy").lazyload({
                                    threshold: 1000,
                                    effect: "fadeIn",
                                    failure_limit: 100,
                                    load: function() {
                                        if(!!(cardID = $(this).offsetParent().attr('id'))) {
                                            // Add Google Analytics listener
                                            ga('send', {
                                              'hitType': 'event',          // Required.
                                              'eventCategory': 'batterersintervention',   // Required.
                                              'eventAction': 'Image Load',      // Required.
                                              'eventLabel': displayChapter.name + '-' + cardID,
                                              'eventValue': 1
                                            });    
                                        }
                                    }
                            });
                        
                        sizeFunctions();

                        $('#logo a').on('click', function() {
                            window.location('#card-Credits');
                        });

                        $("a[name=card-Credits]").parent().addClass('credits');

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

        // $('.rich-media.photo').each(function(index,value) { 
        //     console.log($(this).offset().top);

        //     if($(this).offset().top <= $(window).scrollTop() ) { 
        //         console.log('less than 400');

        //         $(this).css({
        //             "position" : "fixed",
        //             "top" : "400px",
        //             "z-index" : index,
        //             "visibility" : "visible"
        //         }); 
        //     } else {
        //         // $(this).css({
        //         //     "visibility" : "hidden"
        //         // });
        //     }
        // });

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
/**
 * Main styling and functionality
 *
 * @author  Pattie Reaves <preaves@bangordailynews.com>
 * @copyright 2016 Bangor Daily News
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

function windowIsHorizontal() {
    if( $(window).width() >= $(window).height() ) {
        return true;
    } else {
        return false;
    }
}

function setUpVideos(videos) {

    // Videos is an empty object that we now fill.
    $('video').each(function(index, value) {
        videos[$(this).get(0).id] = _V_($(this).get(0).id);
    }); //video.each

    //Adds hover listener
    $('.video-media').bind('mouseenter', function() {
        if($(this).find('video')[0].currentTime === 0) {
            $(this).find('video')[0].play();
        }
    });


    // Google Analytics event Listeners
    for (var key in videos) {
        // We don't want the listener on the cinemagraph
        if (videos.hasOwnProperty(key) && key !== 'big-video-vid_html5_api') {
            videos[key].on('firstplay', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'garrett', // Required.
                    'eventAction': 'Played Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('play', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'garrett', // Required.
                    'eventAction': 'Played Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('ended', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'garrett', // Required.
                    'eventAction': 'Completed Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('pause', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'garrett', // Required.
                    'eventAction': 'Paused Video', // Required.
                    'eventLabel': $(this).get(0).id(),
                    'eventValue': videos[$(this).get(0).id()].currentTime()
                });
            });
        } //if video has key
    } //for key in videos
} // Set up Videos

$( function() {

    var videos = new Object;

    // Initialize Handlebars templates
    var cards = Handlebars.compile($('#card-template').html());

    sizeFunctions();

       $.getJSON(
        'data/chapters.json',
        function(mainChapters) {

            // console.log(mainChapters);

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
                                        'eventCategory': 'garrett',   // Required.
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
                                        'eventCategory': 'garrett',   // Required.
                                        'eventAction': 'Image Load',      // Required.
                                        'eventLabel': displayChapter.name + '-' + cardID,
                                        'eventValue': 1
                                    });    
                                }
                                }
                            });
                        } //if Modernizr.touch

                        setUpVideos(videos);


                        $.each($('a'), function() {
                            $(this).attr('target', '_blank');
                        });

                        $('#card--2').prepend('<div class="byline">By '+ displayChapter.byline +'</div>')



                        shareButtons = '<div class="addthis_toolbox addthis_default_style addthis_32x32_style"><a class="addthis_button_email"></a><a class="addthis_button_facebook"></a><a class="addthis_button_twitter"></a></div>';
                        $('.byline').append(shareButtons);
                        $('div.cards:last-of-type p.text:first-of-type').prepend('<div class="byline">' + shareButtons + '</div>');
                        addthis.init();

                        var poster = windowIsHorizontal() ? displayChapter.poster_landscape : displayChapter.poster_portrait;

                        $('#intro').css({
                            'background':'no-repeat center center url("'+poster+'")',
                            'background-size':'cover'
                        });

                        // Add the ad tags
                        $('<div class="rich-media size-medium ad orientation-right"><div id="bdnads-top-300x600"></div></div>').insertAfter($('#card--3 p.text:nth-last-of-type(6)').first());
                        googletag.cmd.push(function() {
                            googletag.display("bdnads-top-300x600");
                        });

                        for( i = 1; i < 5; i++ ) {
                            $('<div class="rich-media size-medium ad orientation-left"><div id="bdnads-bottom-300x250-'+i+'"></div></div>').insertAfter($('#card--'+ eval(3 + i) +' p.text:nth-last-of-type(4)').first());
                            googletag.cmd.push(function() {
                              googletag.display('bdnads-bottom-300x250-'+ i);
                            });
                        }

                        $('.ad').prepend('<h6><span>Story continues after </span>Paid Advertisement</h6>');

                         $( '.hide-after-chapters').addClass('hidden');
                         // show the credits box.
                        $( '.show-after-chapters.hidden').removeClass('hidden');


                        var maineFocusLogo = '<div class="maine-focus-logo" data-spy="affix" data-offset-top="60">' +
                                '<a href="http://mainefocus.bangordailynews.com">' +
                                    '<img src="images/mainefocus.png" alt="A BDN Maine Project" height="50">' +
                                '</a>' +
                            '</div>';

                        $( '.byline' ).prepend( maineFocusLogo );

                           

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
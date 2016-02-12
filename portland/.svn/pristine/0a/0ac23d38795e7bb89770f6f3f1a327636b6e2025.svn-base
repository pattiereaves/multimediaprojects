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
                    'eventCategory': 'portland-project', // Required.
                    'eventAction': 'Played Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('ended', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'portland-project', // Required.
                    'eventAction': 'Completed Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('pause', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': 'portland-project', // Required.
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

    // Initialize Handlebars templates
    var cards = Handlebars.compile($('#card-template').html());

    // Big Video intro
    var BV = new $.BigVideo({
        container: $('#intro')
    });
    BV.init();
    if (Modernizr.touch) {
        BV.show('images/priced-out-static-image.png');
    } else {
        BV.show(
            'http://watchvideo.bangordailynews.com/bdn/2014/06/port_proj_cine_1719549.m4v', {
                ambient: true
            }
        );
    }

    sizeFunctions();

    $.getJSON(
        'data/chapters.json',
        function(mainChapters) {
            // console.log(mainChapters);

            $.each(mainChapters, function(chapterNumber, chapterMeta) {

                //In the GoodLife, we only loaded the chapter we wanted to display based on the URL.
                $.getJSON(

                    'data/' + chapterMeta.name + '.json',
                    function(chapter) {

                        // Insert the chapter information
                        $.each(chapter.chapters, function(index, value) {
                            console.log(value);
                            value.index = index;
                            $('#chapters').append(cards(value));

                        }); //each chapter.chapters

                        //Activates image lazyload
                        $('img.lazy').lazyload({
                            effect: 'fadeIn'
                        });

                        setUpVideos(videos);
                        sizeFunctions();

                    } //success chapter data
                ); //getJSON chapter
            }); //each mainChapters
        } //success chapters
    ); //getJSON mainChapters

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
    };

    $(window).scroll(function() {

        $('.rich-media .video-js').each(function(index, value) {
            if ($(this).isOnScreen() === false) {
                videos[$(this).attr('id')].pause();
            }
        });

    });

});

$(window).resize(function() {
    sizeFunctions();
});
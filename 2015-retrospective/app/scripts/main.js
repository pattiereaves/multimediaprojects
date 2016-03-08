/**
 * Main styling and functionality
 *
 * @author  Pattie Reaves <preaves@bangordailynews.com>
 * @copyright 2014 Bangor Daily News
 */


$(function() {

    // Initialize Handlebars templates
    var cards = Handlebars.compile($('#card-template').html());
    var intro = Handlebars.compile($('#intro-template').html());

    $.getJSON(
        'data/chapters.json',
        function(mainChapters) {

            console.log(mainChapters); //debug

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

                if(chapterNumber === displayChapter.count) {

                    $('#intro').append(intro(displayChapter));
                    // console.log(displayChapter);
                    document.title = displayChapter.subtitle;
                    $('.navbar .navbar-brand a').append(displayChapter.name);

                    $.getJSON(

                        'data/' + chapterMeta.name + '.json',
                        function(chapter) {

                            var carouselImages = []; //empty array


                                // Insert the chapter information
                                $.each(chapter.chapters, function(index, value) {
                                    value.index = parseInt(index) + 1;
                                    $('#chapters').append(cards(value));

                                    // Save images to an array
                                    $.each(value.content, function(i, v) {
                                        if(v.filetype === 'photo') {
                                            carouselImages.push(v);
                                         }
                                    });

                                }); //each chapter.chapters     

                                // Add images to top carousel
                                $.each(carouselImages, function(index, value) {
                                    $('.carousel-inner').append('<div class="item"><img src="images/'+value.filename+'"" alt="'+value.caption+'"/></div>');
                                });
                                $('.carousel-inner > .item:first-child').addClass('active');
        
                            
                            

                             if (Modernizr.touch) {
                                $('img.lazy').lazyload({
                                    threshold: 1000,
                                    effect: 'fadeIn',
                                    failure_limit: 100,
                                });
                             } else {
                                $('img.lazy').lazyload({
                                    effect: 'fadeIn',
                                    load: function() {
                                        if(!!(cardID = $(this).offsetParent().attr('id'))) {
                                            // Add Google Analytics listener
                                            ga('send', {
                                              'hitType': 'event',          // Required.
                                              'eventCategory': '2014',   // Required.
                                              'eventAction': 'Image Load',      // Required.
                                              'eventLabel': displayChapter.name + '-' + cardID,
                                              'eventValue': 1
                                            });    
                                        }
                                        
                                    }
                                });
                             }


                            $('#logo a').on('click', function() {
                                window.location('http://bangordailynews.com');
                            });

                        } //success chapter data
                    ); //getJSON chapter

                }//if its the display chapter

            }); //each mainChapters
        } //success chapters
    ); //getJSON mainChapters
}); //document ready
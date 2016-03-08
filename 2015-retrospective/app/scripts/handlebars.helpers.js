/**
 * Registers the helper templates for Handlebars.
 *
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */

Handlebars.registerHelper('multimedia', function(options) {
    'use strict';

    //Display a format based on the type.
    //I think this is easier than putting that conditional shit
    //in a template.

    //filetype, filename, size, orientation, caption, credit

    if (this.filename) {

        if (this.filetype === 'video') {
            //The filename is the URL for videos.
            var filenameArray = this.filename.split('/');
            var fileExtension = filenameArray[filenameArray.length - 1];
            var fileExtensionArray = fileExtension.split('.');
            this.fileID = fileExtensionArray[0];
        } else {
            var filenameArray = this.filename.split('.'); //get to get rid of the extension
            this.fileID = filenameArray[0].replace(/ |:|\//g, '-');
        }

    } else {
        this.fileID = '';
    } //if this.filename

    if (this.caption || this.credit && this.filetype !== 'text') {
        this.caption = this.caption ? this.caption : ''; //don't print null, please!
        this.captionFormatted = '<p class="caption">' + this.caption + ' <span class="credit">' + this.credit + '</span></p>';
    } else {
        this.captionFormatted = '';
    } //if this.caption 

    switch (this.filetype) {
        case 'text':
            return '<p class="text">' + this.caption + '</p>';

        case 'list': 
            return this.caption;

        case 'video':
            return '<div class="rich-media video-media size-'+ this.size +' orientation-'+ this.orientation +'">' +
                        '<div class="embed-responsive embed-responsive-16by9">' +
                          '<video id="video-'+ this.fileID +'" controls autoWidth="true" autoHeight="true" class="embed-responsive-item video video-js vjs-default-skin" poster="images/'+this.poster+'">' +
                              '<source type="video/mp4" src="'+ this.filename +'" />' +
                          '</video>' +
                      '</div>' + 
                      this.captionFormatted +
                '</div>';

      case 'youtube' : 
        if( Modernizr.touch ) {
            // See https://github.com/eXon/videojs-youtube/issues/320
            // @todo the captions are hidden under the video.
            return '<div class="embed-responsive embed-responsive-16by9 rich-media video-media size-'+ this.size +' orientation-'+ this.orientation +'">' +
                      '<video id="video-'+ this.fileID +'" autoWidth="true" autoHeight="true" class="embed-responsive-item video video-js vjs-default-skin"' +
                          'data-setup=\'{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "'+this.filename+'"}], "Youtube": { "ytControls": 2 }}\'>' +
                      '</video>' +
                    '</div>';
        } else {
            return '<div class="embed-responsive embed-responsive-16by9 rich-media video-media size-'+ this.size +' orientation-'+ this.orientation +'">' +
                      '<video id="video-'+ this.fileID +'" controls autoWidth="true" autoHeight="true" class="embed-responsive-item video video-js vjs-default-skin" poster="images/'+this.poster+'"' +
                          'data-setup=\'{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "'+this.filename+'"}]}\'>' +
                      '</video>' +
                    '</div>';
        }

        case 'photo':
            return '<div id="photo-' + this.fileID + '" class="rich-media photo size-' + this.size + ' orientation-' + this.orientation + '">' +
                    '<a href="images/' + this.filename + '">' +
                        '<img class="lazy" data-original="images/' + this.filename + '" alt="' + this.caption + '" />' +
                    '</a>' +
                    this.captionFormatted +
                '</div>';

        case 'graphic':
            return '<div id="graphic-' + this.fileID + '" class="rich-media photo graphic size-' + this.size + ' orientation-' + this.orientation + '">' +
                  '<a href="images/' + this.filename + '">' +
                    '<img class="lazy" data-original="images/' + this.filename + '" alt="' + this.caption + '" />' +
                  '</a>' +
                  '<p class="caption">'+ this.caption + '</p>' +
              '</div>';

        case 'pullquote':
            return '<div class="rich-media pullquote size-' + this.size + ' orientation-' + this.orientation + '">' +
                    '<p class="caption">'+ this.caption + '</p>' +
              '</div>';

        default:
            return;
    }
});
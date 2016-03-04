/**
 * Registers the helper templates for Handlebars.
 *
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */

/*jshint -W004 */
/*global Handlebars:false */
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
            this.fileID = filenameArray[0].replace(' ', '-');
        }

    } else {
        this.fileID = '';
    } //if this.filename

    if (this.caption && this.filetype !== 'text') {
        this.captionFormatted = '<p class="caption">' + this.caption + ' <span class="credit">' + this.credit + '</span></p>';
    } else {
        this.captionFormatted = '';
    } //if this.caption 

    switch (this.filetype) {
        case 'text':
            return '<p class="text">' + this.caption + '</p>';

        case 'video':
            return '<div class="rich-media video-media size-'+ this.size +' orientation-'+ this.orientation +'">' +
                '<video id="video-'+ this.fileID +'" controls preload width="auto" height="auto" data-setup="{}" class="video video-js vjs-default-skin" poster="images/'+this.poster+'">' +
                    '<source type="video/mp4" src="'+ this.filename +'" />' +
                '</video>' +
                '<p class="caption credit">'+this.credit+'</p>' +
              '</div>';

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
'use strict';

var google = require('googleapis');
var youtube = google.youtube('v3');
var config = require('config');

module.exports.get = function(query, done) {

  if (!query) return;

  youtube.search.list({ auth: config.get('GAPI.key'), 
    part: 'snippet', 
    type: 'video', 
    q: query, 
    maxResults: 25,
    fields: 'items(id,snippet)',
    videoDuration: 'short' }, function(err, response) {

    if (err) {
      console.log(err.message);
    }
    else {
      var items = response['items'];
      var result = []

      console.log('Found: ', items.length);
      for (var i=0; i<items.length; i++) {
        result[i] = {}
        result[i].videoId = items[i].id.videoId;
        result[i].title = items[i].snippet.title;
      }

      done && done(result);
    }
  });
}
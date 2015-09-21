'use strict'

var google = require('googleapis')
var youtube = google.youtube('v3')
var config = require('config')

module.exports.get = function(query, done) {
  if (!query) {
    return
  }

  youtube.search.list({ auth: config.get('GAPI.key'),
    part: 'snippet',
    type: 'video',
    q: query,
    maxResults: 25,
    fields: 'items(id,snippet)',
    videoDuration: 'short' }, function(err, response) {

    if (err) {
      console.log(err.message)
    }
    else {
      var items = response['items']

      console.log('Search items: ', items.length)

      var results = items.flatMap(function(item) {
        var value = {}
        value.videoId = item.id.videoId
        value.title = item.snippet.title
        return [value]
      })

      done && done(results)
    }
  })
}

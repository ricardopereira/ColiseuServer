'use strict';

var app = require("./app.js");
var fs = require("fs");

// Loader service
var ctrl = require('./controller');

// Teste
var google = require('googleapis');
var youtube = google.youtube('v3');
var config = require('config');

app.route('/')
  .get(function (req, res) {
    res.send('Coliseu')
});

app.route('/api/submit')
  .get(function (req, res, next) {

    var url = (req.query && req.query.url) || //http://localhost:9000/api/submit?url=12
      (req.headers['url']); //Headers values

    var token = (req.query && req.query.token) || //http://localhost:9000/api/submit?url=12
      (req.headers['token']); //Headers values

    //http://localhost:9000/api/submit?url=http://youtu.be/ufgjGSjM97g&token=7bc0cb495834a47947e436b837ba7443bd8d198f2257f32c7371a400435c5206
    console.log('- REQUEST: Submit -');
    console.log('url: ' + url);
    console.log('token: ' + token);

    if (url && token) {
      // Validate url + Start downloading: http://localhost:9000/api/submit?url=http://youtu.be/ufgjGSjM97g
      if (url && /^[a-z]+:\/\//i.test(url)) {
        ctrl.submit(url,token);
        res.send('Success');
      }
      else
        res.end('Not found', 404);
    }
    else
      res.end('Undefined', 400);
});

app.route('/api/load')
  .get(function (req, res, next) {

    var file = (req.query && req.query.file) ||
      (req.headers['file']);

    var token = (req.query && req.query.token) ||
      (req.headers['token']);

    //http://localhost:9000/api/load?file=Cool-Kids-Echosmith-(lyrics).mp3&token=7bc0cb495834a47947e436b837ba7443bd8d198f2257f32c7371a400435c5206
    console.log('- REQUEST: Load -');
    console.log('file: ' + file);
    console.log('token: ' + token);

    if (file && token) {
      res.download(__dirname + '/' + file, file, function(err) {
        if (err) { return res.end('No file', 400) }
        ctrl.done(file, token);
      });
    }
    else
      res.end('Undefined', 400);
})

app.route('/api/loadStream')
  .get(function (req, res, next) {

    //http://localhost:9000/api/loadStream?file=Cool-Kids-Echosmith-(lyrics).mp3
    var file = (req.query && req.query.file) ||
      (req.headers['file']);

    console.log('try streaming: '+file);

    if (file) {
      res.type('mp3');
      try {
        var reader = fs.createReadStream(__dirname + '/' + file);
        reader.pipe(res);
        reader.on('error', function() {
          res.end('No file', 400);
        })
      } catch (err) {
        res.end('Internal server error', 400);
      }
    }
    else
      res.end('Undefined', 400);
})

app.route('/api/ready')
  .get(function (req, res, next) {

    //http://localhost:9000/api/ready?token=7bc0cb495834a47947e436b837ba7443bd8d198f2257f32c7371a400435c5206
    var token = (req.query && req.query.token) ||
      (req.headers['token']);

    if (token) {
      ctrl.sendReadyList(res, token)
    }
    else
      res.end('Undefined', 400);
  });

app.route('/api/search')
  .get(function (req, res, next) {
    console.log('- REQUEST: Search -');
    // Teste
    youtube.search.list({ auth: config.get('GAPI.key'), part: 'snippet', type: 'video', q: 'Cool Kids', maxResults: 25 }, function(err, list) {
      console.log('Result: ' + (err ? err.message : list));
    });
    res.end('Search: success', 400);
  });

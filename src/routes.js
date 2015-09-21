'use strict'

var app = application()
var fs = require('fs')

// Local
var ctrl = local('controller')
var search = local('search')

// Media
var dir = app.get('COLISEU_MEDIA')

app.route('/')
  .get(function (req, res) {
    res.send('Coliseu')
});

// SUBMIT
app.route('/api/convert')
  //http://localhost:9000/api/convert
  .get(function (req, res, next) {
    // HTTP Headers
    var url = req.headers['X-Coliseu-URL'] //Ex: http://youtu.be/J3UjJ4wKLkg&token=
    var device = req.headers['X-Coliseu-Device'] //Ex: 7bc0cb495834a47947e436b837ba7443bd8d198f2257f32c7371a400435c5206

    console.log('REQ: Convert video '+url+' for device '+device)

    if (url && device) {
      // Validate url + Start downloading
      if (url && /^[a-z]+:\/\//i.test(url)) {
        ctrl.submit(url, device)
        res.status(200).send('Success')
      }
      else {
        res.status(404).send('Not Found')
      }
    }
    else {
      res.status(400).send('Bad Request')
    }
})

// LOAD
app.route('/api/load')
  //http://localhost:9000/api/load
  .get(function (req, res, next) {
    // HTTP Headers
    var file = req.headers['X-Coliseu-File'] //Ex: Cool-Kids-Echosmith-(lyrics).mp3
    var token = req.headers['X-Colisey-Device'] //Ex: 7bc0cb495834a47947e436b837ba7443bd8d198f2257f32c7371a400435c5206

    console.log('REQ: Load file '+file+' for device '+token)

    if (file && token) {
      res.download(dir + file, file, function(err) {
        if (err) {
          return res.status(404).send('Not Found')
        }
        ctrl.done(file, token)
      });
    }
    else {
      res.status(400).send('Bad Request')
    }
})

// LOADSTREAM
app.route('/api/stream')
  //http://localhost:9000/api/stream
  .get(function (req, res, next) {
    // HTTP Headers
    var file = req.headers['x-coliseu-file'] //Ex: Cool-Kids-Echosmith-(lyrics).mp3

    console.log(req.headers)
    console.log('REQ: Stream file '+file)

    if (file) {
      res.type('mp3')
      try {
        var reader = fs.createReadStream(dir + file)
        reader.pipe(res)
        reader.on('error', function() {
          res.status(404).send('Not Found')
        })
      } catch (err) {
        res.status(501).send('Internal server error: ' + err)
      }
    }
    else {
      res.status(400).send('Bad Request')
    }
})

// IGNORE
app.route('/api/ignore')
  //http://localhost:9000/api/ignore
  .get(function (req, res, next) {
    // HTTP Headers
    var file = req.headers['X-Coliseu-File'] //Ex: Cool-Kids-Echosmith-(lyrics).mp3
    var device = req.headers['X-Coliseu-Device'] //Ex: 7bc0cb495834a47947e436b837ba7443bd8d198f2257f32c7371a400435c5206

    console.log('REQ: Ignore file '+file+' for device '+device)

    ctrl.done(file, device)
    res.status(200).send('Success')
  });

// NOTIFICATIONS
app.route('/api/notifications')
  //http://localhost:9000/api/notifications
  .get(function (req, res, next) {
    // HTTP Headers
    var device = req.headers['X-Coliseu-Device'] //Ex: 7bc0cb495834a47947e436b837ba7443bd8d198f2257f32c7371a400435c5206

    console.log('REQ: Notifications for device '+device)

    if (device) {
      ctrl.sendReadyList(res, device)
    }
    else {
      res.status(400).send('Bad Request')
    }
  })

// SEARCH
app.route('/api/search')
  //http://localhost:9000/api/search
  .get(function (req, res, next) {
    // HTTP Headers
    var q = req.headers['X-Coliseu-Query'] //Ex: lana+del+rey+ride

    console.log('REQ: Search with query - '+q)

    search.get(q, function (items) {
      res.json(items)
    })
  })

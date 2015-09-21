'use strict'

var apn = require('apn')
var config = require('config')

module.exports.sendNotification = function (token, title, filename) {
  console.log(new Date + ': Notify device ' + token)

  var options = {
    cert: config.get('APNS.certificate'),
    key: config.get('APNS.key'),
    passphrase: config.get('APNS.passphrase'),
    production: false
  }

  var connection = new apn.Connection(options)

  var dev = new apn.Device(token)

  var note = new apn.Notification()

  note.expiry = Math.floor(Date.now() / 1000) + 3600 //Expires 1 hour from now.
  note.badge = 1
  note.sound = 'ping.aiff'
  note.alert = '\uD83C\uDFB5 '+title+' is ready for download'
  note.payload = { 'title': title, 'filename': filename }

  connection.pushNotification(note, dev)

  connection.shutdown()
}

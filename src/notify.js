'use strict'

var apn = require('apn')
var config = require('config')

module.exports.sendNotification = function(submitInfo) {
  debug('Notify device ' + submitInfo.device_id)

  var options = {
    cert: config.get('APNS.certificate'),
    key: config.get('APNS.key'),
    passphrase: config.get('APNS.passphrase'),
    production: false
  }

  var connection = new apn.Connection(options)

  var dev = new apn.Device(submitInfo.device_id)

  var note = new apn.Notification()

  note.expiry = Math.floor(Date.now() / 1000) + 3600 //Expires 1 hour from now.
  note.badge = 1
  note.sound = 'ping.aiff'
  note.alert = '\uD83C\uDFB5 '+submitInfo.title+' is ready for download'
  note.payload = { 'title': submitInfo.title, 'filename': submitInfo.filename }

  // TODO: Generate new certificate
  //connection.pushNotification(note, dev)
  //connection.shutdown()
}

'run strict'

var moment = require('moment')

global.debug = function(message) {
  if (process.env.COLISEU_DEBUG == 1) {
    console.log(moment().format('lll')+': '+ message)
  }
}

global.unexpected = function(message) {
  debug('ERR '+message)
}

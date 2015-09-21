'use strict'

global.__src = __dirname + '/src/'

global.local = function(name) {
    return require(__src + name);
}

// Local
var utils = local('utils')

module.exports = function(app) {
  // Export Application
  global.application = function() {
      return app;
  }

  // Variables
  // TODO: Check slash delimiter
  app.set('VERSION', 2.0)
  app.set('PORT', process.env.PORT || 9000)

  app.set('COLISEU_STORES', process.env.COLISEU_STORES || __dirname + '/bin/stores/')
  app.set('COLISEU_MEDIA', process.env.COLISEU_MEDIA || __dirname + '/bin/media/')

  if (!utils.slashed(app.get('COLISEU_STORES'))) {
    app.set('COLISEU_STORES', app.get('COLISEU_STORES') + '/')
  }

  if (!utils.slashed(app.get('COLISEU_MEDIA'))) {
    app.set('COLISEU_MEDIA', app.get('COLISEU_MEDIA') + '/')
  }
}

// Extensions

// [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
Array.prototype.flatMap = function(lambda) {
  return Array.prototype.concat.apply([], this.map(lambda))
}

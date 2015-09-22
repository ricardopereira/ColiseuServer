'use strict'

module.exports.slashed = function(path) {
  return path !== path.replace(/[^/]+\/$/,'')
}

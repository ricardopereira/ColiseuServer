'use strict'

var app  = module.exports = require('express')()
var config = require('config')
// Setup
require('./setup')(app)

// API
local('routes')

// Logger
app.use(function (req, res, next) {
  var start = new Date()
  next()
  var ms = new Date() - start
  console.log('%s %s - %s', req.method, req.url, ms)
})

// Info
console.log('Coliseu '+app.get('VERSION'))
console.log(' * Media path: '+app.get('COLISEU_MEDIA'))

app.listen(app.get('PORT'))

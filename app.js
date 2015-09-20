'use strict'

var app  = module.exports = require('express')()
var config = require('config')

var port = process.env.PORT || 9000

// API
require('./routes')

// Logger
app.use(function (req, res, next) {
  var start = new Date()
  next()
  var ms = new Date() - start
  console.log('%s %s - %s', req.method, req.url, ms)
})

app.listen(port)

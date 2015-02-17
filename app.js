'use strict';

var app  = module.exports = require('express')();
var mongoose = require('mongoose');
var config = require('config');

var port = process.env.PORT || 9000;

// API
var routes = require('./routes');

// Database
mongoose.connect(config.get('DB.uri')+config.get('DB.name'));

// Logger
app.use(function (req, res, next) {
  var start = new Date;
  next;
  var ms = new Date - start;
  console.log('%s %s - %s', req.method, req.url, ms);
});

app.listen(port);

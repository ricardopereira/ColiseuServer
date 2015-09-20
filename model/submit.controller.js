'use strict'

var Submits = require('./submit.model')

exports.add = function(obj) {
  Submits.create(obj, function(err, submit) {
    if (err) {
      return console.log(err)
    }
  });
};

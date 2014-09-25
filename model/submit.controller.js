'use strict';

var Submits = require('./submit.model');

exports.add = function(obj) {
  Submits.create(obj, function(err, submit) {
    // Callback
    if (err) {
      console.log(err)
      return 
    }
    console.log(submit);
  });
};

exports.update = function(obj) {
  Thing.findById(obj.id, function (err, obj) {
    // Callback
    if (err) { 
      console.log(err);
      return
    }
    if (!obj) {
      console.log(err);
      return
    }
    obj.save();
  });
};
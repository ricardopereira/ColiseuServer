'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SubmitSchema = new Schema({
  video_id: { type: String, required: true },
  device: { type: String, required: true },
  url: String,
  title: String,
  image: String,
  converted: Boolean,
  downloaded: Boolean,
  done: Number
});

module.exports = mongoose.model('Submit', SubmitSchema);
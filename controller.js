'use strict';

var fs = require('fs');
var ytdl = require('ytdl-core');
var spawn = require('child_process').spawn;
var slugify = require('slugify');

// Data
var Submits = require('./model/submit.model');

var notify = require('./notify');

module.exports.submit = function (url, device) {

  if (!url) return;

  // Inline
  function convert(videoId, title) {
    console.log(new Date + ': Start extracting audio from video');
    //FLV -acodec copy destination
    //MP4 = ffmpeg -y -i source -f mp3 -vn -sn destination
    var fileName = slugify(title)+'.mp3';

    var ffmpeg = spawn('ffmpeg', ['-y', '-i', videoId, '-f', 'mp3', '-vn', '-sn', fileName]);

    ffmpeg.stdout.on('data', function (buf) {

    });

    ffmpeg.stderr.on('data', function (buf) {

    });

    ffmpeg.on('exit', function (code) {
      // Finish conversion
      console.log(new Date + ': Extracted audio: #' + code);
      // Converted!
      if (code == 0)
        Submits.findOneAndUpdate({ video_id: videoId, device: device }, 
          { converted: true, filename: fileName }, function (err, submit) {
            if (err) return console.error(err.message);
            if (submit)
              removeVideo(__dirname + '/' + videoId);
          });
      // Callback device
      notify.sendNotification(device, title, fileName);
    });
  };

  // Inline
  function downloadAndConvert(videoId, audioTitle) {
    console.log(new Date + ': Start downloading video');

    var options = {}
    options.filter = function (format) { return format.container === 'mp4'; }

    // Download and Conversion
    var writeStream = fs.createWriteStream(videoId);

    var readStream = ytdl('http://youtu.be/'+videoId, options);
    readStream.pipe(writeStream);

    readStream.on('error', function(err) {
      console.error(err.message);
    });

    writeStream.on('error', function(err) {
      console.error(err.message);
    });
      
    writeStream.on('finish', function() {
      // Downloaded!
      Submits.findOneAndUpdate({ video_id: videoId, device: device }, 
        { downloaded: true }, function (err, submit) {
          if (err) return console.error(err.message);
        });
      // Convert do audio
      convert(videoId, audioTitle);
    });
  }

  // Inline
  function checkVideo(videoId, videoTitle) {
    fs.exists(__dirname + '/' + videoId, function (exists) {
      // Check if Audio file is created or correct
      if (exists) {
        convert(videoId, videoTitle);
      }
      else {
        downloadAndConvert(videoId, videoTitle);
      }
    });
  }

  // Inline
  function removeVideo(filePath) {
    fs.unlink(filePath, function (err) {
      if (err) return console.error(err.message);
      console.log('Successfully deleted: ' + filePath);
    });
  }

  console.log(new Date +': Start downloading '+ url);

  ytdl.getInfo(url, function (err, info) {
    if (err) return console.error(err.message);

    var timestamp = new Date;

    console.log(timestamp +': '+ info.title);
    console.log(timestamp +': '+ info.video_id);

    Submits.where({ video_id: info.video_id, device: device }).findOne(function (err, submit) {
      if (err) return console.error(err.message);
      if (submit) {
        console.log('Exist: ' + info.video_id);
        // Exist, then check if video has been downloaded
        checkVideo(info.video_id, info.title);
      }
      else {
        // Add to Database
        Submits.create({ video_id: info.video_id,
          device: device,
          title: info.title,
          image: info.thumbnail_url,
          url: url,
          converted: false
        }, function(err, submit) {
          if (err) return console.error(err.message);
          if (submit) {
            console.log('Saved: ' + info.video_id);
            // Exist, then check if video has been downloaded
            checkVideo(info.video_id, info.title);
          }
        });
      }
    });

  });
}

module.exports.done = function (fileName, device) {

  // Inline
  function removeAudio(filePath) {
    fs.unlink(filePath, function (err) {
      if (err) return console.error(err.message);
      console.log('Successfully deleted: ' + filePath);
    });
  }

  Submits.findOneAndRemove({ device: device, filename: fileName }, 
    function (err) {
      if (err) return console.error(err.message);
      // Check if is safe to remove cached file
      Submits.find({ filename: fileName })
        .count(function (err, count) {
          if (err) return console.error(err.message);
          if (count == 0) {
            removeAudio(__dirname + '/' + fileName)
          }
        })
    });
}

module.exports.sendReadyList = function (res, device) {
  if (!res) return res.send(500);

  Submits.find({ device: device, converted: true })
    .select('title filename video_id image')
    .exec(function (err, submits) {
    if (err) return console.error(err.message);
    if (submits) {
      res.json(submits);
    }
    else
      res.json([]);
    });
}
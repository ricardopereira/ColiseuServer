'use strict'

var app = application()
var fs = require('fs')
var ytdl = require('ytdl-core')
var spawn = require('child_process').spawn
var slugify = require('slugify')
// Local
var notify = local('notify')
// Store
var Datastore = require('nedb')
var db = {}
db.submissions = new Datastore(app.get('COLISEU_STORES') + 'submissions')
db.submissions.loadDatabase()
// Media
var dir = app.get('COLISEU_MEDIA')


// Private

function removeVideo(filePath) {
  fs.unlink(filePath, function(err) {
    if (err) {
      return unexpected(err.message)
    }
    debug('Successfully deleted ' + filePath)
  })
}

function removeAudio(filePath) {
  fs.unlink(filePath, function(err) {
    if (err) {
      return unexpected(err.message)
    }
    debug('Successfully deleted ' + filePath)
  });
}

function extractAudio(submitInfo, completion) {
  var input = dir + submitInfo.video_id
  var output = dir + submitInfo.filename

  debug('Input: '+input)
  debug('Output: '+output)
  debug('Start extracting audio \"'+submitInfo.filename+'\" from video \"'+submitInfo.video_id+'\"')

  //FLV -acodec copy destination
  //MP4 = ffmpeg -y -i source -f mp3 -metadata title="title" -vn -sn destination
  var ffmpeg = spawn('ffmpeg', ['-y', '-i', input, '-f', 'mp3', '-metadata', 'title='+submitInfo.title, '-vn', '-sn', output])

  // TODO: Log
  ffmpeg.stdout.on('data', function(buf) { })
  ffmpeg.stderr.on('data', function(buf) { })

  ffmpeg.on('exit', function(code) {
    // Converted!
    if (code === 0) {
      debug('Extracted audio successfully')
      // Finish extraction!
      completion(submitInfo)
    }
    else {
      debug('ffmpeg error: '+code)
    }
  })
}

function downloadVideo(submitInfo, completion) {
  debug('Start downloading video '+submitInfo.video_id)

  var options = {}
  options.filter = function(format) {
      return format.container === 'mp4'
    }

  // Download
  var writeStream = fs.createWriteStream(dir + submitInfo.video_id)
  var readStream = ytdl('http://youtu.be/'+submitInfo.video_id, options)
  readStream.pipe(writeStream)

  readStream.on('error', function(err) {
    unexpected(err.message)
  })
  writeStream.on('error', function(err) {
    unexpected(err.message)
  })
  writeStream.on('finish', function() {
    // Downloaded!
    completion(submitInfo)
  })
}

function onExtractAudioComplete(submitInfo) {
  // On completion
  db.submissions.update({ video_id: submitInfo.video_id, device_id: submitInfo.device_id },
    { $set: { converted: true } }, {},
  function (err, numReplaced) {
    if (err) {
      return unexpected(err)
    }
    // Success
    if (numReplaced === 1) {
      removeVideo(dir + submitInfo.video_id)
    }
  });
  // Callback device
  notify.sendNotification(submitInfo)
}

function checkVideo(submitInfo) {
  fs.exists(dir + submitInfo.filename, function(exists) {
    if (!exists) {
      // TODO: if file exists but there's no submission
    }
  })

  // TODO: doesn't mean that the file isn't corrupt
  fs.exists(dir + submitInfo.video_id, function(exists) {
    // Check if Audio file is created or correct
    if (exists) {
      debug('Extract method')
      extractAudio(submitInfo, onExtractAudioComplete)
    }
    else {
      debug('Download method')
      downloadVideo(submitInfo, function(submitInfo) {
        // On completion
        db.submissions.update({ video_id: submitInfo.video_id, device: submitInfo.device_id },
          { $set: { downloaded: true } }, {},
        function (err, numReplaced) {
          if (err) {
            return unexpected(err)
          }
        });
        // Convert to audio
        extractAudio(submitInfo, onExtractAudioComplete)
      })
    }
  })
}


// Public

module.exports.submit = function(url, device) {
  if (!url) {
    return
  }

  ytdl.getInfo(url, function (err, info) {
    if (err) {
      return unexpected(err.message)
    }

    var submitInfo = {
      title: info.title,
      video_id: info.video_id,
      video_url: url,
      filename: slugify(info.title)+'.mp3',
      device_id: device,
      thumbnail: info.thumbnail_url,
      submitted: new Date(),
      converted: false,
      downloaded: false
    }

    // Find with the same video id
    db.submissions.find({ video_id: submitInfo.video_id, device_id: submitInfo.device_id }, function (err, docs) {
      if (err) {
        return unexpected(err)
      }

      // New
      if (docs.length === 0) {
        db.submissions.insert(submitInfo, function(err, doc) {
          debug('Submission create with id '+doc._id)
          // Check if video has been downloaded
          checkVideo(doc)
        })
      }
      else {
        debug('Submission already exist with id '+docs[0]._id)
        // Exist, then check if video has been downloaded
        checkVideo(docs[0])
      }
    })
  });
};

module.exports.done = function (fileName, device) {

  /*
  Submits.findOneAndRemove({ device: device, filename: fileName },
    function (err) {
      if (err) {
        return console.error(err.message)
      }
      // Check if is safe to remove cached file
      Submits.find({ filename: fileName })
        .count(function (err, count) {
          if (err) {
            return console.error(err.message)
          }
          if (count === 0) {
            removeAudio(__dirname + '/' + fileName)
          }
        })
    })
  */

};

module.exports.sendReadyList = function (res, device) {
  if (!res) {
    // TODO
    return res.send(500)
  }

  /*
  Submits.find({ device: device, converted: true })
    .select('title filename video_id image')
    .exec(function (err, submits) {
      if (err) {
        return console.error(err.message)
      }
      if (submits) {
        res.json(submits)
      }
      else {
        res.json([])
      }
  })
  */
}

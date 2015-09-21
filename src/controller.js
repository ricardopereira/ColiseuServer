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
  fs.unlink(filePath, function (err) {
    if (err) {
      return console.error(err.message)
    }
    console.log('Successfully deleted: ' + filePath)
  })
}

function convert(submitInfo) {
  console.log(new Date() + ': Start extracting audio from video')
  //FLV -acodec copy destination
  //MP4 = ffmpeg -y -i source -f mp3 -metadata title="title" -vn -sn destination
  var ffmpeg = spawn('ffmpeg', ['-y', '-i', submitInfo.video_id, '-f', 'mp3', '-metadata', 'title='+submitInfo.title, '-vn', '-sn', submitInfo.filename])

  ffmpeg.stdout.on('data', function(buf) {

  });

  ffmpeg.stderr.on('data', function(buf) {

  });

  ffmpeg.on('exit', function(code) {
    // Finish conversion
    console.log(new Date() + ': Extracted audio: #' + code)
    // Converted!
    if (code === 0) {
      db.submissions.update({ video_id: submitInfo.video_id, device: submitInfo.device_id },
        { $set: { converted: true } }, {},
      function (err, numReplaced) {
        if (err) {
          return console.log(err)
        }
        // Success
        if (numReplaced === 1) {
          removeVideo(dir + submitInfo.video_id)
        }
      });

      /*
      Submits.findOneAndUpdate({ video_id: videoId, device: device },
        { converted: true, filename: fileName }, function (err, submit) {
          if (err) {
            return console.error(err.message)
          }
          if (submit) {

          }
        })
      */
    }
    // Callback device
    notify.sendNotification(submitInfo)
  });
}

function downloadAndConvert(submitInfo) {
  console.log(new Date + ': Start downloading video')

  var options = {}
  options.filter = function(format) { return format.container === 'mp4' }

  // Download and Conversion
  var writeStream = fs.createWriteStream(submitInfo.video_id)

  var readStream = ytdl('http://youtu.be/'+submitInfo.video_id, options)
  readStream.pipe(writeStream)

  readStream.on('error', function(err) {
    console.error(err.message)
  })

  writeStream.on('error', function(err) {
    console.error(err.message)
  })

  writeStream.on('finish', function() {
    // Downloaded!
    /*
    Submits.findOneAndUpdate({  },
      { downloaded: true }, function (err, submit) {
        if (err) {
          return console.error(err.message)
        }
      })
    */

    db.submissions.update({ video_id: submitInfo.video_id, device: submitInfo.device_id },
      { $set: { downloaded: true } }, {},
    function (err, numReplaced) {
      if (err) {
        return console.log(err)
      }
    });
    // Convert do audio
    convert(submitInfo)
  })
}

function checkVideo(submitInfo) {
  fs.exists(__dirname + '/' + submitInfo.video_id, function(exists) {
    // Check if Audio file is created or correct
    if (exists) {
      convert(submitInfo)
    }
    else {
      downloadAndConvert(submitInfo)
    }
  })
}

function removeAudio(filePath) {
  fs.unlink(filePath, function (err) {
    if (err) {
      return console.error(err.message)
    }
    console.log('Successfully deleted: ' + filePath)
  });
}


// Public

module.exports.submit = function(url, device) {
  if (!url) {
    return
  }

  console.log(new Date() +': Start downloading '+ url)

  ytdl.getInfo(url, function (err, info) {
    if (err) {
      return console.error(err.message)
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

    console.log('Received submit for '+submitInfo.video_id)

    // Find with the same video id
    db.submissions.find({ video_id: submitInfo.video_id, device_id: submitInfo.device_id }, function (err, docs) {
      if (err) {
        return console.log(err)
      }

      // New
      if (docs.length === 0) {
        db.submissions.insert(submitInfo, function(err, doc) {
          console.log('Submission created: '+doc._id);
          // Check if video has been downloaded
          checkVideo(doc)
        })
      }
      else {
        console.log('Submission already exist with id '+docs[0]._id)
        // Exist, then check if video has been downloaded
        checkVideo(docs[0])
      }
    })


    /*
    Submits.where({ video_id: info.video_id, device: device }).findOne(function(err, submit) {
      if (err) {
        return console.error(err.message)
      }
      if (submit) {
        console.log('Exist: ' + info.video_id)
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
          if (err) {
            return console.error(err.message)
          }
          if (submit) {
            console.log('Saved: ' + info.video_id)
            // Exist, then check if video has been downloaded
            checkVideo(info.video_id, info.title)
          }
        })
      }
    })
    */

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

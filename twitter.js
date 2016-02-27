/**
 * This is the server that does everything. It serves the index.html web page.
 * It opens a streaming connection to Twitter and retrieves the tweets. It
 * publishes all of the geotagged tweets to a Socket.io socket.
 */

/**
 * EXPRESS BOILERPLATE GOES HERE
 */
var express = require('express'),
    app = express(),
    http = require('http').Server(app);

// Serve index.html at the root.
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Serve static files in the public directory.
app.use(express.static('public'));

// Run on port 3000.
http.listen(3000, function() {
  console.log('listening on 3000');
});

/**
 * Create a stupid EventEmitter so that we can decouple the Twitter listener
 * and the socket.io socket.
 */
var EventEmitter = require('events'),
    util = require('util');

function TweetEmitter() {
  EventEmitter.call(this);
}
util.inherits(TweetEmitter, EventEmitter);

var tweetEmitter = new TweetEmitter();

/**
 * Here's all the socket.io stuff
 */

var io = require('socket.io')(http);

tweetEmitter.on('tweet', function(tweet) {
  console.log(tweet);
  io.emit('tweet', tweet);
});

// a helper function to average coordinate pairs
function average(latLongs) {
  var n = latLongs.length, lon = 0.0, lat = 0.0;
  latLongs.forEach(function(ll) {
    lon += ll[0];
    lat += ll[1];
  });
  return [lon / n, lat / n];
}

// Twitter stuff

var Twitter = require('twitter'),
    credentials = require('./credentials.js'),
    client = new Twitter(credentials);

var QUERY = process.argv[2] || 'trump';

client.stream('statuses/filter', {track: QUERY}, function(stream) {
  stream.on('data', function(tweet) {
    if (tweet.place) {
      var tweetSmall = {
        id: tweet.id_str,
        user: tweet.user.screen_name,
        text: tweet.text,
        placeName: tweet.place.full_name,
        latLong: average(tweet.place.bounding_box.coordinates[0]),
      }
      tweetEmitter.emit('tweet', tweetSmall);
    }
  });
});

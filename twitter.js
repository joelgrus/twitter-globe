/**
 * This is the server that does everything. It serves the index.html web page.
 * It opens a streaming connection to Twitter and retrieves the tweets. It
 * publishes all of the geotagged tweets to a Socket.io socket.
 */

var Twitter = require('twitter'),
    credentials = require('./credentials.js'),
    client = new Twitter(credentials),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    EventEmitter = require('events'),
    util = require('util');

/**
 * EXPRESS BOILERPLATE GOES HERE
 */

// Serve index.html at the root.
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Serve static files in the public directory.
app.use(express.static('public'));

// Run on port 3000.
http.listen(3000, function() {
  console.log('listnening on 3000');
});

/**
 * Create a stupid EventEmitter so that we can decouple the Twitter listener
 * and the socket.io socket.
 */
function TweetEmitter() {
  EventEmitter.call(this);
}
util.inherits(TweetEmitter, EventEmitter);

var tweetEmitter = new TweetEmitter();

/**
 * Here's all the socket.io stuff
 */

tweetEmitter.on('tweet', function(tweet) {
  console.log(tweet);
  io.emit('tweet', tweet);
});

// Twitter stuff

var QUERY = process.argv[2] || 'trump';

function center(latLongs) {
  var n = latLongs.length;

  return latLongs.reduce(function(c, ll) {
    return [c[0] + ll[0]/n, c[1] + ll[1]/n];
  }, [0,0]);
}

client.stream('statuses/filter', {track: QUERY}, function(stream) {
  stream.on('data', function(tweet) {
    if (tweet.place) {
      var tweetSmall = {
        user: tweet.user.screen_name,
        text: tweet.text,
        placeName: tweet.place.full_name,
        latLong: center(tweet.place.bounding_box.coordinates[0])
      }
      tweetEmitter.emit('tweet', tweetSmall);
    }
  });
});

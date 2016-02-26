var Twitter = require('twitter'),
    credentials = require('./credentials.js'),
    client = new Twitter(credentials),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    EventEmitter = require('events'),
    util = require('util');

/*
 * EXPRESS BOILERPLATE
 *
 */

// Serve index.html.
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Service static files in the public directory.
app.use(express.static('public'));

// Run on port 3000.
http.listen(3000, function() {
  console.log('listnening on 3000');
});

// Set up an EventEmitter to decouple the Twitter listener and the socketio.

function TweetEmitter() {
  EventEmitter.call(this);
}
util.inherits(TweetEmitter, EventEmitter);

var tweetEmitter = new TweetEmitter();


// SocketIO stuff

var allClients = [];
io.on('connection', function(socket) {
  allClients.push(socket);
  console.log('connected');

  tweetEmitter.on('tweet', function(tweet) {
    io.emit('tweet', tweet);
  });

  socket.on('disconnect', function() {
    allClients = allClients.filter(function(s) { return s != socket; });
  })

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
      console.log(tweetSmall);
      tweetEmitter.emit('tweet', tweetSmall);
    }
  });
});

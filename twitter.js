var Twitter = require('twitter'),
    credentials = require('./credentials.js'),
    client = new Twitter(credentials),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

io.on('connection', function(socket) {
  console.log('connected');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

http.listen(3000, function() {
  console.log('listnening on 3000');
});

var QUERY = process.argv[2] || 'trump';

function center(latLongs) {
  var n = latLongs.length;

  return latLongs.reduce(function(c, ll) {
    return [c[0] + ll[0]/n, c[1] + ll[1]/n];
  }, [0,0]);
}

client.stream('statuses/filter', {track: QUERY}, function(stream) {
  io.on('connection', function (socket) {
    stream.on('data', function(tweet) {
      if (tweet.place) {
        var tweetSmall = {
          user: tweet.user.screen_name,
          text: tweet.text,
          placeName: tweet.place.full_name,
          latLong: center(tweet.place.bounding_box.coordinates[0])
        }
        console.log(tweetSmall);
        io.emit('tweet', tweetSmall);
      }
    });
  });
});

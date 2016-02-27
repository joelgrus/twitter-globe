# Tweets on a Globe!

Real-time visualization of geotagged tweets about a given topic, using d3, socket.io, and the Twitter API.

Read gory details at:

http://joelgrus.com/2016/02/27/trump-tweets-on-a-globe-aka-fun-with-d3-socketio-and-the-twitter-api/

![tweets on a globe](https://raw.githubusercontent.com/joelgrus/twitter-globe/master/globe.gif)

(Props to Mike Bostock's <a href = "http://bl.ocks.org/mbostock/4183330">World Tour</a>,
 from which I appropriated liberally.)

Run it yourself with your favorite search phrase. First install the dependencies:

```bash
$ npm install
```

then create a `credentials.js` that looks like

```js
module.exports = {
  consumer_key: "...",
  consumer_secret: "...",
  access_token_key: "...",
  access_token_secret: "..."
};
```

then start it running:

```bash
$ node twitter.js "search phrase goes here"
```

and finally navigate your browser to `localhost:3000`.

Put it up on a giant screen! It's strangely mesmerizing.

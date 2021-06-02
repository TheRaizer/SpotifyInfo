require("dotenv").config();
const express = require("express");
const redis = require("redis");
const session = require("express-session");

const app = express();
const tokens = require("./routes/tokens");
const spotifyActions = require("./routes/spotify-actions");

let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient();

redisClient.on("error", console.error);

const oneDayToSeconds = 24 * 60 * 60;

var sesh = {
  store: new RedisStore({ client: redisClient }),
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    signed: true,
    maxAge: oneDayToSeconds,
  },
};

// NODE_ENV is conventionally either 'production' or 'development'
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sesh.cookie.secure = true; // serve secure cookies
  sesh.cookie.httpOnly = false;
}

app.use(session(sesh));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// '/' represents the home page which will render index.html from express server
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/" + "index.html");

  // log the cookie of this session when starting site.
  console.log(req.session);
});
app.use("/tokens", tokens);
app.use("/spotify", spotifyActions);

app.listen(3000, function () {
  console.log("listening at localhost:3000");
});

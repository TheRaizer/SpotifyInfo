require("dotenv").config();
const express = require("express");
const redis = require("redis");
const session = require("express-session");

const app = express();
const tokens = require("./routes/tokens");
const spotifyActions = require("./routes/spotify-actions");

const RedisStore = require("connect-redis")(session);

//Configure redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
redisClient.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});
redisClient.on("connect", function () {
  console.log("Connected to redis successfully");
});

var sesh = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESH_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    signed: true,
    maxAge: 3_600_000, // 1 hours to ms
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
app.get("/", function (_req, res) {
  res.sendFile(__dirname + "/" + "index.html");
});

app.use("/tokens", tokens);
app.use("/spotify", spotifyActions);

app.listen(process.env.EXPRESS_PORT, function () {
  console.log("listening at localhost:3000");
});

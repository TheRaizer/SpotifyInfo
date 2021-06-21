import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createClient } from "redis";
import session from "express-session";

import { router as tokens } from "./routes/tokens.js";
import { router as spotifyActions } from "./routes/spotify-actions.js";
import RedisStore from "connect-redis";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const redisStore = RedisStore(session);

//Configure redis client
const redisClient = createClient({
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
  store: new redisStore({ client: redisClient }),
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

// middleware error handling functions need all 4 parameters to notify express that it is error handling
function logErrors(err, _req, _res, next) {
  console.error(err.stack);
  next(err);
}
function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: "Something failed!" });
  } else {
    next(err);
  }
}
function errorHandler(err, _req, res, next) {
  res.status(500);
  res.render("error", { error: err });
}

app.use(session(sesh));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.use(express.static(__dirname + "/public"));

// '/' represents the home page which will render index.html from express server
app.get("/", function (_req, res) {
  res.sendFile(__dirname + "/public/index.html");
}); // '/' represents the home page which will render index.html from express server
app.get("/playlists", function (_req, res) {
  res.sendFile(__dirname + "/public/pages/playlists-page/playlists.html");
});
app.get("/top-tracks", function (_req, res) {
  res.sendFile(__dirname + "/public/pages/top-tracks-page/top-tracks.html");
});

app.use("/tokens", tokens);
app.use("/spotify", spotifyActions);

app.listen(process.env.EXPRESS_PORT, function () {
  console.log("listening at localhost:3000");
});

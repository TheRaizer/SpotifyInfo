import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createClient } from "redis";

import helmet from "helmet";
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
  password: process.env.REDIS_PASSWORD,
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
    maxAge: 8.64e7, // 1 day to ms
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
  console.log(err.response.data);
  next(err);
}

// the app.use middleware run top down so we log errors at the end

app.use(
  helmet({
    // don't set CSP (content security policy middle ware) as this will be set manually
    contentSecurityPolicy: false,
  })
);
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      // allow these src's to be used in scripts.
      "script-src": [
        "'self'",
        "https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/interact.js/1.10.11/interact.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.3.2/chart.min.js",
      ],
    },
  })
);
app.use(session(sesh));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/tokens", tokens);
app.use("/spotify", spotifyActions);

app.use(logErrors);

app.use(express.static(__dirname + "/public"));

// '/' represents the home page which will render index.html from express server
app.get("/", function (_req, res) {
  res.status(200).sendFile(__dirname + "/public/index.html");
}); // '/' represents the home page which will render index.html from express server

app.get("/playlists", function (_req, res) {
  res
    .status(200)
    .sendFile(__dirname + "/public/pages/playlists-page/playlists.html");
});
app.get("/top-tracks", function (_req, res) {
  res
    .status(200)
    .sendFile(__dirname + "/public/pages/top-tracks-page/top-tracks.html");
});

app.get("/top-artists", function (_req, res) {
  res
    .status(200)
    .sendFile(__dirname + "/public/pages/top-artists-page/top-artists.html");
});

app.get("/profile", function (_req, res) {
  res
    .status(200)
    .sendFile(__dirname + "/public/pages/profile-page/profile.html");
});

// clear session data
app.put("/clear-session", function (req, res) {
  req.session.destroy();
  res.sendStatus(200);
});

app.listen(process.env.EXPRESS_PORT, function () {
  console.log("listening at localhost:" + process.env.EXPRESS_PORT);
});

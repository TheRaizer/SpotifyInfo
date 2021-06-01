require("dotenv").config();
const express = require("express");
const session = require("express-session");

const app = express();
const tokens = require("./routes/tokens");
const spotifyActions = require("./routes/spotify-actions");

const oneDayToSeconds = 24 * 60 * 60;

var sesh = {
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: oneDayToSeconds,
    access_token: "",
    refresh_token: "",
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

app.listen(3000, function () {
  console.log("listening at localhost:3000");
});

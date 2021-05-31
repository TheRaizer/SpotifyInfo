const tokenEndpoint = "https://accounts.spotify.com/api/token";
const redirectUri = "http://localhost:3000";

require("dotenv").config();
var express = require("express");
var session = require("express-session");
var axios = require("axios");

var app = express();

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if have https
  })
);
app.use(express.static(__dirname + "/public"));

// '/' represents the home page which will render index.html from express server
app.get("/", function (_req, res) {
  res.sendFile(__dirname + "/" + "index.html");
});

// expecting /get_tokens?code=XXXX
app.get("/get_tokens", async function (req, res, next) {
  // get code from request parameter
  authCode = req.query.code;

  // generate the url to obtain the token
  const tokenURL = `${tokenEndpoint}?grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUri}`;
  await axios
    // get a reponse through the spotify web api using the tokenURL
    .get(tokenURL, {
      // this uses client secret which is why this process must be done in backend
      Authorization: `Basic *<base64 encoded ${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}>*`,
    })
    .then((response) => {
      // store the response in the session as 'tokens'
      req.session.tokens = response;
      console.log(req.session.tokens);
      res.end(JSON.stringify(response));
    })
    .catch((err) => {
      // log caught error
      console.log(err);
      // move onto next middleware
      next(err);
    });
});

app.listen(3000, function () {
  console.log("listening at localhost:3000");
});

require("dotenv").config();
const express = require("express");
const session = require("express-session");

const app = express();
const tokens = require("./routes/tokens");

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if have https
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// '/' represents the home page which will render index.html from express server
app.get("/", function (_req, res) {
  res.sendFile(__dirname + "/" + "index.html");
});
app.use("/tokens", tokens);

app.listen(3000, function () {
  console.log("listening at localhost:3000");
});

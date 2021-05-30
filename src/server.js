var express = require("express");
var app = express();

app.use(express.static(__dirname + "/public"));

// '/' represents the home page which will render index.html from express server
app.get("/", function (_req, res) {
  res.sendFile(__dirname + "/" + "index.html");
});

app.listen(3000, function () {
  console.log("Example app listening at localhost:3000");
});

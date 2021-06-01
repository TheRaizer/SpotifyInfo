const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/get_currently_playing", async function (req, res, next) {
  await axios({
    method: "get",
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    headers: { Authorization: "Bearer " + req.session.tokens.access_token },
  })
    .then(function (response) {
      res.send(response.data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;

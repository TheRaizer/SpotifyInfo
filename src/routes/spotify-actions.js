const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/get_currently_playing", async function (req, res) {
  await axios({
    method: "get",
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    headers: {
      Authorization: "Bearer " + req.session.access_token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      let data = {
        item: response.data.item,
        is_playing: response.data.is_playing,
        progress_ms: response.data.progress_ms,
      };
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;

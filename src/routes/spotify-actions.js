const express = require("express");
const router = express.Router();
const axios = require("axios");

const spotifyGetHeaders = (req) => {
  return {
    Authorization: "Bearer " + req.session.access_token,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

const getTopPromise = (req, url) => {
  return new Promise((resolve, reject) => {
    // if no time range is given default to 'short_term'
    var timeRange =
      req.query.time_range === undefined ? "short_term" : req.query.time_range;
    axios({
      method: "get",
      url: `${url}?time_range=${timeRange}&limit=5`,
      headers: spotifyGetHeaders(req),
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

router.get("/get-top-artists", async function (req, res, next) {
  await getTopPromise(req, "https://api.spotify.com/v1/me/top/artists")
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.log("ERROR IN GET TOP ARTISTS");
      console.error(err);
      next(err);
    });
});

router.get("/get-top-tracks", async function (req, res) {
  await getTopPromise(req, "https://api.spotify.com/v1/me/top/tracks")
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.log("ERROR IN GET TOP TRACK");
      console.error(err);
    });
});

router.get("/get-playlists", async function (req, res) {
  await axios({
    method: "get",
    url: "https://api.spotify.com/v1/me/playlists",
    headers: spotifyGetHeaders(req),
  })
    .then(function (response) {
      // the json is nested in a way that the below will retrieve playlists
      res.send(response.data.items);
    })
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;

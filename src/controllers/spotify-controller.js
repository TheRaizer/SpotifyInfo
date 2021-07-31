import axios from "axios";

const spotifyGetHeaders = (req) => {
  return {
    Authorization: "Bearer " + req.session.access_token,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};
// time range can be 'short_term', 'medium_term', and 'long_term'
const getTopPromise = (req, url) => {
  return new Promise((resolve, reject) => {
    // if no time range is given default to 'short_term'
    var timeRange =
      req.query.time_range === undefined ? "short_term" : req.query.time_range;
    axios({
      method: "get",
      url: `${url}?time_range=${timeRange}&limit=50`,
      headers: spotifyGetHeaders(req),
    })
      .then((res) => {
        // data.items will return the list of top
        resolve(res.data.items);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
async function getTopArtists(req, res, next) {
  await getTopPromise(req, "https://api.spotify.com/v1/me/top/artists")
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.log("ERROR IN GET TOP ARTISTS");
      console.error(err);
      // run next to pass this error down to a middleware that will handle it
      next(err);
    });
}
async function getTopTracks(req, res, next) {
  await getTopPromise(req, "https://api.spotify.com/v1/me/top/tracks")
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.error(err);
      // run next to pass this error down to a middleware that will handle it
      next(err);
    });
}
async function getPlaylists(req, res, next) {
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
      // run next to pass this error down to a middleware that will handle it
      next(err);
    });
}
async function getPlaylistTracks(req, res, next) {
  var playlistId = req.query.playlist_id;

  await axios({
    method: "get",
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=ES`,
    headers: spotifyGetHeaders(req),
  })
    .then(function (response) {
      // get the list of items
      let items = response.data.items;
      res.send(items);
    })
    .catch((err) => {
      console.error(err);
      // run next to pass this error down to a middleware that will handle it
      next(err);
    });
}
async function getTrackFeatures(req, res, next) {
  var track_ids = req.query.track_ids;

  await axios({
    method: "get",
    url: `https://api.spotify.com/v1/audio-features?ids=${track_ids}`,
    headers: spotifyGetHeaders(req),
  })
    .then(function (response) {
      res.send(response.data);
    })
    .catch((err) => {
      console.error(err);
      // run next to pass this error down to a middleware that will handle it
      next(err);
    });
}
async function deletePlaylistItems(req, res, next) {
  var playlistId = req.query.playlist_id;
  let trackObjs = req.body.tracks;
  const uriData = [];

  for (let i = 0; i < trackObjs.length; i++) {
    let track = trackObjs[i];
    uriData.push({ uri: track.uri });
  }

  await axios({
    method: "delete",
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    headers: spotifyGetHeaders(req),
    data: { tracks: uriData },
  })
    .then(function () {
      res.send("Success");
    })
    .catch((err) => {
      console.error(err);
      // run next to pass this error down to a middleware that will handle it
      next(err);
    });
}
async function postPlaylistItems(req, res, next) {
  var playlistId = req.query.playlist_id;
  let trackObjs = req.body.data.tracks;
  const uriData = [];
  for (let i = 0; i < trackObjs.length; i++) {
    let track = trackObjs[i];
    uriData.push(track.uri);
  }
  await axios({
    method: "post",
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    headers: spotifyGetHeaders(req),
    data: { uris: uriData },
  })
    .then(function () {
      res.send("Success");
    })
    .catch((err) => {
      console.error(err);
      // run next to pass this error down to a middleware that will handle it
      next(err);
    });
}
async function postSessionData(req, res, next) {
  let attr = req.query.attr;
  let val = req.query.val;

  if (attr == "refresh_token" || attr == "access_token") {
    next(new Error("Invalid Attribute"));
  } else {
    req.session[attr] = val;
    console.log(req.session);

    res.send("recieved post request to clear tokens");
  }
}
async function getSessionData(req, res, next) {
  let attr = req.query.attr;

  if (attr == "refresh_token" || attr == "access_token") {
    next(new Error("Invalid Attribute"));
  } else {
    res.send(req.session[attr]);
  }
}

export default {
  getTopArtists,
  getTopTracks,
  getPlaylists,
  getPlaylistTracks,
  getTrackFeatures,
  deletePlaylistItems,
  postPlaylistItems,
  postSessionData,
  getSessionData,
};

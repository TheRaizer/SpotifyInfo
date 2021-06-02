const express = require("express");
const qs = require("qs");
const router = express.Router();
const axios = require("axios");

const redirectUri = "http://localhost:3000";

// whether the session has tokens
router.get("/has_tokens", function (req, res) {
  if (req.session.access_token && req.session.refresh_token) {
    res.send(true);
  } else {
    res.send(false);
  }
});

const getTokensPromise = (req) => {
  return new Promise((resolve, reject) => {
    // get code from request parameter
    authCode = req.query.code;
    const tokenURL = "https://accounts.spotify.com/api/token";
    const headers = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    let data = {
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: redirectUri,
      // this uses client secret which is why this process must be done in backend
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.CLIENT_ID,
    };

    axios
      // get a reponse through the spotify web api using the tokenURL
      .post(tokenURL, qs.stringify(data), headers)
      .then((response) => {
        // store the tokens in session store
        req.session.access_token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;
        console.log(req.session);

        // log the session when tokens are obtained
        console.log(req.session);

        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// expecting /get_tokens?code=XXXX
router.get("/get_tokens", async function (req, res) {
  await getTokensPromise(req).catch((err) => {
    // log caught error
    console.error(err);
  });
  res.send("Post handler for token route");
});

module.exports = router;

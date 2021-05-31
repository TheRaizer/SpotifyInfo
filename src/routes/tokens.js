const express = require("express");
const qs = require("qs");
const router = express.Router();
const axios = require("axios");

const redirectUri = "http://localhost:3000";

// expecting /get_tokens?code=XXXX
router.get("/get_tokens", async function (req, res, next) {
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

  await axios
    // get a reponse through the spotify web api using the tokenURL
    .post(tokenURL, qs.stringify(data), headers)
    .then((response) => {
      // store the response in the session as 'tokens'
      req.session.tokens = response.data;
      console.log(req.session.tokens);
    })
    .catch((err) => {
      // log caught error
      console.log(err);
      // move onto next middleware
      next(err);
    });
  res.send("Post handler for token route");
});

module.exports = router;

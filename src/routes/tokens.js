import { Router } from "express";
import { stringify } from "qs";
export const router = Router();
import axios from "axios";

// whether the session has tokens
router.get("/has-tokens", function (req, res) {
  if (req.session.access_token && req.session.refresh_token) {
    res.send(true);
  } else {
    res.send(false);
  }
});

router.post("/clear-tokens", function (req, res) {
  console.log("clear tokens");
  req.session.access_token = "";
  req.session.refresh_token = "";

  res.send("recieved post request to clear tokens");
});

const getTokensPromise = (req) => {
  return new Promise((resolve, reject) => {
    // get code from request parameter
    var authCode = req.query.code;
    const tokenURL = "https://accounts.spotify.com/api/token";
    const headers = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    let data = {
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: process.env.REDIRECT_URI,
      // this uses client secret which is why this process must be done in backend
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.CLIENT_ID,
    };

    axios
      .post(tokenURL, stringify(data), headers)
      .then((response) => {
        // store the tokens in session store
        req.session.access_token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;

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
router.get("/get-tokens", async function (req, res, next) {
  await getTokensPromise(req).catch((err) => {
    console.error(err);
    next(err);
  });
  res.send("Post handler for token route");
});

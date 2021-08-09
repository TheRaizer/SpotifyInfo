import { stringify } from "qs";
import axios from "axios";

function hasBeenMoreOneHour(date) {
  const HALF_HOUR = 1.8e6; // subtract for uncertainty
  if (new Date() - date >= HALF_HOUR) {
    return true;
  }
  return false;
}

const retrieveTokensPromise = async (req, isRefresh) => {
  const tokenURL = "https://accounts.spotify.com/api/token";
  const headers = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let data;
  if (isRefresh) {
    data = {
      grant_type: "refresh_token",
      refresh_token: req.session.refresh_token,
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.CLIENT_ID,
    };
  } else {
    // get code from request parameter
    var authCode = req.query.code;
    data = {
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: process.env.REDIRECT_URI,
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.CLIENT_ID,
    };
  }
  return axios.post(tokenURL, stringify(data), headers).then((response) => {
    req.session.updateDate = new Date();
    // store the tokens in session store
    req.session.access_token = response.data.access_token;

    if (!isRefresh) {
      req.session.refresh_token = response.data.refresh_token;
    }

    // log the session when tokens are obtained
    console.log(req.session);
  });
};

// whether the session has tokens
async function hasTokens(req, res, next) {
  if (req.session.access_token && req.session.refresh_token) {
    // if its been more then 1 hour since this session's tokens were obtained
    if (hasBeenMoreOneHour(new Date(req.session.updateDate))) {
      // refresh tokens
      await retrieveTokensPromise(req, true).catch((err) => {
        next(err);
      });
    }
    res.send(true);
  } else {
    res.send(false);
  }
}

async function refreshTokens(req, _res, next) {
  await retrieveTokensPromise(req, true).catch((err) => {
    next(err);
  });
}

function clearTokens(req, res) {
  console.log("clear tokens");
  req.session.access_token = "";
  req.session.refresh_token = "";

  res.send("recieved post request to clear tokens");
}

// expecting /retrieve_tokens?code=XXXX
async function retrieveTokens(req, res, next) {
  await retrieveTokensPromise(req, false).catch((err) => {
    next(err);
  });
  res.send("Post handler for token route");
}

export default { hasTokens, refreshTokens, clearTokens, retrieveTokens };

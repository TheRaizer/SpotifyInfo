import { stringify } from "qs";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

function hasBeenMoreOneHour(date) {
  const HALF_HOUR = 1.8e6; // subtract for uncertainty
  if (new Date() - date >= HALF_HOUR) {
    return true;
  }
  return false;
}

const regenerateSessionWithTokens = (
  req,
  res,
  isRefresh,
  expressRes,
  dataToSend = null
) => {
  var sessionData = req.session;
  // regenerate session which changes id
  req.session.regenerate((err) => {
    if (err) {
      throw new Error(err);
    }
    // once session regenerated, reassign the data
    Object.assign(req.session, sessionData);
    req.session.updateDate = new Date();

    // store the tokens in refreshed session store
    req.session.access_token = res.data.access_token;

    if (!isRefresh) {
      req.session.refresh_token = res.data.refresh_token;
    }

    // if the request has data to send, send it.
    if (dataToSend) {
      expressRes.status(StatusCodes.OK).send(dataToSend);
    } else {
      expressRes.sendStatus(StatusCodes.NO_CONTENT);
    }
  });
};
const obtainTokensPromise = async (
  req,
  isRefresh,
  expressRes,
  dataToSend = null
) => {
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
  const res = await axios.post(tokenURL, stringify(data), headers);
  regenerateSessionWithTokens(req, res, isRefresh, expressRes, dataToSend);
};
// whether the session has tokens
async function hasTokens(req, res, next) {
  if (req.session.access_token && req.session.refresh_token) {
    // if its been more then 1 hour since this session's tokens were obtained
    if (hasBeenMoreOneHour(new Date(req.session.updateDate))) {
      // refresh tokens
      await obtainTokensPromise(req, true, res, true).catch((err) => {
        next(err);
      });
    } else {
      res.status(StatusCodes.OK).send(true);
    }
  } else {
    res.status(StatusCodes.OK).send(false);
  }
}

async function refreshTokens(req, res, next) {
  await obtainTokensPromise(req, true, res).catch((err) => {
    next(err);
  });
}

function clearTokens(req, res) {
  console.log("clear tokens");
  req.session.access_token = "";
  req.session.refresh_token = "";

  res.sendStatus(StatusCodes.NO_CONTENT);
}

async function obtainTokens(req, res, next) {
  await obtainTokensPromise(req, false, res).catch((err) => {
    next(err);
  });
}

function getAccessToken(req, res) {
  if (req.session.access_token) {
    res.status(StatusCodes.OK).send(req.session.access_token);
  } else {
    res.status(StatusCodes.NO_CONTENT).send(null);
  }
}

export default {
  hasTokens,
  refreshTokens,
  clearTokens,
  obtainTokens,
  getAccessToken,
};

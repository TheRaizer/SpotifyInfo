import { stringify } from 'qs'
import * as axiosTypes from 'axios'
import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import type { Request, Response, NextFunction } from 'express'
import User from '../user'

function hasBeenMoreOneHour (date: Date): boolean {
  const HALF_HOUR = 1.8e6 // subtract for uncertainty
  const timeDiff = Date.now() - date.getTime()
  if (timeDiff >= HALF_HOUR) {
    return true
  }
  return false
}

const regenerateSessionWithTokens = (
  req: Request,
  res: axiosTypes.AxiosResponse<any>,
  isRefresh: boolean,
  expressRes: Response,
  hasTokens?: boolean
) => {
  const sessionData = req.session
  // regenerate session which changes id
  req.session.regenerate((err) => {
    if (err) {
      throw new Error(err)
    }
    // once session regenerated, reassign the data
    Object.assign(req.session, sessionData)

    if (req.session.user === undefined) {
      req.session.user = new User()
    }
    req.session.user.updateDate = new Date()

    // store the tokens in refreshed session store
    req.session.user.access_token = res.data.access_token

    if (!isRefresh) {
      req.session.user.refresh_token = res.data.refresh_token
    }
    // if the request has data to send, send it.
    if (hasTokens) {
      expressRes.status(StatusCodes.OK).send(hasTokens)
    } else {
      expressRes.sendStatus(StatusCodes.NO_CONTENT)
    }
  })
}

const obtainTokensPromise = async (
  req: Request,
  isRefresh: boolean,
  expressRes: Response,
  hasTokens?: boolean
) => {
  const tokenURL = 'https://accounts.spotify.com/api/token'
  const headers = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  interface TokenData {
    grant_type: string
    redirect_uri: string
    refresh_token: string
    client_secret: string
    client_id: string
    code?: string
  }

  let data: TokenData
  if (isRefresh) {
    data = <TokenData>{
      grant_type: 'refresh_token',
      refresh_token: req.session.user?.refresh_token,
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.CLIENT_ID
    }
  } else {
    // get code from request parameter
    const authCode = req.query.code as string
    data = <TokenData>{
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: process.env.REDIRECT_URI,
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.CLIENT_ID
    }
  }
  const res = await axios.post(tokenURL, stringify(data), headers)
  regenerateSessionWithTokens(req, res, isRefresh, expressRes, hasTokens)
}
// whether the session has tokens
async function hasTokens (req: Request, res: Response, next: NextFunction) {
  if (req.session.user?.access_token && req.session.user?.refresh_token) {
    // if its been more then 1 hour since this session's tokens were obtained
    if (hasBeenMoreOneHour(new Date(req.session.user.updateDate))) {
      // refresh tokens
      await obtainTokensPromise(req, true, res, true).catch((err) => {
        next(err)
      })
    } else {
      res.status(StatusCodes.OK).send(true)
    }
  } else {
    res.status(StatusCodes.OK).send(false)
  }
}

async function refreshTokens (req: Request, res: Response, next: NextFunction) {
  await obtainTokensPromise(req, true, res).catch((err) => {
    next(err)
  })
}

function clearTokens (req: Request, res: Response) {
  console.log('clear tokens')
  if (req.session.user !== undefined) {
    req.session.user.access_token = ''
    req.session.user.refresh_token = ''
  }

  res.sendStatus(StatusCodes.NO_CONTENT)
}

// obtains the tokens given an auth code
async function obtainTokens (req: Request, res: Response, next: NextFunction) {
  await obtainTokensPromise(req, false, res).catch((err) => {
    next(err)
  })
}

// gets the access token and sends it to client
function getAccessToken (req: Request, res: Response) {
  if (req.session.user?.access_token) {
    res.status(StatusCodes.OK).send(req.session.user?.access_token)
  } else {
    res.status(StatusCodes.NO_CONTENT).send(null)
  }
}

const tokenCtrl = {
  hasTokens,
  refreshTokens,
  clearTokens,
  obtainTokens,
  getAccessToken
}

export { tokenCtrl }

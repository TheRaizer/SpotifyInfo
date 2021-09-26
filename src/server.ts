/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import express from 'express'
import type { Request, Response, NextFunction, Application } from 'express'

import { createClient } from 'redis'

import helmet from 'helmet'
import session from 'express-session'
import type { SessionOptions } from 'express-session'

import { router as tokens } from './routes/tokens'
import { router as spotifyActions } from './routes/spotify-actions'
import { router as userActions } from './routes/user-actions'
import RedisStore from 'connect-redis'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import User from './user'
import path from 'path'

declare module 'express-session' {
  interface SessionData {
    user: User
  }
}

console.log(__dirname)
require('dotenv').config({ path: path.join(__dirname, '/.env') })

// express and helmet protects api from being called on other sites, also known as CORS
// more info: https://stackoverflow.com/questions/31378997/express-js-limit-api-access-to-only-pages-from-the-same-website
const app: Application = express()

const RedisStorage = RedisStore(session)
console.log(process.env)
if (process.env.REDIS_PORT === undefined) {
  throw new Error('Redis port is undefined in .env')
}
// Configure redis client
const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD
})
redisClient.on('error', function (err) {
  console.log('Could not establish a connection with redis. ' + err)
})
redisClient.on('connect', function () {
  console.log('Connected to redis successfully')
})

let sesh: SessionOptions

if (process.env.SESH_SECRET) {
  sesh = {
    store: new RedisStorage({ client: redisClient }),
    secret: [process.env.SESH_SECRET],
    genid: function () {
      return uuidv4() + crypto.randomBytes(48) // use UUIDs for session IDs
    },
    resave: false,
    saveUninitialized: false,
    name: 'IloveCooking',
    cookie: {
      signed: true,
      maxAge: 8.64e7 // 1 day to ms
    }
  }
} else {
  throw new Error('NO session secret found on .env')
}

// NODE_ENV is conventionally either 'production' or 'development'
if (process.env.NODE_ENV === 'production') {
  console.log('Production')
  app.set('trust proxy', 1) // trust first proxy
  if (sesh.cookie) {
    sesh.cookie.secure = true // serve secure cookies
    sesh.cookie.httpOnly = true
    sesh.cookie.sameSite = true
  }
}

// middleware error handling functions need all 4 parameters to notify express that it is error handling
function logErrors (err: { response: { data: any } }, _req: Request, _res: Response, next: NextFunction) {
  console.log(err.response.data)
  next(err)
}

// the app.use middleware run top down so we log errors at the end

app.use(
  helmet({
    // don't set CSP (content security policy middle ware) as this will be set manually
    contentSecurityPolicy: false
  })
)
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'img-src': [
        "'self'",
        'data:',
        // trust these src's to obtain images, as they are spotify owned
        'https://i.scdn.co/',
        'https://mosaic.scdn.co/',
        'https://lineup-images.scdn.co/'
      ],
      // allow these src's to be used in scripts.
      'script-src': [
        "'self'",
        'https://cdnjs.cloudflare.com',
        'https://sdk.scdn.co'
      ],
      'frame-src': ["'self'", 'https://sdk.scdn.co']
    }
  })
)
app.use(session(sesh))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/tokens', tokens)
app.use('/spotify', spotifyActions)
app.use('/user', userActions)

app.use(logErrors)

app.use(express.static(path.join(__dirname, '/public')))

// '/' represents the home page which will render index.html from express server
app.get('/', function (_req: Request, res: Response) {
  res.status(StatusCodes.OK).sendFile(path.join(__dirname, '/public/index.html'))
}) // '/' represents the home page which will render index.html from express server

app.get('/playlists', function (_req: Request, res: Response) {
  res
    .status(StatusCodes.OK)
    .sendFile(path.join(__dirname, '/public/pages/playlists-page/playlists.html'))
})
app.get('/top-tracks', function (_req: Request, res: Response) {
  res
    .status(StatusCodes.OK)
    .sendFile(path.join(__dirname, '/public/pages/top-tracks-page/top-tracks.html'))
})

app.get('/top-artists', function (_req: Request, res: Response) {
  res
    .status(StatusCodes.OK)
    .sendFile(path.join(__dirname, '/public/pages/top-artists-page/top-artists.html'))
})

app.get('/profile', function (_req: Request, res: Response) {
  res
    .status(StatusCodes.OK)
    .sendFile(path.join(__dirname, '/public/pages/profile-page/profile.html'))
})

// clear session data
app.put('/clear-session', function (req: Request, res: Response, next: NextFunction) {
  req.session.destroy((err) => next(err))
  res.sendStatus(StatusCodes.OK)
})

app.listen(process.env.EXPRESS_PORT, function () {
  console.log('listening at localhost:' + process.env.EXPRESS_PORT)

  // set interval to update secret every minute
  setInterval(function () {
    crypto.randomBytes(66, function (_err, buffer: Buffer) {
      const secret = buffer.toString('hex')
      let secretA
      (sesh.secret as Array<string>).unshift(secret)
    })
  }, 60000)
})

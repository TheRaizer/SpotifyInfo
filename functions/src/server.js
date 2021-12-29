"use strict";
exports.__esModule = true;
exports.server = void 0;
var http_status_codes_1 = require("http-status-codes");
var express = require("express");
var redis_1 = require("redis");
var helmet = require("helmet");
var session = require("express-session");
var tokens_1 = require("./routes/tokens");
var spotify_actions_1 = require("./routes/spotify-actions");
var user_actions_1 = require("./routes/user-actions");
var RedisStore = require("connect-redis");
var crypto = require("crypto");
var uuid_1 = require("uuid");
var path = require("path");
var functions = require("firebase-functions");
require('dotenv').config({ path: path.join(__dirname, '/.env') });
// express and helmet protects api from being called on other sites, also known as CORS
// more info: https://stackoverflow.com/questions/31378997/express-js-limit-api-access-to-only-pages-from-the-same-website
var app = express();
var _a = process.env, REDIS_PORT = _a.REDIS_PORT, REDIS_HOST = _a.REDIS_HOST, REDIS_PASSWORD = _a.REDIS_PASSWORD, SESH_SECRET = _a.SESH_SECRET, NODE_ENV = _a.NODE_ENV;
var RedisStorage = RedisStore(session);
if (REDIS_PORT === undefined) {
    throw new Error('Redis port is undefined in .env');
}
// Configure redis client
var redisClient = (0, redis_1.createClient)({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
    password: REDIS_PASSWORD
});
redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function () {
    console.log('Connected to redis successfully');
});
var sesh;
if (process.env.SESH_SECRET) {
    sesh = {
        store: new RedisStorage({ client: redisClient }),
        secret: [SESH_SECRET],
        genid: function () {
            return (0, uuid_1.v4)() + crypto.randomBytes(48); // use UUIDs for session IDs
        },
        resave: false,
        saveUninitialized: false,
        name: '__sess__',
        cookie: {
            signed: true,
            maxAge: 8.64e7 // 1 day to ms
        }
    };
}
else {
    throw new Error('NO session secret found on .env');
}
// NODE_ENV is conventionally either 'production' or 'development'
if (NODE_ENV === 'production') {
    console.log('Production');
    app.set('trust proxy', 1); // trust first proxy
    if (sesh.cookie) {
        sesh.cookie.secure = true; // serve secure cookies
        sesh.cookie.httpOnly = true;
        sesh.cookie.sameSite = true;
    }
}
// middleware error handling functions need all 4 parameters to notify express that it is error handling
function logErrors(err, _req, _res, next) {
    console.log(err.response.data);
    next(err);
}
// the app.use middleware run top down so we log errors at the end
app.use(helmet({
    // don't set CSP (content security policy middle ware) as this will be set manually
    contentSecurityPolicy: false
}));
app.use(
// manually override some attributes of the content security policy
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
}));
app.use(session(sesh));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/tokens', tokens_1.router);
app.use('/spotify', spotify_actions_1.router);
app.use('/user', user_actions_1.router);
app.use(logErrors);
app.use(express.static(path.join(__dirname, '/public')));
// '/' represents the home page which will render index.html from express server
app.get('/', function (_req, res) {
    res.status(http_status_codes_1.StatusCodes.OK).sendFile(path.join(__dirname, '/public/index.html'));
}); // '/' represents the home page which will render index.html from express server
app.get('/playlists', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path.join(__dirname, '/public/pages/playlists-page/playlists.html'));
});
app.get('/top-tracks', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path.join(__dirname, '/public/pages/top-tracks-page/top-tracks.html'));
});
app.get('/top-artists', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path.join(__dirname, '/public/pages/top-artists-page/top-artists.html'));
});
app.get('/profile', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path.join(__dirname, '/public/pages/profile-page/profile.html'));
});
// clear session data
app.put('/clear-session', function (req, res, next) {
    req.session.destroy(function (err) { return next(err); });
    res.sendStatus(http_status_codes_1.StatusCodes.OK);
});
app.on('listening', function () {
    console.log('listening at localhost:' + process.env.EXPRESS_PORT);
    // set interval to update secret every minute
    setInterval(function () {
        crypto.randomBytes(66, function (_err, buffer) {
            var secret = buffer.toString('hex');
            sesh.secret.unshift(secret);
        });
    }, 60000);
});
exports.server = functions.https.onRequest(app);

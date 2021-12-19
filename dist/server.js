"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
const http_status_codes_1 = require("http-status-codes");
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const tokens_1 = require("./routes/tokens");
const spotify_actions_1 = require("./routes/spotify-actions");
const user_actions_1 = require("./routes/user-actions");
const connect_redis_1 = __importDefault(require("connect-redis"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
console.log(__dirname);
require('dotenv').config({ path: path_1.default.join(__dirname, '/.env') });
// express and helmet protects api from being called on other sites, also known as CORS
// more info: https://stackoverflow.com/questions/31378997/express-js-limit-api-access-to-only-pages-from-the-same-website
const app = (0, express_1.default)();
const RedisStorage = (0, connect_redis_1.default)(express_session_1.default);
if (process.env.REDIS_PORT === undefined) {
    throw new Error('Redis port is undefined in .env');
}
// Configure redis client
const redisClient = (0, redis_1.createClient)({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
});
redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function () {
    console.log('Connected to redis successfully');
});
let sesh;
if (process.env.SESH_SECRET) {
    sesh = {
        store: new RedisStorage({ client: redisClient }),
        secret: [process.env.SESH_SECRET],
        genid: function () {
            return (0, uuid_1.v4)() + crypto_1.default.randomBytes(48); // use UUIDs for session IDs
        },
        resave: false,
        saveUninitialized: false,
        name: 'IloveCooking',
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
if (process.env.NODE_ENV === 'production') {
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
app.use((0, helmet_1.default)({
    // don't set CSP (content security policy middle ware) as this will be set manually
    contentSecurityPolicy: false
}));
app.use(helmet_1.default.contentSecurityPolicy({
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
app.use((0, express_session_1.default)(sesh));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use('/tokens', tokens_1.router);
app.use('/spotify', spotify_actions_1.router);
app.use('/user', user_actions_1.router);
app.use(logErrors);
app.use(express_1.default.static(path_1.default.join(__dirname, '/public')));
// '/' represents the home page which will render index.html from express server
app.get('/', function (_req, res) {
    res.status(http_status_codes_1.StatusCodes.OK).sendFile(path_1.default.join(__dirname, '/public/index.html'));
}); // '/' represents the home page which will render index.html from express server
app.get('/playlists', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path_1.default.join(__dirname, '/public/pages/playlists-page/playlists.html'));
});
app.get('/top-tracks', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path_1.default.join(__dirname, '/public/pages/top-tracks-page/top-tracks.html'));
});
app.get('/top-artists', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path_1.default.join(__dirname, '/public/pages/top-artists-page/top-artists.html'));
});
app.get('/profile', function (_req, res) {
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .sendFile(path_1.default.join(__dirname, '/public/pages/profile-page/profile.html'));
});
// clear session data
app.put('/clear-session', function (req, res, next) {
    req.session.destroy((err) => next(err));
    res.sendStatus(http_status_codes_1.StatusCodes.OK);
});
app.listen(process.env.EXPRESS_PORT, function () {
    console.log('listening at localhost:' + process.env.EXPRESS_PORT);
    // set interval to update secret every minute
    setInterval(function () {
        crypto_1.default.randomBytes(66, function (_err, buffer) {
            const secret = buffer.toString('hex');
            sesh.secret.unshift(secret);
        });
    }, 60000);
});
//# sourceMappingURL=server.js.map
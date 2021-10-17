"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spotifyCtrl = void 0;
const axios_1 = __importDefault(require("axios"));
const http_status_codes_1 = require("http-status-codes");
const spotifyGetHeaders = (req) => {
    var _a;
    return {
        Authorization: 'Bearer ' + ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.access_token),
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
};
// time range can be 'short_term', 'medium_term', and 'long_term'
const getTopPromise = (req, url) => {
    return new Promise((resolve, reject) => {
        // if no time range is given default to 'short_term'
        const timeRange = req.query.time_range === undefined ? 'short_term' : req.query.time_range;
        (0, axios_1.default)({
            method: 'get',
            url: `${url}?time_range=${timeRange}&limit=50`,
            headers: spotifyGetHeaders(req)
        })
            .then((res) => {
            // if the promise was succesful then resolve the top items.
            resolve(res.data.items);
        })
            .catch((err) => {
            reject(err);
        });
    });
};
function getTopArtists(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield getTopPromise(req, 'https://api.spotify.com/v1/me/top/artists')
            .then((response) => {
            res.status(http_status_codes_1.StatusCodes.OK).send(response);
        })
            .catch((err) => {
            console.log('ERROR IN GET TOP ARTISTS');
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getTopTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield getTopPromise(req, 'https://api.spotify.com/v1/me/top/tracks')
            .then((response) => {
            res.status(http_status_codes_1.StatusCodes.OK).send(response);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getPlaylists(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, axios_1.default)({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/playlists?limit=50',
            headers: spotifyGetHeaders(req)
        })
            .then(function (response) {
            // the json is nested in a way that the below will retrieve playlists
            res.status(http_status_codes_1.StatusCodes.OK).send(response.data.items);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getPlaylistTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlistId = req.query.playlist_id;
        yield (0, axios_1.default)({
            method: 'get',
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=ES`,
            headers: spotifyGetHeaders(req)
        })
            .then(function (response) {
            // get the list of items
            const items = response.data.items;
            res.status(http_status_codes_1.StatusCodes.OK).send(items);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getTrackFeatures(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const track_ids = req.query.track_ids;
        yield (0, axios_1.default)({
            method: 'get',
            url: `https://api.spotify.com/v1/audio-features?ids=${track_ids}`,
            headers: spotifyGetHeaders(req)
        })
            .then(function (response) {
            res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function deletePlaylistItems(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlistId = req.query.playlist_id;
        const trackUris = req.body.track_uris;
        yield (0, axios_1.default)({
            method: 'delete',
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            headers: spotifyGetHeaders(req),
            data: { tracks: trackUris }
        })
            .then(function () {
            res.sendStatus(http_status_codes_1.StatusCodes.OK);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function postPlaylistItems(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlistId = req.query.playlist_id;
        const trackUris = req.body.track_uris;
        // use track uris to post items to the given playlist
        yield (0, axios_1.default)({
            method: 'post',
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            headers: spotifyGetHeaders(req),
            data: { uris: trackUris }
        })
            .then(function () {
            res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getArtistTopTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.query.id;
        yield (0, axios_1.default)({
            method: 'get',
            url: `https://api.spotify.com/v1/artists/${id}/top-tracks?market=CA`,
            headers: spotifyGetHeaders(req)
        })
            .then(function (response) {
            res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getCurrentUserProfile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, axios_1.default)({
            method: 'get',
            url: 'https://api.spotify.com/v1/me',
            headers: spotifyGetHeaders(req)
        })
            .then(function (response) {
            res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getCurrentUserSavedTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, axios_1.default)({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/tracks?limit=50',
            headers: spotifyGetHeaders(req)
        })
            .then(function (response) {
            res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function getFollowedArtists(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, axios_1.default)({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
            headers: spotifyGetHeaders(req)
        })
            .then(function (response) {
            res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
function putPlayTrack(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const device_id = req.query.device_id;
        const track_uri = req.query.track_uri;
        yield (0, axios_1.default)({
            method: 'put',
            url: `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
            data: { uris: [track_uri] },
            headers: spotifyGetHeaders(req)
        })
            .then(() => {
            res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
        })
            .catch((err) => {
            // run next to pass this error down to a middleware that will handle it
            next(err);
        });
    });
}
const spotifyCtrl = {
    getTopArtists,
    getTopTracks,
    getPlaylists,
    getPlaylistTracks,
    getTrackFeatures,
    deletePlaylistItems,
    postPlaylistItems,
    getArtistTopTracks,
    getCurrentUserProfile,
    getCurrentUserSavedTracks,
    getFollowedArtists,
    putPlayTrack
};
exports.spotifyCtrl = spotifyCtrl;
//# sourceMappingURL=spotify-controller.js.map
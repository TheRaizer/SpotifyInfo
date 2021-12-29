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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.spotifyCtrl = void 0;
var axios_1 = require("axios");
var http_status_codes_1 = require("http-status-codes");
var spotifyGetHeaders = function (req) {
    var _a;
    return {
        Authorization: 'Bearer ' + ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.access_token),
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
};
// time range can be 'short_term', 'medium_term', and 'long_term'
var getTopPromise = function (req, url) {
    return new Promise(function (resolve, reject) {
        // if no time range is given default to 'short_term'
        var timeRange = req.query.time_range === undefined ? 'short_term' : req.query.time_range;
        (0, axios_1["default"])({
            method: 'get',
            url: url + "?time_range=" + timeRange + "&limit=50",
            headers: spotifyGetHeaders(req)
        })
            .then(function (res) {
            // if the promise was succesful then resolve the top items.
            resolve(res.data.items);
        })["catch"](function (err) {
            reject(err);
        });
    });
};
function getTopArtists(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTopPromise(req, 'https://api.spotify.com/v1/me/top/artists')
                        .then(function (response) {
                        res.status(http_status_codes_1.StatusCodes.OK).send(response);
                    })["catch"](function (err) {
                        console.log('ERROR IN GET TOP ARTISTS');
                        // run next to pass this error down to a middleware that will handle it
                        next(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getTopTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTopPromise(req, 'https://api.spotify.com/v1/me/top/tracks')
                        .then(function (response) {
                        res.status(http_status_codes_1.StatusCodes.OK).send(response);
                    })["catch"](function (err) {
                        // run next to pass this error down to a middleware that will handle it
                        next(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getPlaylists(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, axios_1["default"])({
                        method: 'get',
                        url: 'https://api.spotify.com/v1/me/playlists?limit=50',
                        headers: spotifyGetHeaders(req)
                    })
                        .then(function (response) {
                        // the json is nested in a way that the below will retrieve playlists
                        res.status(http_status_codes_1.StatusCodes.OK).send(response.data.items);
                    })["catch"](function (err) {
                        // run next to pass this error down to a middleware that will handle it
                        next(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getPlaylistTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var playlistId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playlistId = req.query.playlist_id;
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'get',
                            url: "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?market=ES",
                            headers: spotifyGetHeaders(req)
                        })
                            .then(function (response) {
                            // get the list of items
                            var items = response.data.items;
                            res.status(http_status_codes_1.StatusCodes.OK).send(items);
                        })["catch"](function (err) {
                            // run next to pass this error down to a middleware that will handle it
                            next(err);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getTrackFeatures(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var track_ids;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    track_ids = req.query.track_ids;
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'get',
                            url: "https://api.spotify.com/v1/audio-features?ids=" + track_ids,
                            headers: spotifyGetHeaders(req)
                        })
                            .then(function (response) {
                            res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
                        })["catch"](function (err) {
                            // run next to pass this error down to a middleware that will handle it
                            next(err);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function deletePlaylistItems(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var playlistId, trackUris;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playlistId = req.query.playlist_id;
                    trackUris = req.body.track_uris;
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'delete',
                            url: "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
                            headers: spotifyGetHeaders(req),
                            data: { tracks: trackUris }
                        })
                            .then(function () {
                            res.sendStatus(http_status_codes_1.StatusCodes.OK);
                        })["catch"](function (err) {
                            // run next to pass this error down to a middleware that will handle it
                            next(err);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function postPlaylistItems(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var playlistId, trackUris;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playlistId = req.query.playlist_id;
                    trackUris = req.body.track_uris;
                    // use track uris to post items to the given playlist
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'post',
                            url: "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
                            headers: spotifyGetHeaders(req),
                            data: { uris: trackUris }
                        })
                            .then(function () {
                            res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
                        })["catch"](function (err) {
                            // run next to pass this error down to a middleware that will handle it
                            next(err);
                        })];
                case 1:
                    // use track uris to post items to the given playlist
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getArtistTopTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.query.id;
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'get',
                            url: "https://api.spotify.com/v1/artists/" + id + "/top-tracks?market=CA",
                            headers: spotifyGetHeaders(req)
                        })
                            .then(function (response) {
                            res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
                        })["catch"](function (err) {
                            next(err);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getCurrentUserProfile(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, axios_1["default"])({
                        method: 'get',
                        url: 'https://api.spotify.com/v1/me',
                        headers: spotifyGetHeaders(req)
                    })
                        .then(function (response) {
                        if (req.session.user !== undefined) {
                            req.session.user.id = response.data.id;
                            req.session.user.username = response.data.display_name;
                            console.log(req.session);
                        }
                        res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
                    })["catch"](function (err) {
                        next(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getCurrentUserSavedTracks(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, axios_1["default"])({
                        method: 'get',
                        url: 'https://api.spotify.com/v1/me/tracks?limit=50',
                        headers: spotifyGetHeaders(req)
                    })
                        .then(function (response) {
                        res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
                    })["catch"](function (err) {
                        next(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getFollowedArtists(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, axios_1["default"])({
                        method: 'get',
                        url: 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
                        headers: spotifyGetHeaders(req)
                    })
                        .then(function (response) {
                        res.status(http_status_codes_1.StatusCodes.OK).send(response.data);
                    })["catch"](function (err) {
                        next(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function putPlayTrack(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var device_id, track_uri;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    device_id = req.query.device_id;
                    track_uri = req.query.track_uri;
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'put',
                            url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
                            data: { uris: [track_uri] },
                            headers: spotifyGetHeaders(req)
                        })
                            .then(function () {
                            res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
                        })["catch"](function (err) {
                            next(err);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function postCreatePlaylist(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var name, description;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    name = req.query.name;
                    description = req.body.description;
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'post',
                            url: "https://api.spotify.com/v1/users/" + ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id) + "/playlists",
                            data: {
                                name: name,
                                description: description,
                                public: false
                            },
                            headers: spotifyGetHeaders(req)
                        })
                            .then(function (response) {
                            res.status(http_status_codes_1.StatusCodes.CREATED).send(response.data);
                        })["catch"](function (err) {
                            next(err);
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function postItemsToPlaylist(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var playlist_id, uris;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playlist_id = req.query.playlist_id;
                    uris = req.body.uris;
                    return [4 /*yield*/, (0, axios_1["default"])({
                            method: 'post',
                            url: "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks",
                            data: { uris: uris },
                            headers: spotifyGetHeaders(req)
                        })
                            .then(function () {
                            res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
                        })["catch"](function (err) {
                            next(err);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var spotifyCtrl = {
    getTopArtists: getTopArtists,
    getTopTracks: getTopTracks,
    getPlaylists: getPlaylists,
    getPlaylistTracks: getPlaylistTracks,
    getTrackFeatures: getTrackFeatures,
    deletePlaylistItems: deletePlaylistItems,
    postPlaylistItems: postPlaylistItems,
    getArtistTopTracks: getArtistTopTracks,
    getCurrentUserProfile: getCurrentUserProfile,
    getCurrentUserSavedTracks: getCurrentUserSavedTracks,
    getFollowedArtists: getFollowedArtists,
    putPlayTrack: putPlayTrack,
    postCreatePlaylist: postCreatePlaylist,
    postItemsToPlaylist: postItemsToPlaylist
};
exports.spotifyCtrl = spotifyCtrl;

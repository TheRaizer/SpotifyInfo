"use strict";
exports.__esModule = true;
exports.userCtrl = void 0;
var http_status_codes_1 = require("http-status-codes");
function putPlaylistResizeData(req, res) {
    var val = req.query.val;
    if (req.session.user !== undefined) {
        req.session.user.playlistResizeWidth = val;
    }
    res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
}
function getPlaylistResizeData(req, res) {
    var _a;
    res.status(http_status_codes_1.StatusCodes.OK).send((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.playlistResizeWidth);
}
function putPlaylistTextFormData(req, res) {
    var val = req.query.val;
    if (req.session.user !== undefined) {
        req.session.user.playlistIsInTextForm = val;
    }
    res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
}
function getPlaylistTextFormData(req, res) {
    var _a;
    res.status(http_status_codes_1.StatusCodes.OK).send((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.playlistIsInTextForm);
}
function putTopTracksTextFormData(req, res) {
    var val = req.query.val;
    if (req.session.user !== undefined) {
        req.session.user.topTracksIsInTextForm = val;
    }
    res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
}
function getTopTracksTextFormData(req, res) {
    var _a;
    res.status(http_status_codes_1.StatusCodes.OK).send((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.topTracksIsInTextForm);
}
function putPlayerVolumeData(req, res) {
    var val = req.query.val;
    if (req.session.user !== undefined) {
        req.session.user.playerVolume = val;
    }
    res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
}
function getPlayerVolumeData(req, res) {
    var _a;
    res.status(http_status_codes_1.StatusCodes.OK).send((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.playerVolume);
}
function putTopTracksTerm(req, res) {
    var term = req.query.term;
    if (req.session.user !== undefined) {
        req.session.user.topTracksTerm = term;
    }
    res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
}
function getTopTracksTerm(req, res) {
    var _a;
    res.status(http_status_codes_1.StatusCodes.OK).send((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.topTracksTerm);
}
function putTopArtistsTerm(req, res) {
    var term = req.query.term;
    if (req.session.user !== undefined) {
        req.session.user.topArtistsTerm = term;
    }
    res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
}
function getTopArtistsTerm(req, res) {
    var _a;
    res.status(http_status_codes_1.StatusCodes.OK).send((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.topArtistsTerm);
}
function putCurrPlaylistId(req, res) {
    var id = req.query.id;
    if (req.session.user !== undefined) {
        req.session.user.currPlaylistId = id;
    }
    res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
}
function getCurrPlaylistId(req, res) {
    var _a;
    res.status(http_status_codes_1.StatusCodes.OK).send((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.currPlaylistId);
}
function getUsername(req, res) {
    if (req.session.user !== undefined) {
        if (req.session.user.username === '') {
            res.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
        }
        else {
            res.status(http_status_codes_1.StatusCodes.OK).send(req.session.user.username);
        }
    }
    else {
        res.sendStatus(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
var userCtrl = {
    putPlaylistResizeData: putPlaylistResizeData,
    getPlaylistResizeData: getPlaylistResizeData,
    putPlaylistTextFormData: putPlaylistTextFormData,
    getPlaylistTextFormData: getPlaylistTextFormData,
    putTopTracksTextFormData: putTopTracksTextFormData,
    getTopTracksTextFormData: getTopTracksTextFormData,
    putPlayerVolumeData: putPlayerVolumeData,
    getPlayerVolumeData: getPlayerVolumeData,
    putTopTracksTerm: putTopTracksTerm,
    getTopTracksTerm: getTopTracksTerm,
    putTopArtistsTerm: putTopArtistsTerm,
    getTopArtistsTerm: getTopArtistsTerm,
    putCurrPlaylistId: putCurrPlaylistId,
    getCurrPlaylistId: getCurrPlaylistId,
    getUsername: getUsername
};
exports.userCtrl = userCtrl;

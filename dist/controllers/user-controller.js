"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCtrl = void 0;
const http_status_codes_1 = require("http-status-codes");
function putPlaylistResizeData(req, res) {
    const val = req.query.val;
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
    const val = req.query.val;
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
    const val = req.query.val;
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
    const val = req.query.val;
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
    const term = req.query.term;
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
    const term = req.query.term;
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
    const id = req.query.id;
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
const userCtrl = {
    putPlaylistResizeData,
    getPlaylistResizeData,
    putPlaylistTextFormData,
    getPlaylistTextFormData,
    putTopTracksTextFormData,
    getTopTracksTextFormData,
    putPlayerVolumeData,
    getPlayerVolumeData,
    putTopTracksTerm,
    getTopTracksTerm,
    putTopArtistsTerm,
    getTopArtistsTerm,
    putCurrPlaylistId,
    getCurrPlaylistId,
    getUsername
};
exports.userCtrl = userCtrl;
//# sourceMappingURL=user-controller.js.map
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
exports.tokenCtrl = void 0;
const qs_1 = require("qs");
const axios_1 = __importDefault(require("axios"));
const http_status_codes_1 = require("http-status-codes");
const user_1 = __importDefault(require("../user"));
function hasBeenMoreOneHour(date) {
    const HALF_HOUR = 1.8e6; // subtract for uncertainty
    const timeDiff = Date.now() - date.getTime();
    if (timeDiff >= HALF_HOUR) {
        return true;
    }
    return false;
}
const regenerateSessionWithTokens = (req, res, isRefresh, expressRes, hasTokens) => {
    const sessionData = req.session;
    // regenerate session which changes id
    req.session.regenerate((err) => {
        if (err) {
            throw new Error(err);
        }
        // once session regenerated, reassign the data
        Object.assign(req.session, sessionData);
        if (req.session.user === undefined) {
            req.session.user = new user_1.default();
        }
        req.session.user.updateDate = new Date();
        // store the tokens in refreshed session store
        req.session.user.access_token = res.data.access_token;
        if (!isRefresh) {
            req.session.user.refresh_token = res.data.refresh_token;
        }
        // if the request has data to send, send it.
        if (hasTokens) {
            expressRes.status(http_status_codes_1.StatusCodes.OK).send(hasTokens);
        }
        else {
            expressRes.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
        }
    });
};
const obtainTokensPromise = (req, isRefresh, expressRes, hasTokens) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tokenURL = 'https://accounts.spotify.com/api/token';
    const headers = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    let data;
    if (isRefresh) {
        data = {
            grant_type: 'refresh_token',
            refresh_token: (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.refresh_token,
            client_secret: process.env.CLIENT_SECRET,
            client_id: process.env.CLIENT_ID
        };
    }
    else {
        // get code from request parameter
        const authCode = req.query.code;
        data = {
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: process.env.REDIRECT_URI,
            client_secret: process.env.CLIENT_SECRET,
            client_id: process.env.CLIENT_ID
        };
    }
    const res = yield axios_1.default.post(tokenURL, (0, qs_1.stringify)(data), headers);
    regenerateSessionWithTokens(req, res, isRefresh, expressRes, hasTokens);
});
// whether the session has tokens
function hasTokens(req, res, next) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.access_token) && ((_b = req.session.user) === null || _b === void 0 ? void 0 : _b.refresh_token)) {
            // if its been more then 1 hour since this session's tokens were obtained
            if (hasBeenMoreOneHour(new Date(req.session.user.updateDate))) {
                // refresh tokens
                yield obtainTokensPromise(req, true, res, true).catch((err) => {
                    next(err);
                });
            }
            else {
                res.status(http_status_codes_1.StatusCodes.OK).send(true);
            }
        }
        else {
            res.status(http_status_codes_1.StatusCodes.OK).send(false);
        }
    });
}
function refreshTokens(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield obtainTokensPromise(req, true, res).catch((err) => {
            next(err);
        });
    });
}
function clearTokens(req, res) {
    console.log('clear tokens');
    if (req.session.user !== undefined) {
        req.session.user.access_token = '';
        req.session.user.refresh_token = '';
    }
    res.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
}
// obtains the tokens given an auth code
function obtainTokens(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield obtainTokensPromise(req, false, res).catch((err) => {
            next(err);
        });
    });
}
// gets the access token and sends it to client
function getAccessToken(req, res) {
    var _a, _b;
    if ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.access_token) {
        res.status(http_status_codes_1.StatusCodes.OK).send((_b = req.session.user) === null || _b === void 0 ? void 0 : _b.access_token);
    }
    else {
        res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send(null);
    }
}
const tokenCtrl = {
    hasTokens,
    refreshTokens,
    clearTokens,
    obtainTokens,
    getAccessToken
};
exports.tokenCtrl = tokenCtrl;
//# sourceMappingURL=token-controller.js.map
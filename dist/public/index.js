"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const manage_tokens_1 = require("./manage-tokens");
const HALF_HOUR = 1.8e6; /* 30 min in ms */
// if the user stays on the same page for 30 min refresh the token.
// only refresh on home page as the web player will refresh token on other pages.
const startRefreshInterval = () => {
    console.log('start interval refresh');
    setInterval(() => {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putRefreshAccessToken));
        console.log('refresh async');
    }, HALF_HOUR);
};
function generateCustomLoginButton() {
    // Create anchor element.
    const a = document.createElement('a');
    a.href = config_1.config.URLs.auth;
    a.classList.add(config_1.config.CSS.CLASSES.glow);
    // Create the text node for anchor element.
    const link = document.createTextNode('Login To Spotify');
    // Append the text node to anchor element.
    a.appendChild(link);
    // clear current tokens when clicked
    a.addEventListener('click', () => {
        var _a;
        (_a = a === null || a === void 0 ? void 0 : a.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(a);
    });
    const parentEl = document.getElementById(config_1.config.CSS.IDs.homeHeader);
    // Append the anchor element to the parent.
    parentEl === null || parentEl === void 0 ? void 0 : parentEl.appendChild(a);
}
(function () {
    console.log('Interesting');
    (0, config_1.promiseHandler)((0, manage_tokens_1.checkIfHasTokens)(), (hasToken) => {
        console.log('redirect uri: ' + config_1.redirectUri);
        if (!hasToken) {
            (0, config_1.promiseHandler)((0, manage_tokens_1.getTokens)(), (obtainedToken) => {
                (0, manage_tokens_1.onSuccessfulTokenCall)(obtainedToken, () => {
                    startRefreshInterval();
                }, () => {
                    generateCustomLoginButton();
                }, false);
            });
        }
        else {
            startRefreshInterval();
            (0, manage_tokens_1.onSuccessfulTokenCall)(true);
        }
    });
})();
window.onload = function () {
    document.body.className += 'loaded';
    config_1.animationControl.addClassOnInterval('.feature-area', 'appear', 200);
};
//# sourceMappingURL=index.js.map
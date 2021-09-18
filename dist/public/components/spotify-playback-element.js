"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class SpotifyPlaybackElement {
    constructor() {
        this.title = null;
        this.progress = null;
        this.currTime = null;
        this.duration = null;
        this.playPause = null;
    }
    getWebPlayerEls() {
        var _a, _b, _c, _d, _e, _f;
        const webPlayerEl = (_a = document.getElementById(config_1.config.CSS.IDs.webPlayer)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('web player element does not exist');
        const playTimeBar = (_b = document.getElementById(config_1.config.CSS.IDs.playTimeBar)) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)('play time bar element does not exist');
        this.progress = (_c = webPlayerEl.getElementsByClassName(config_1.config.CSS.CLASSES.progress)[0]) !== null && _c !== void 0 ? _c : (0, config_1.throwExpression)('web player progress bar does not exist');
        this.title = (_d = webPlayerEl.getElementsByTagName('h4')[0]) !== null && _d !== void 0 ? _d : (0, config_1.throwExpression)('web player title element does not exist');
        // get playtime bar elements
        this.currTime = (_e = playTimeBar.getElementsByTagName('p')[0]) !== null && _e !== void 0 ? _e : (0, config_1.throwExpression)('web player current time element does not exist');
        this.duration = (_f = playTimeBar.getElementsByTagName('p')[1]) !== null && _f !== void 0 ? _f : (0, config_1.throwExpression)('web player duration time element does not exist');
        this.playPause = document.getElementById(config_1.config.CSS.IDs.webPlayerPlayPause);
    }
    appendWebPlayerHtml(playPrevFunc, pauseFunc, playNextFunc) {
        const html = `
    <article id="${config_1.config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap}">Title</h4>
      <div>
        <button id="${config_1.config.CSS.IDs.playPrev}"><img src="${config_1.config.PATHS.playPrev}" alt="previous"/></button>
        <button id="${config_1.config.CSS.IDs.webPlayerPlayPause}"><img src="${config_1.config.PATHS.playBlackIcon}" alt="play/pause"/></button>
        <button id="${config_1.config.CSS.IDs.playNext}"><img src="${config_1.config.PATHS.playNext}" alt="next"/></button>
      </div>
      <div id="${config_1.config.CSS.IDs.playTimeBar}">
        <p>0:00</p>
        <div class="${config_1.config.CSS.CLASSES.progressBar}">
          <div class="${config_1.config.CSS.CLASSES.progress}"></div>
        </div>
        <p>0:00</p>
      </div>
    </article>
    `;
        const webPlayerEl = (0, config_1.htmlToEl)(html);
        document.body.append(webPlayerEl);
        this.assignEventListeners(playPrevFunc, pauseFunc, playNextFunc);
        this.getWebPlayerEls();
    }
    assignEventListeners(playPrevFunc, pauseFunc, playNextFunc) {
        const playPrev = document.getElementById(config_1.config.CSS.IDs.playPrev);
        const playPause = document.getElementById(config_1.config.CSS.IDs.webPlayerPlayPause);
        const playNext = document.getElementById(config_1.config.CSS.IDs.playNext);
        playPrev === null || playPrev === void 0 ? void 0 : playPrev.addEventListener('click', playPrevFunc);
        playPause === null || playPause === void 0 ? void 0 : playPause.addEventListener('click', pauseFunc);
        playNext === null || playNext === void 0 ? void 0 : playNext.addEventListener('click', playNextFunc);
    }
}
exports.default = SpotifyPlaybackElement;
//# sourceMappingURL=spotify-playback-element.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class Slider {
    constructor() {
        this.innerSliderEl = null;
        this._sliderEl = null;
        this.drag = false;
    }
    set sliderEl(el) {
        this._sliderEl = el;
        this.innerSliderEl = this._sliderEl.getElementsByClassName(config_1.config.CSS.CLASSES.progress)[0];
    }
    get sliderEl() {
        return this._sliderEl;
    }
}
class SpotifyPlaybackElement {
    constructor() {
        this.title = null;
        this.currTime = null;
        this.duration = null;
        this.playPause = null;
        this.volume = new Slider();
        this.songProgress = new Slider();
    }
    /**
     * Append the web player element to the DOM along with the event listeners for the buttons.
     *
     * @param playPrevFunc the function to run when the play previous button is pressed on the web player.
     * @param pauseFunc the function to run when the pause/play button is pressed on the web player.
     * @param playNextFunc the function to run when the play next button is pressed on the web player.
     */
    appendWebPlayerHtml(playPrevFunc, pauseFunc, playNextFunc, volumeChangeFunc) {
        const html = `
    <article id="${config_1.config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap}">Title</h4>
      <div>
        <article>
          <button id="${config_1.config.CSS.IDs.playPrev}"><img src="${config_1.config.PATHS.playPrev}" alt="previous"/></button>
          <button id="${config_1.config.CSS.IDs.webPlayerPlayPause}"><img src="${config_1.config.PATHS.playBlackIcon}" alt="play/pause"/></button>
          <button id="${config_1.config.CSS.IDs.playNext}"><img src="${config_1.config.PATHS.playNext}" alt="next"/></button>
        </article>
        <div id="${config_1.config.CSS.IDs.webPlayerVolume}">
          <div class="${config_1.config.CSS.CLASSES.progress}"></div>
        </div>
      </div>
      <div id="${config_1.config.CSS.IDs.playTimeBar}">
        <p>0:00</p>
        <div id="${config_1.config.CSS.IDs.webPlayerProgress}">
          <div class="${config_1.config.CSS.CLASSES.progress}"></div>
        </div>
        <p>0:00</p>
      </div>
    </article>
    `;
        const webPlayerEl = (0, config_1.htmlToEl)(html);
        document.body.append(webPlayerEl);
        this.getWebPlayerEls();
        this.assignEventListeners(playPrevFunc, pauseFunc, playNextFunc, volumeChangeFunc);
    }
    /**
     * Updates the web player element.
     *
     * @param percentDone the percent of the song that has been completed
     * @param position the current position in ms that has been completed
     */
    updateElement(percentDone, position) {
        if (position !== 0) {
            this.songProgress.innerSliderEl.style.width = `${percentDone}%`;
            if (this.currTime == null) {
                throw new Error('Current time element is null');
            }
            this.currTime.textContent =
                (0, config_1.millisToMinutesAndSeconds)(position);
        }
    }
    updateBar(bar, y, vol, callback, fromBottom = true) {
        let percentage;
        // if only volume have specificed
        // then direct update volume
        if (vol) {
            percentage = vol * 100;
        }
        else {
            if (fromBottom) {
                const position = y - bar.offsetTop;
                percentage = 100 * position / bar.clientHeight;
            }
            else {
                const position = y - bar.offsetLeft;
                percentage = 100 * position / bar.clientWidth;
            }
        }
        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
        }
        callback(percentage);
    }
    ;
    /**
     * Retrieve the web player elements once the web player element has been appeneded to the DOM.
     */
    getWebPlayerEls() {
        var _a, _b, _c, _d, _e, _f;
        const webPlayerEl = (_a = document.getElementById(config_1.config.CSS.IDs.webPlayer)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('web player element does not exist');
        const playTimeBar = (_b = document.getElementById(config_1.config.CSS.IDs.playTimeBar)) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)('play time bar element does not exist');
        this.songProgress.sliderEl = (_c = document.getElementById(config_1.config.CSS.IDs.webPlayerProgress)) !== null && _c !== void 0 ? _c : (0, config_1.throwExpression)('web player progress bar does not exist');
        this.title = (_d = webPlayerEl.getElementsByTagName('h4')[0]) !== null && _d !== void 0 ? _d : (0, config_1.throwExpression)('web player title element does not exist');
        // get playtime bar elements
        this.currTime = (_e = playTimeBar.getElementsByTagName('p')[0]) !== null && _e !== void 0 ? _e : (0, config_1.throwExpression)('web player current time element does not exist');
        this.duration = (_f = playTimeBar.getElementsByTagName('p')[1]) !== null && _f !== void 0 ? _f : (0, config_1.throwExpression)('web player duration time element does not exist');
        this.playPause = document.getElementById(config_1.config.CSS.IDs.webPlayerPlayPause);
        this.volume.sliderEl = document.getElementById(config_1.config.CSS.IDs.webPlayerVolume);
    }
    /**
     * Assigns the events to run on each button press that exists on the web player element.
     *
     * @param playPrevFunc function to run when play previous button is pressed
     * @param pauseFunc function to run when play/pause button is pressed
     * @param playNextFunc function to run when play next button is pressed
     */
    assignEventListeners(playPrevFunc, pauseFunc, playNextFunc, volumeChangeFunc) {
        var _a, _b, _c;
        const playPrev = document.getElementById(config_1.config.CSS.IDs.playPrev);
        const playNext = document.getElementById(config_1.config.CSS.IDs.playNext);
        playPrev === null || playPrev === void 0 ? void 0 : playPrev.addEventListener('click', playPrevFunc);
        playNext === null || playNext === void 0 ? void 0 : playNext.addEventListener('click', playNextFunc);
        (_a = this.playPause) === null || _a === void 0 ? void 0 : _a.addEventListener('click', pauseFunc);
        (_b = this.volume.innerSliderEl) === null || _b === void 0 ? void 0 : _b.addEventListener('mousedown', (evt) => {
            this.volume.drag = true;
            this.updateBar(this.volume.sliderEl, evt.clientX, null, volumeChangeFunc);
        });
        (_c = this.volume.innerSliderEl) === null || _c === void 0 ? void 0 : _c.addEventListener('mousemove', (evt) => {
            if (this.volume.drag) {
                this.updateBar(this.volume.sliderEl, evt.clientX, null, volumeChangeFunc);
            }
        });
        document.addEventListener('mouseup', (ev) => {
            this.volume.drag = false;
            this.songProgress.drag = false;
        });
    }
}
exports.default = SpotifyPlaybackElement;
//# sourceMappingURL=spotify-playback-element.js.map
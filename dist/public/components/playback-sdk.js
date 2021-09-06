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
exports.checkIfIsPlayingElAfterRerender = exports.isSamePlayingURI = exports.spotifyPlayback = void 0;
const config_js_1 = require("../config.js");
const track_play_args_js_1 = __importDefault(require("./pubsub/event-args/track-play-args.js"));
class SpotifyPlayBack {
    constructor() {
        this.player = null;
        this.device_id = "";
        this.selPlaying = {
            element: null,
            track_uri: "",
            trackDataNode: null,
        };
        this.getStateInterval = null;
        this.webPlayerEls = {
            title: null,
            progress: null,
            currTime: null,
            duration: null,
        };
        this.playerIsReady = false;
        (0, config_js_1.promiseHandler)(axios.get(config_js_1.config.URLs.getAccessToken), (res) => {
            const NO_CONTENT = 204;
            if (res.status == NO_CONTENT) {
                window.onSpotifyWebPlaybackSDKReady = () => { };
            }
            else {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    // if getting token was succesful create spotify player
                    this.player = new Spotify.Player({
                        name: "Spotify Info Web Player",
                        getOAuthToken: (cb) => {
                            // give the token to callback
                            cb(res.data);
                        },
                        volume: 0.1,
                    });
                    // Error handling
                    this.player.addListener("initialization_error", ({ message }) => {
                        console.error(message);
                    });
                    this.player.addListener("authentication_error", ({ message }) => {
                        console.error(message);
                        console.log("playback couldnt start");
                    });
                    this.player.addListener("account_error", ({ message }) => {
                        console.error(message);
                    });
                    this.player.addListener("playback_error", ({ message }) => {
                        console.error(message);
                    });
                    // Playback status updates
                    this.player.addListener("player_state_changed", (state) => { });
                    // Ready
                    this.player.addListener("ready", ({ device_id }) => {
                        console.log("Ready with Device ID", device_id);
                        this.device_id = device_id;
                        this.appendWebPlayerHtml();
                        this.playerIsReady = true;
                    });
                    // Not Ready
                    this.player.addListener("not_ready", ({ device_id }) => {
                        console.log("Device ID has gone offline", device_id);
                    });
                    // Connect to the player!
                    this.player.connect();
                };
            }
        });
    }
    getWebPlayerEls() {
        const webPlayerEl = document.getElementById(config_js_1.config.CSS.IDs.webPlayer);
        this.webPlayerEls.progress = webPlayerEl.getElementsByClassName(config_js_1.config.CSS.CLASSES.progress)[0];
        this.webPlayerEls.title = webPlayerEl.getElementsByTagName("h4")[0];
        // get playtime bar elements
        const playTimeBar = document.getElementById(config_js_1.config.CSS.IDs.playTimeBar);
        this.webPlayerEls.currTime = playTimeBar.getElementsByTagName("p")[0];
        this.webPlayerEls.duration = playTimeBar.getElementsByTagName("p")[1];
    }
    appendWebPlayerHtml() {
        let html = `
    <article id="${config_js_1.config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config_js_1.config.CSS.CLASSES.ellipsisWrap}">Title</h4>
        <div id="${config_js_1.config.CSS.IDs.playTimeBar}">
          <p>0:00</p>
          <div class="${config_js_1.config.CSS.CLASSES.progressBar}">
            <div class="${config_js_1.config.CSS.CLASSES.progress}"></div>
          </div>
          <p>0:00</p>
        </div>
    </article>
    `;
        const webPlayerEl = (0, config_js_1.htmlToEl)(html);
        document.body.append(webPlayerEl);
        this.getWebPlayerEls();
    }
    updateWebPlayer(percentDone, position) {
        if (position != 0) {
            this.webPlayerEls.progress.style.width = `${percentDone}%`;
            this.webPlayerEls.currTime.textContent =
                (0, config_js_1.millisToMinutesAndSeconds)(position);
        }
    }
    /** Sets an interval that obtains the state of the player every second.
     * Should only be called when a song is playing.
     */
    setGetStateInterval() {
        var durationMinSec = null;
        if (this.getStateInterval) {
            clearInterval(this.getStateInterval);
        }
        // set the interval to run every second and obtain the state
        this.getStateInterval = setInterval(() => {
            this.player.getCurrentState().then((state) => {
                if (!state) {
                    console.error("User is not playing music through the Web Playback SDK");
                    return;
                }
                let { position, duration } = state;
                // if there isnt a duration set for this song set it.
                if (durationMinSec == null) {
                    durationMinSec = (0, config_js_1.millisToMinutesAndSeconds)(duration);
                    this.webPlayerEls.duration.textContent = durationMinSec;
                }
                const percentDone = (position / duration) * 100;
                // the position gets set to 0 when the song is finished
                if (position == 0) {
                    this.selPlaying.element.classList.remove(config_js_1.config.CSS.CLASSES.selected);
                    this.selPlaying = { element: null, track_uri: "" };
                    this.webPlayerEls.progress.style.width = "100%";
                    clearInterval(this.getStateInterval);
                }
                else {
                    // if the position isnt 0 update the web player elements
                    this.updateWebPlayer(percentDone, position);
                }
            });
        }, 1000);
    }
    /** Select a certain play/pause element and play the given track uri
     * and unselect the previous one then pause the previous track_uri.
     *
     * @param {TrackPlayEventArg} eventArg - a class that contains the current, next and previous tracks to play
     */
    setSelPlayingEl(eventArg) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(eventArg.trackNode);
            // if the player isn't ready we cannot continue.
            if (!this.playerIsReady) {
                return;
            }
            if (this.selPlaying.element != null) {
                // if there already is a selected element unselect it
                this.selPlaying.element.classList.remove(config_js_1.config.CSS.CLASSES.selected);
                yield this.pause();
                clearInterval(this.getStateInterval);
                // if the selected el is the same as the prev then null it and return so we do not end up reselecting it right after deselecting.
                if (this.selPlaying.element == eventArg.currTrack.selEl) {
                    this.selPlaying.element = null;
                    return;
                }
            }
            // prev track uri is the same then resume the song instead of replaying it.
            if (this.selPlaying.track_uri == eventArg.currTrack.uri) {
                yield this.startTrack(eventArg.currTrack.selEl, eventArg.currTrack.uri, () => this.resume(), eventArg.currTrack.title, eventArg.trackNode);
                return;
            }
            yield this.startTrack(eventArg.currTrack.selEl, eventArg.currTrack.uri, () => __awaiter(this, void 0, void 0, function* () { return this.play(this.selPlaying.track_uri); }), eventArg.currTrack.title, eventArg.trackNode);
        });
    }
    startTrack(selEl, track_uri, playingAsyncFunc, title, trackNode) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Start");
            this.selPlaying.trackDataNode = trackNode;
            this.selPlaying.element = selEl;
            this.selPlaying.element.classList.add(config_js_1.config.CSS.CLASSES.selected);
            this.selPlaying.track_uri = track_uri;
            this.webPlayerEls.title.textContent = title;
            yield playingAsyncFunc();
            this.setGetStateInterval();
        });
    }
    /** Plays a track through this device.
     *
     * @param {String} track_uri - the track uri to play
     * @returns whether or not the track has been played succesfully.
     */
    play(track_uri) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, config_js_1.promiseHandler)(axios.put(config_js_1.config.URLs.putPlayTrack(this.device_id, track_uri)));
            console.log("play");
        });
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.player.resume();
            console.log("resume");
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.player.pause();
            console.log("paused");
        });
    }
}
exports.spotifyPlayback = new SpotifyPlayBack();
function isSamePlayingURI(uri) {
    return (uri == exports.spotifyPlayback.selPlaying.track_uri &&
        exports.spotifyPlayback.selPlaying.element != null);
}
exports.isSamePlayingURI = isSamePlayingURI;
function checkIfIsPlayingElAfterRerender(uri, selEl, trackDataNode) {
    // Note: if its a rerender order may have changed and so have the next and previous tracks
    if (isSamePlayingURI(uri)) {
        // This element was playing before rerendering so set it to be the currently playing one again
        exports.spotifyPlayback.selPlaying.element = selEl;
        exports.spotifyPlayback.selPlaying.trackDataNode = trackDataNode;
    }
}
exports.checkIfIsPlayingElAfterRerender = checkIfIsPlayingElAfterRerender;
// subscribe the setPlaying element event
window.eventAggregator.subscribe(track_play_args_js_1.default.name, (eventArg) => exports.spotifyPlayback.setSelPlayingEl(eventArg));
(0, config_js_1.addResizeDrag)();

import {
  config,
  promiseHandler,
  htmlToEl,
  addResizeDrag,
  millisToMinutesAndSeconds,
} from "../config.js";

import TrackPlayEventArg from "./pubsub/event-args/track-play-args.js";

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

    promiseHandler(axios.get(config.URLs.getAccessToken), (res) => {
      const NO_CONTENT = 204;
      if (res.status == NO_CONTENT) {
        window.onSpotifyWebPlaybackSDKReady = () => {};
      } else {
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
          this.player.addListener("player_state_changed", (state) => {});

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
    const webPlayerEl = document.getElementById(config.CSS.IDs.webPlayer);
    this.webPlayerEls.progress = webPlayerEl.getElementsByClassName(
      config.CSS.CLASSES.progress
    )[0];
    this.webPlayerEls.title = webPlayerEl.getElementsByTagName("h4")[0];

    // get playtime bar elements
    const playTimeBar = document.getElementById(config.CSS.IDs.playTimeBar);
    this.webPlayerEls.currTime = playTimeBar.getElementsByTagName("p")[0];
    this.webPlayerEls.duration = playTimeBar.getElementsByTagName("p")[1];
  }

  appendWebPlayerHtml() {
    let html = `
    <article id="${config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config.CSS.CLASSES.ellipsisWrap}">Title</h4>
        <div id="${config.CSS.IDs.playTimeBar}">
          <p>0:00</p>
          <div class="${config.CSS.CLASSES.progressBar}">
            <div class="${config.CSS.CLASSES.progress}"></div>
          </div>
          <p>0:00</p>
        </div>
    </article>
    `;

    const webPlayerEl = htmlToEl(html);
    document.body.append(webPlayerEl);
    this.getWebPlayerEls();
  }

  updateWebPlayer(percentDone, position) {
    if (position != 0) {
      this.webPlayerEls.progress.style.width = `${percentDone}%`;
      this.webPlayerEls.currTime.textContent =
        millisToMinutesAndSeconds(position);
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
          console.error(
            "User is not playing music through the Web Playback SDK"
          );
          return;
        }
        let { position, duration } = state;

        // if there isnt a duration set for this song set it.
        if (durationMinSec == null) {
          durationMinSec = millisToMinutesAndSeconds(duration);
          this.webPlayerEls.duration.textContent = durationMinSec;
        }

        const percentDone = (position / duration) * 100;

        // the position gets set to 0 when the song is finished
        if (position == 0) {
          this.selPlaying.element.classList.remove(config.CSS.CLASSES.selected);
          this.selPlaying = { element: null, track_uri: "" };

          this.webPlayerEls.progress.style.width = "100%";
          clearInterval(this.getStateInterval);
        } else {
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
  async setSelPlayingEl(eventArg) {
    const { selEl, track_uri, trackTitle } = eventArg.currTrack;
    console.log(eventArg.trackDataNode);
    // if the player isn't ready we cannot continue.
    if (!this.playerIsReady) {
      return;
    }

    if (this.selPlaying.element != null) {
      // if there already is a selected element unselect it
      this.selPlaying.element.classList.remove(config.CSS.CLASSES.selected);

      await this.pause();
      clearInterval(this.getStateInterval);
      // if the selected el is the same as the prev then null it and return so we do not end up reselecting it right after deselecting.
      if (this.selPlaying.element == selEl) {
        this.selPlaying.element = null;
        return;
      }
    }

    // prev track uri is the same then resume the song instead of replaying it.
    if (this.selPlaying.track_uri == track_uri) {
      await this.startTrack(
        selEl,
        track_uri,
        () => this.resume(),
        trackTitle,
        eventArg.trackDataNode
      );
      return;
    }

    await this.startTrack(
      selEl,
      track_uri,
      async () => this.play(this.selPlaying.track_uri),
      trackTitle,
      eventArg.trackDataNode
    );
  }

  async startTrack(selEl, track_uri, playingAsyncFunc, title, trackDataNode) {
    console.log("Start");
    this.selPlaying.trackDataNode = trackDataNode;
    this.selPlaying.element = selEl;
    this.selPlaying.element.classList.add(config.CSS.CLASSES.selected);
    this.selPlaying.track_uri = track_uri;

    this.webPlayerEls.title.textContent = title;

    await playingAsyncFunc();
    this.setGetStateInterval();
  }
  /** Plays a track through this device.
   *
   * @param {String} track_uri - the track uri to play
   * @returns whether or not the track has been played succesfully.
   */
  async play(track_uri) {
    await promiseHandler(
      axios.put(config.URLs.putPlayTrack(this.device_id, track_uri))
    );
    console.log("play");
  }
  async resume() {
    await this.player.resume();
    console.log("resume");
  }
  async pause() {
    await this.player.pause();
    console.log("paused");
  }
}

export const spotifyPlayback = new SpotifyPlayBack();

export function isSamePlayingURI(uri) {
  return (
    uri == spotifyPlayback.selPlaying.track_uri &&
    spotifyPlayback.selPlaying.element != null
  );
}

export function checkIfIsPlayingElAfterRerender(uri, selEl, trackDataNode) {
  // Note: if its a rerender order may have changed and so have the next and previous tracks

  if (isSamePlayingURI(uri)) {
    // This element was playing before rerendering so set it to be the currently playing one again
    spotifyPlayback.selPlaying.element = selEl;
    spotifyPlayback.selPlaying.trackDataNode = trackDataNode;
  }
}

// subscribe the setPlaying element event
window.eventAggregator.subscribe(TrackPlayEventArg.name, (eventArg) =>
  spotifyPlayback.setSelPlayingEl(eventArg)
);
addResizeDrag();

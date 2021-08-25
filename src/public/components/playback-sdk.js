import { config, promiseHandler } from "../config.js";

class SpotifyPlayBack {
  constructor() {
    this.player = null;
    this.device_id = "";
    this.selPlaying = { element: null, track_uri: "" };
    this.getStateInterval = null;

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

            // TEST WHICH PLAYS A SONG
            // this.play("spotify:track:7FL5iSLdKcersBgDiwijis", this.device_id);
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

  setGetStateInterval() {
    if (this.getStateInterval) {
      clearInterval(this.getStateInterval);
    }
    this.getStateInterval = setInterval(() => {
      this.player.getCurrentState().then((state) => {
        if (!state) {
          console.error(
            "User is not playing music through the Web Playback SDK"
          );
          return;
        }
        let { position, duration } = state;
        console.log(position);
        // the position gets set to 0 when the song is finished
        if (position == 0) {
          this.selPlaying.element.classList.remove(config.CSS.CLASSES.selected);
          this.selPlaying = { element: null, track_uri: "" };
          clearInterval(this.getStateInterval);
        }
      });
    }, 1000);
  }

  /** Select a certain play/pause element and play the given track uri
   * and unselect the previous one then pause the previous track_uri.
   *
   * @param {HTMLElement} selEl - the element to select.
   * @param {String} track_uri - track uri to play.
   * @returns
   */
  async setSelPlayingEl(selEl, track_uri) {
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
      await this.startTrack(selEl, track_uri, () => this.resume());
      return;
    }

    await this.startTrack(selEl, track_uri, async () =>
      this.play(this.selPlaying.track_uri)
    );
  }

  async startTrack(selEl, track_uri, playingAsyncFunc) {
    this.select(selEl, track_uri);
    await playingAsyncFunc();
    this.setGetStateInterval();
  }
  select(selEl, track_uri) {
    this.selPlaying.element = selEl;
    this.selPlaying.element.classList.add(config.CSS.CLASSES.selected);
    this.selPlaying.track_uri = track_uri;
  }
  /** Plays a track through this device.
   *
   * @param {String} track_uri - the track uri to play
   * @returns whether or not the track has been played succesfully.
   */
  async play(track_uri) {
    if (this.hasLoadedPlayer()) {
      await promiseHandler(
        axios.put(config.URLs.putPlayTrack(this.device_id, track_uri))
      );
      console.log("play");
      return true;
    } else {
      return false;
    }
  }
  async resume() {
    await this.player.resume();
    console.log("resume");
  }
  async pause() {
    await this.player.pause();
    console.log("paused");
  }
  hasLoadedPlayer() {
    return this.player != null && this.device_id != "";
  }
}

export const spotifyPlayback = new SpotifyPlayBack();

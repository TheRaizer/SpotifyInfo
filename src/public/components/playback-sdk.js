import { config, promiseHandler } from "../config.js";

class SpotifyPlayBack {
  constructor() {
    this.player = null;
    this.device_id = "";
    this.selPlaying = { element: null, track_uri: "" };

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
            volume: 0.3,
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
          this.player.addListener("player_state_changed", (state) => {
            console.log(state);
          });

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

      await this.pause(this.selPlaying.track_uri);

      // if the selected el is the same as the prev then return so we do not end up reselecting it.
      if (this.selPlaying.element == selEl) {
        this.selPlaying.element = null;
        this.selPlaying.track_uri = "";
        return;
      }
    }

    this.selPlaying.element = selEl;
    this.selPlaying.element.classList.add(config.CSS.CLASSES.selected);
    this.selPlaying.track_uri = track_uri;

    await this.play(this.selPlaying.track_uri);
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
      return true;
    } else {
      return false;
    }
  }
  async pause(track_uri) {
    console.log("pause");
  }
  hasLoadedPlayer() {
    return this.player != null && this.device_id != "";
  }
}

export const spotifyPlayback = new SpotifyPlayBack();

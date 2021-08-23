import { config, promiseHandler } from "../config.js";

class SpotifyPlayBack {
  constructor() {
    this.play = null;
    this.player = null;

    window.onSpotifyWebPlaybackSDKReady = () => {
      promiseHandler(axios.get(config.URLs.getAccessToken), (res) => {
        // if getting token was succesful create spotify player

        this.player = new Spotify.Player({
          name: "Web Playback SDK Quick Start Player",
          getOAuthToken: (cb) => {
            // give the token to callback
            cb(res.data);
          },
        });

        // Error handling
        this.player.addListener("initialization_error", ({ message }) => {
          console.error(message);
        });
        this.player.addListener("authentication_error", ({ message }) => {
          console.error(message);
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
        });

        // Not Ready
        this.player.addListener("not_ready", ({ device_id }) => {
          console.log("Device ID has gone offline", device_id);
        });

        // Connect to the player!
        this.player.connect();
      });
    };
  }
}

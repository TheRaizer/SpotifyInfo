import { config, promiseHandler } from "../config.js";

class SpotifyPlayBack {
  constructor() {
    this.player = null;
    this.device_id = "";
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

  play(track_uri, device_id) {
    promiseHandler(axios.put(config.URLs.putPlayTrack(device_id, track_uri)));
  }
}

export const spotifyPlayback = new SpotifyPlayBack();

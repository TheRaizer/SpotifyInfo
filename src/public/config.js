const authEndpoint = "https://accounts.spotify.com/authorize";
// Replace with your app's client ID, redirect URI and desired scopes
const redirectUri = "http://localhost:3000";
const clientId = "434f5e9f442a4e4586e089a33f65c857";
const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];
export const config = {
  CSS: {
    IDs: {
      getTokenLoadingSpinner: "get-token-loading-spinner",
      playlists: "playlists",
      tracks: "tracks",
      playlistPrefix: "playlist-",
      trackPrefix: "track-",
      loginButton: "spotify-login",
      spotifyContainer: "spotify-container",
      infoContainer: "info-container",
      allowAccessHeader: "allow-access-header",
      songList: "song-list",
      expandedPlaylistPrefix: "expanded-playlist-",
    },
    CLASSES: {
      playlist: "playlist",
      track: "track",
      infoLoadingSpinners: "info-loading-spinner",
      appear: "appear",
      hide: "hidden",
      selected: "selected",
      card: "card",
    },
    ATTRIBUTES: {
      dataClassToAnimate: "data-class-to-animate",
    },
  },
  URLs: {
    auth: `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      "%20"
    )}&response_type=code&show_dialog=true`,
    getHasTokens: "/tokens/has-tokens",
    getTokensPrefix: "/tokens/get-tokens?code=",
    getTopArtists: "/spotify/get-top-artists?time_range=medium_term",
    getTopTracks: "/spotify/get-top-tracks?time_range=medium_term",
    getPlaylists: "/spotify/get-playlists",
    getPlaylistTracks: "/spotify/get-playlist-tracks?playlist_id=",
    postClearTokens: "/tokens/clear-tokens",
  },
};

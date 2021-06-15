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
      playlistCardsContainer: "playlist-cards-container",
      trackCardsContainer: "track-cards-container",
      playlistPrefix: "playlist-",
      trackPrefix: "track-",
      spotifyContainer: "spotify-container",
      infoContainer: "info-container",
      allowAccessHeader: "allow-access-header",
      expandedPlaylistMods: "expanded-playlist-mods",
      playlistMods: "playlist-mods",
    },
    CLASSES: {
      glow: "glow",
      playlist: "playlist",
      track: "track",
      playlistTrack: "playlist-track",
      infoLoadingSpinners: "info-loading-spinner",
      appear: "appear",
      hide: "hidden",
      selected: "selected",
      card: "card",
      playlistSearch: "playlist-search",
      ellipsisWrap: "ellipsis-wrap",
      name: "name",
      playlistOrder: "playlist-order",
    },
    ATTRIBUTES: {
      elementsToAnimate: "elements-to-animate",
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
    deletePlaylistTracks: "/spotify/delete-playlist-items?playlist_id=",
  },
};

export function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

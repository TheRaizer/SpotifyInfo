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
      removeEarlyAdded: "remove-early-added",
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
      tracksData: "tracks-data",
      tracksChart: "tracks-chart",
      tracksTermSelections: "tracks-term-selections",
      featureSelections: "feature-selections",
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
      chartInfo: "chart-info",
      featureDefinition: "feature-definition",
      albumName: "album-name",
      releaseDate: "release-date",
      popularityIdx: "popularity-index",
    },
    ATTRIBUTES: {
      elementsToAnimate: "data-elements-to-animate",
      dataSelection: "data-selection",
    },
  },
  URLs: {
    auth: `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      "%20"
    )}&response_type=code&show_dialog=true`,
    getHasTokens: "/tokens/has-tokens",
    getTokensPrefix: "/tokens/get-tokens?code=",
    getTopArtists: "/spotify/get-top-artists?time_range=medium_term",
    getTopTracks: "/spotify/get-top-tracks?time_range=",
    getPlaylists: "/spotify/get-playlists",
    getPlaylistTracks: "/spotify/get-playlist-tracks?playlist_id=",
    postClearTokens: "/tokens/clear-tokens",
    deletePlaylistTracks: "/spotify/delete-playlist-items?playlist_id=",
    postPlaylistTracks: "/spotify/post-playlist-items?playlist_id=",
    getTrackFeatures: "/spotify/get-track-features?track_id=",
  },
};

export function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
export function htmlToEl(html) {
  let temp = document.createElement("template");
  html = html.trim(); // Never return a space text node as a result
  temp.innerHTML = html;
  return temp.content.firstChild;
}

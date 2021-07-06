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
      playlistsSection: "playlists-section",
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
      flipCardInner: "flip-card-inner",
      flipCardFront: "flip-card-front",
      flipCardBack: "flip-card-back",
      flipCard: "flip-card",
      resizeContainer: "resize-container",
      scrollLeft: "scroll-left",
      scrollingText: "scrolling-text",
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
    postRefreshAccessToken: "/tokens/refresh-token",
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

export async function promiseHandler(
  promise,
  onSuccesful = (res) => {},
  onFailure = (res) => {}
) {
  try {
    const res = await promise;
    onSuccesful(res);
    return { res: res, err: null };
  } catch (err) {
    console.error(err);
    onFailure(err);
    return { res: null, err: err };
  }
}

/** Filters 'li' elements to either be hidden or not depending on if
 * they contain some given input text.
 *
 * @param {HTML} ul - unordered list element that contains the 'li' to be filtered
 * @param {HTML} input - input element whose value will be used to filter
 * @param {String} stdDisplay - the standard display the 'li' should have when not 'none'
 */
export function searchUl(ul, input, stdDisplay = "grid") {
  let liEls = ul.getElementsByTagName("li");
  let filter = input.value.toUpperCase();

  for (let i = 0; i < liEls.length; i++) {
    // get the name child el in the li el
    let name = liEls[i].getElementsByClassName(config.CSS.CLASSES.name)[0];
    let nameTxt = name.textContent || name.innerText;

    if (nameTxt.toUpperCase().indexOf(filter) > -1) {
      // show li's whose name contains the the entered string
      liEls[i].style.display = stdDisplay;
    } else {
      // otherwise hide it
      liEls[i].style.display = "none";
    }
  }
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export function getTextWidth(text, font) {
  // re-use canvas object for better performance
  var canvas =
    getTextWidth.canvas ||
    (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
}

export function isEllipsisActive(el) {
  return el.offsetWidth < el.scrollWidth;
}

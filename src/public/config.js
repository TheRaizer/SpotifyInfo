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
      undo: "undo",
      redo: "redo",
      modsOpener: "mods-opener",
      featDef: "feat-definition",
      featAverage: "feat-average",
      rank: "rank",
      viewAllTopTracks: "view-all-top-tracks",
      emojis: "emojis",
      artistCardsContainer: "artist-cards-container",
      artistPrefix: "artist-",
      initialCard: "initial-card",
      convertCard: "convert-card",
      artistTermSelections: "artists-term-selections",
    },
    CLASSES: {
      glow: "glow",
      playlist: "playlist",
      track: "track",
      artist: "artist",
      rankCard: "rank-card",
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
      flipCardInner: "flip-card-inner",
      flipCardFront: "flip-card-front",
      flipCardBack: "flip-card-back",
      flipCard: "flip-card",
      resizeContainer: "resize-container",
      scrollLeft: "scroll-left",
      scrollingText: "scrolling-text",
      noSelect: "no-select",
      dropDown: "drop-down",
      expandableTxtContainer: "expandable-text-container",
      rankCard: "rank-card",
      borderCover: "border-cover",
      firstExpansion: "first-expansion",
      secondExpansion: "second-expansion",
      invisible: "invisible",
      fadeIn: "fade-in",
      fromTop: "from-top",
      expandOnHover: "expand-on-hover",
      tracksArea: "tracks-area",
      scrollBar: "scroll-bar",
      trackList: "track-list",
      artistTopTracks: "artist-top-tracks",
      textForm: "text-form",
    },
    ATTRIBUTES: {
      dataSelection: "data-selection",
    },
  },
  URLs: {
    auth: `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      "%20"
    )}&response_type=code&show_dialog=true`,
    getHasTokens: "/tokens/has-tokens",
    getTokensPrefix: "/tokens/retrieve-tokens?code=",
    getTopArtists: "/spotify/get-top-artists?time_range=",
    getTopTracks: "/spotify/get-top-tracks?time_range=",
    getPlaylists: "/spotify/get-playlists",
    getPlaylistTracks: "/spotify/get-playlist-tracks?playlist_id=",
    postClearTokens: "/tokens/clear-tokens",
    deletePlaylistTracks: "/spotify/delete-playlist-items?playlist_id=",
    postPlaylistTracks: "/spotify/post-playlist-items?playlist_id=",
    getTrackFeatures: "/spotify/get-tracks-features?track_ids=",
    postRefreshAccessToken: "/tokens/refresh-token",
    postSessionData: "/spotify/post-session-data?attr=",
    getSessionData: "/spotify/get-session-data?attr=",
    getArtistTopTracks: "/spotify/get-artist-top-tracks?id=",
  },
  PATHS: {
    spinner: "/images/200pxLoadingSpinner.svg",
    acousticEmoji: "/images/Emojis/AcousticEmoji.svg",
    nonAcousticEmoji: "/images/Emojis/ElectricGuitarEmoji.svg",
    happyEmoji: "/images/Emojis/HappyEmoji.svg",
    neutralEmoji: "/images/Emojis/NeutralEmoji.svg",
    sadEmoji: "/images/Emojis/SadEmoji.svg",
    instrumentEmoji: "/images/Emojis/InstrumentEmoji.svg",
    singerEmoji: "/images/Emojis/SingerEmoji.svg",
    dancingEmoji: "/images/Emojis/DancingEmoji.svg",
    sheepEmoji: "/images/Emojis/SheepEmoji.svg",
    wolfEmoji: "/images/Emojis/WolfEmoji.svg",
    gridView: "/images/grid-view-icon.png",
    listView: "/images/list-view-icon.png",
    chevronLeft: "/images/chevron-left.png",
    chevronRight: "/images/chevron-right.png",
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
export function searchUl(ul, input, stdDisplay = "flex") {
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

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getValidImage(images, idx = 0) {
  // obtain the correct image
  if (images.length > idx) {
    let img = images[idx];
    return img.url;
  } else {
    return "";
  }
}

export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export const animationControl = (function () {
  /** Adds a class to each element causing a transition to the changed css values.
   * This is done on set intervals.
   *
   *
   * @param {String} elementsToAnimate - comma separated string containing the classes or ids of elements to animate including prefix char.
   * @param {String} classToTransitionToo - The class that all the transitioning elements will add
   * @param {Number} animationInterval - The interval to wait between animation of elements
   */
  function intervalElementsTransitions(
    elementsToAnimate,
    classToTransitionToo,
    animationInterval
  ) {
    // arr of html selectors that point to elements to animate
    let attributes = elementsToAnimate.split(",");

    attributes.forEach((attr) => {
      let elements = document.querySelectorAll(attr);
      let idx = 0;
      // in intervals play their initial animations
      let interval = setInterval(() => {
        if (idx === elements.length) {
          clearInterval(interval);
          return;
        }
        let element = elements[idx];
        // add the class to the elements classes in order to run the transition
        element.classList.add(classToTransitionToo);
        idx += 1;
      }, animationInterval);
    });
  }
  /** Animates all elements that contain a certain class or id
   *
   * @param {string} elementsToAnimate - comma separated string containing the classes or ids of elements to animate INCLUDING prefix char.
   * @param {string} classToAdd - class to add EXCLUDING the prefix char.
   * @param {string} animationInterval - the interval to animate the given elements in milliseconds.
   */
  function animateAttributes(elementsToAnimate, classToAdd, animationInterval) {
    intervalElementsTransitions(
      elementsToAnimate,
      classToAdd,
      animationInterval
    );
  }
  return {
    animateAttributes,
  };
})();

import Artist from "../../components/artist.js";
import {
  config,
  promiseHandler,
  htmlToEl,
  removeAllChildNodes,
  animationControl,
} from "../../config.js";
import SelectableTabEls from "../../components/selectableTabEls.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";

const MAX_VIEWABLE_CARDS = 5;

const artistActions = (function () {
  const selections = {
    numViewableCards: MAX_VIEWABLE_CARDS,
    term: "short_term",
  };
  function loadArtistTopTracks(artistObj, callback) {
    artistObj
      .loadTopTracks()
      .then(() => {
        callback();
      })
      .catch((err) => {
        console.log("Error when loading artists");
        console.error(err);
      });
  }
  function showTopTracks(artistObj) {
    loadArtistTopTracks(artistObj, () => {
      let trackList = getTopTracksUlFromArtist(artistObj);
      artistObj.topTracks.forEach((track) => {
        trackList.appendChild(track.getPlaylistTrackHtml(false));
      });
    });
  }

  function loadDatasToArtistArr(datas, artistArr) {
    datas.forEach((data) => {
      artistArr.push(
        new Artist(
          data.id,
          data.name,
          data.genres,
          data.followers.total,
          data.external_urls.spotify,
          data.images
        )
      );
    });
    return artistArr;
  }

  function getTopTracksUlFromArtist(artistObj) {
    let trackList = document
      .getElementById(artistObj.cardId)
      .getElementsByClassName(config.CSS.CLASSES.trackList)[0];

    return trackList;
  }

  async function retrieveArtists(artistArr) {
    let { res, err } = await promiseHandler(
      axios.get(config.URLs.getTopArtists + selections.term)
    );
    if (err) {
      return;
    }
    loadDatasToArtistArr(res.data, artistArr);
  }
  function getCurrSelTopArtists() {
    if (selections.term == "short_term") {
      return artistArrs.topArtistObjsShortTerm;
    } else if (selections.term == "medium_term") {
      return artistArrs.topArtistObjsMidTerm;
    } else if (selections.term == "long_term") {
      return artistArrs.topArtistObjsLongTerm;
    } else {
      throw new Error("Selected track term is invalid " + selections.term);
    }
  }
  return {
    showTopTracks,
    retrieveArtists,
    selections,
    getCurrSelTopArtists,
  };
})();

const displayArtistCards = (function () {
  const selectionVerif = new AsyncSelectionVerif();
  const artistContainer = document.getElementById(
    config.CSS.IDs.artistCardsContainer
  );

  /** Generates the cards to the DOM then makes them visible
   *
   * @param {Array<Track>} artistArr array of track objects whose cards should be generated.
   * @param {Boolean} autoAppear whether to show the card without animation or with animation.
   * @returns {Array<HTML>} array of the card elements.
   */
  function generateCards(artistArr, autoAppear) {
    removeAllChildNodes(artistContainer);
    let cardHtmls = [];
    // fill arr of card elements and append them to DOM
    for (let i = 0; i < artistArr.length; i++) {
      if (i < artistActions.selections.numViewableCards) {
        let artistObj = artistArr[i];
        let cardHtml = artistObj.getArtistHtml(i, autoAppear);

        cardHtmls.push(cardHtml);
        artistContainer.appendChild(cardHtml);

        artistActions.showTopTracks(artistObj);
      } else {
        break;
      }
    }
    if (!autoAppear) {
      animationControl.animateAttributes(
        "." + config.CSS.CLASSES.artist,
        config.CSS.CLASSES.appear,
        25
      );
    }
    return cardHtmls;
  }

  /** Begins retrieving artists then when done verifies it is the correct selected artist.
   *
   * @param {Array<Track>} artistArr array to load artists into.
   */
  function startLoadingArtists(artistArr) {
    // initially show the loading spinner
    const htmlString = `
            <div>
              <img src="${config.PATHS.spinner}" alt="Loading..." />
            </div>`;
    let spinnerEl = htmlToEl(htmlString);

    removeAllChildNodes(artistContainer);
    artistContainer.appendChild(spinnerEl);

    artistActions.retrieveArtists(artistArr).then(() => {
      // after retrieving async verify if it is the same arr of Artist's as what was selected
      if (!selectionVerif.isValid(artistArr)) {
        return;
      }
      return generateCards(artistArr, false);
    });
  }

  /** Load artist objects if not loaded, then generate cards with the objects.
   *
   * @param {Array<Track>} artistArr - List of track objects whose cards should be generated or
   * empty list that should be filled when loading tracks.
   * @param {Boolean} autoAppear whether to show the cards without animation.
   * @returns {Array<HTML>} list of Card HTML's.
   */
  function displayArtistCards(artistArr, autoAppear = false) {
    selectionVerif.selectionChanged(artistArr);
    if (artistArr.length > 0) {
      return generateCards(artistArr, autoAppear);
    } else {
      return startLoadingArtists(artistArr);
    }
  }

  return {
    displayArtistCards,
  };
})();

const artistArrs = (function () {
  const topArtistObjsShortTerm = [];
  const topArtistObjsMidTerm = [];
  const topArtistObjsLongTerm = [];

  return {
    topArtistObjsShortTerm,
    topArtistObjsMidTerm,
    topArtistObjsLongTerm,
  };
})();

const addEventListeners = (function () {
  const selections = {
    termTabManager: new SelectableTabEls(
      document
        .getElementById(config.CSS.IDs.artistTermSelections)
        .getElementsByTagName("button")[0], // first tab is selected first by default
      document
        .getElementById(config.CSS.IDs.artistTermSelections)
        .getElementsByClassName(config.CSS.CLASSES.borderCover)[0] // first tab is selected first by default
    ),
  };

  function addTrackTermButtonEvents() {
    function onClick(btn, borderCover) {
      artistActions.selections.term = btn.getAttribute(
        config.CSS.ATTRIBUTES.dataSelection
      );
      selections.termTabManager.selectNewTab(btn, borderCover);

      let currArtists = artistActions.getCurrSelTopArtists();
      displayArtistCards.displayArtistCards(currArtists);
    }

    const artistTermBtns = document
      .getElementById(config.CSS.IDs.artistTermSelections)
      .getElementsByTagName("button");
    const trackTermBorderCovers = document
      .getElementById(config.CSS.IDs.artistTermSelections)
      .getElementsByClassName(config.CSS.CLASSES.borderCover);

    if (trackTermBorderCovers.length != artistTermBtns.length) {
      console.error("Not all track term buttons contain a border cover");
      return;
    }
    for (let i = 0; i < artistTermBtns.length; i++) {
      let btn = artistTermBtns[i];
      let borderCover = trackTermBorderCovers[i];
      btn.addEventListener("click", () => onClick(btn, borderCover));
    }
  }

  function resetViewableCards() {
    let viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks);
    trackActions.selections.numViewableCards = DEFAULT_VIEWABLE_CARDS;
    viewAllEl.textContent = "See All 50";
  }

  function addViewAllTracksEvent() {
    let viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks);
    function onClick() {
      if (trackActions.selections.numViewableCards == DEFAULT_VIEWABLE_CARDS) {
        trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS;
        viewAllEl.textContent = "See Less";
      } else {
        resetViewableCards();
      }
      let currTracks = trackActions.getCurrSelTopTracks();
      displayCardInfo.displayTrackCards(currTracks);
    }

    viewAllEl.addEventListener("click", () => onClick());
  }

  return {
    addTrackTermButtonEvents,
    // addViewAllTracksEvent,
  };
})();

(function () {
  function onSuccessfulTokenCall(hasToken) {
    let getTokensSpinner = document.getElementById(
      config.CSS.IDs.getTokenLoadingSpinner
    );

    // remove token spinner because by this line we have obtained the token
    getTokensSpinner.parentNode.removeChild(getTokensSpinner);

    const infoContainer = document.getElementById(config.CSS.IDs.infoContainer);
    if (hasToken) {
      generateNavLogin();
      infoContainer.style.display = "block";

      // when entering the page always show short term tracks first
      artistActions.selections.term = "short_term";
      displayArtistCards.displayArtistCards(artistArrs.topArtistObjsShortTerm);
    } else {
      // if there is no token redirect to allow access page
      window.location.href = "http://localhost:3000/";
    }
  }

  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken)
  );
  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener();
  });
})();

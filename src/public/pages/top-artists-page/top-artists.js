import Artist from "../../components/artist.js";
import {
  config,
  promiseHandler,
  htmlToEl,
  removeAllChildNodes,
} from "../../config.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";

const MAX_VIEWABLE_CARDS = 5;

const artistActions = (function () {
  const selectionVerif = new AsyncSelectionVerif();
  const selections = {
    numViewableCards: MAX_VIEWABLE_CARDS,
    term: "short_term",
  };
  function loadArtistTopTracks(artistObj, callback) {
    artistObj
      .loadTopTracks()
      .then(() => {
        // because .then() can run when the currently selected playlist has already changed we need to verify
        if (!selectionVerif.isValid(artistObj)) {
          return;
        }
        callback();

        selectionVerif.hasLoadedCurrSelected = true;
      })
      .catch((err) => {
        console.log("Error when getting tracks");
        console.error(err);
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

  function showTopTracks(artistObj) {
    selectionVerif.selectionChanged(artistObj);
    if (artistObj.hasLoadedTopTracks()) {
      // display the artistObj.topTracks
    } else {
      // load them
      loadArtistTopTracks(artistObj, () => {
        console.log(artistObj.topTracks);
      });
    }
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
  return {
    showTopTracks,
    retrieveArtists,
    selections,
    selectionVerif,
  };
})();

const displayArtistCards = (function () {
  const selectionVerif = new AsyncSelectionVerif();
  const cardsVisibleInterval = { interval: null };
  const artistContainer = document.getElementById(
    config.CSS.IDs.artistCardsContainer
  );
  /** Show each element of a given className by adding the appear class.
   *
   * @param {String} className the class that each track card contains.
   */
  function makeCardsVisible(className) {
    let artistCards = artistContainer.getElementsByClassName(className);
    let idx = 0;

    if (cardsVisibleInterval.interval) {
      clearInterval(cardsVisibleInterval.interval);
    }

    cardsVisibleInterval.interval = setInterval(() => {
      if (idx == artistCards.length) {
        clearInterval(cardsVisibleInterval.interval);
        return;
      }

      let card = artistCards[idx];
      card.classList.add(config.CSS.CLASSES.appear);
      idx += 1;
    }, 30);
  }

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
        cardHtml.addEventListener("click", () => {
          cardHtml.classList.toggle(config.CSS.CLASSES.selected);
          if (cardHtml.classList.contains(config.CSS.CLASSES.selected)) {
            artistActions.showTopTracks(artistObj);
          }
        });
        artistContainer.appendChild(cardHtml);
      } else {
        break;
      }
    }
    if (!autoAppear) {
      makeCardsVisible(config.CSS.CLASSES.card);
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
      return generateCards(artistArr);
    });
  }

  /** Load artist objects if not loaded, then generate cards with the objects.
   *
   * @param {Array<Track>} artistArr - List of track objects whose cards should be generated or
   * empty list that should be filled when loading tracks.
   * @param {Boolean} autoAppear whether to show the cards without animation.
   * @returns {Array<HTML>} list of Card HTML's.
   */
  function displayTrackCards(artistArr, autoAppear = false) {
    selectionVerif.selectionChanged(artistArr);
    if (artistArr.length > 0) {
      return generateCards(artistArr, autoAppear);
    } else {
      return startLoadingArtists(artistArr);
    }
  }

  return {
    displayTrackCards,
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
      displayArtistCards.displayTrackCards(artistArrs.topArtistObjsShortTerm);
    } else {
      // if there is no token redirect to allow access page
      window.location.href = "http://localhost:3000/";
    }
  }

  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken)
  );
})();

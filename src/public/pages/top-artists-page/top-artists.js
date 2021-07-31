import Artist from "../../components/artist.js";
import {
  config,
  promiseHandler,
  htmlToEl,
  removeAllChildNodes,
} from "../../config.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";
import CardActionsHandler from "../../card-actions.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";

const MAX_VIEWABLE_CARDS = 5;

const artistActions = (function () {
  const selectionVerif = new AsyncSelectionVerif();
  const cardActionsHandler = new CardActionsHandler(MAX_VIEWABLE_CARDS);
  const selections = {
    numViewableCards: MAX_VIEWABLE_CARDS,
    term: "short_term",
  };

  function addArtistCardListeners() {
    cardActionsHandler.clearSelectedEls();
    let artistCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.artist)
    );

    artistCards.forEach((artistCard) => {
      artistCard.addEventListener("mouseenter", () => {
        cardActionsHandler.scrollTextOnCardEnter(artistCard);
      });
      artistCard.addEventListener("mouseleave", () => {
        cardActionsHandler.scrollTextOnCardLeave(artistCard);
      });
    });
  }
  function loadDatasToArtistArr(datas, artistArr) {
    datas.forEach((data) => {
      artistArr.push(
        new Artist(
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
    retrieveArtists,
    addArtistCardListeners,
    selections,
    selectionVerif,
  };
})();

const displayArtistCards = (function () {
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
        let cardHtml = artistObj.getArtistCardHtml(i, autoAppear);
        cardHtmls.push(cardHtml);
        artistContainer.appendChild(cardHtml);
      } else {
        break;
      }
    }
    artistActions.addArtistCardListeners(artistArr);
    if (!autoAppear) {
      makeCardsVisible(config.CSS.CLASSES.card);
    }
    return cardHtmls;
  }

  /** Begins retrieving tracks then verifies it is the correct selected tracks.
   *
   * @param {Array<Track>} artistArr array to load tracks into.
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
      // after retrieving async verify if it is the same arr of trackObjs as what was selected
      if (!artistActions.selectionVerif.isValid(artistArr)) {
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
    artistActions.selectionVerif.selectionChanged(artistArr);
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

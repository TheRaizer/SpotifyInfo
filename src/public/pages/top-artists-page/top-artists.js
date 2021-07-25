import Track from "../../components/track.js";
import {
  config,
  promiseHandler,
  htmlToEl,
  capitalizeFirstLetter,
} from "../../config.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";
import { CardActionsHandler } from "../../card-actions.js";

const MAX_VIEWABLE_CARDS = 5;

const artistActions = (function () {
  const selectionVerif = new AsyncSelectionVerif();
  const cardActionsHandler = new CardActionsHandler(MAX_VIEWABLE_CARDS);
  const selections = {
    numViewableCards: MAX_VIEWABLE_CARDS,
    term: "short_term",
  };

  /** Show each element of a given className by adding the appear class.
   *
   * @param {String} className the class that each track card contains.
   */
  function makeCardsVisible(className) {
    let trackCards = tracksContainer.getElementsByClassName(className);
    let idx = 0;

    if (cardsVisibleInterval.interval) {
      clearInterval(cardsVisibleInterval.interval);
    }

    cardsVisibleInterval.interval = setInterval(() => {
      if (idx == trackCards.length) {
        clearInterval(cardsVisibleInterval.interval);
        return;
      }

      let card = trackCards[idx];
      card.classList.add(config.CSS.CLASSES.appear);
      idx += 1;
    }, 30);
  }

  function loadDatasToArtistArr(datas, artistArr) {
    datas.forEach((data) => {
      let props = {
        name: data.name,
        images: data.album.images,
        duration: data.duration_ms,
        uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
        popularity: data.popularity,
        releaseDate: data.album.release_date,
        id: data.id,
        album: { albumName: data.album.name },
        externalUrl: data.external_urls.spotify,
        artists: data.artists,
      };
      artistArr.push(new Track(props));
    });
    return artistArr;
  }
  /** Generates the cards to the DOM then makes them visible
   *
   * @param {Array<Track>} artistObjs array of track objects whose cards should be generated.
   * @param {Boolean} autoAppear whether to show the card without animation or with animation.
   * @returns {Array<HTML>} array of the card elements.
   */
  function generateCards(artistObjs, autoAppear) {
    removeAllChildNodes(tracksContainer);
    let cardHtmls = [];

    // fill arr of card elements and append them to DOM
    for (let i = 0; i < artistObjs.length; i++) {
      let artistObj = artistObjs[i];
      let cardHtml = artistObj.getArtistCardHtml(i, autoAppear);
      cardHtmls.push(cardHtml);
      tracksContainer.appendChild(cardHtml);
    }
    if (!autoAppear) {
      makeCardsVisible(config.CSS.CLASSES.card);
    }
    return cardHtmls;
  }
  async function retrieveArtists(artistArr) {
    let { res, err } = await promiseHandler(
      axios.get(config.URLs.getTopTracks + selections.term)
    );
    if (err) {
      return;
    }
    loadDatasToArtistArr(res.data, artistArr);
  }
  return {
    retrieveTracks: retrieveArtists,
    selections,
    selectionVerif,
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
    } else {
      // if there is no token redirect to allow access page
      window.location.href = "http://localhost:3000/";
    }
  }

  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken)
  );
})();

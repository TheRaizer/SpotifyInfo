import Playlist from "../../components/playlist.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";
import {
  config,
  htmlToEl,
  promiseHandler,
  searchUl,
  animationControl,
} from "../../config.js";
import {
  checkIfHasTokens,
  onSuccessfulTokenCall,
} from "../../manage-tokens.js";
import CardActionsHandler from "../../card-actions.js";

const expandedPlaylistMods = document.getElementById(
  config.CSS.IDs.expandedPlaylistMods
);
// add on change event listener to the order selection element of the mods expanded playlist
const playlistOrder = expandedPlaylistMods.getElementsByClassName(
  config.CSS.CLASSES.playlistOrder
)[0];
const trackUl = expandedPlaylistMods.getElementsByTagName("ul")[0];
const playlistSearchInput = expandedPlaylistMods.getElementsByClassName(
  config.CSS.CLASSES.playlistSearch
)[0];
const playlistsCardContainer = document.getElementById(
  config.CSS.IDs.playlistCardsContainer
);
const cardResizeContainer = document
  .getElementById(config.CSS.IDs.playlistsSection)
  .getElementsByClassName(config.CSS.CLASSES.resizeContainer)[0];

// min viewport before playlist cards convert to text form automatically (equivalent to the media query in playlists.less that changes .card)
const VIEWPORT_MIN = 600;

// will resize the playlist card container to the size wanted when screen is <= VIEWPORT_MIN
const restrictResizeWidth = () =>
  (cardResizeContainer.style.width = VIEWPORT_MIN / 2.5 + "px");

const resizeActions = (function () {
  // id of resize container used to set interaction through interactjs
  const resizeId =
    "#" +
    config.CSS.IDs.playlistsSection +
    ">." +
    config.CSS.CLASSES.resizeContainer;

  function enableResize() {
    interact(resizeId)
      .resizable({
        // only resize from the right
        edges: { top: false, left: false, bottom: false, right: true },
        listeners: {
          move: function (event) {
            Object.assign(event.target.style, {
              width: `${event.rect.width}px`,
            });
          },
        },
      })
      .on("resizeend", saveResizeWidth);

    // once we renable the resize we must set its width to be what the user last set it too.
    loadResizeWidth();
  }
  function disableResize() {
    if (interact.isSet(resizeId)) {
      interact(resizeId).unset();
    }
    // once we disable the resize we must restrict the width to fit within VIEWPORT_MIN pixels.
    restrictResizeWidth();
  }

  return {
    enableResize,
    disableResize,
  };
})();
// order of items should never change
var selPlaylistTracks = [];

const playlistActions = (function () {
  const playlistSelVerif = new AsyncSelectionVerif();
  const cardActionsHandler = new CardActionsHandler(1);
  const playlistTitleh2 = expandedPlaylistMods.getElementsByTagName("h2")[0];

  /** Asynchronously load a playlists tracks and replace the track ul html once it loads
   *
   * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
   * @param {Function} callback - callback function to run when loading was succesful
   */
  function loadPlaylistTracks(playlistObj, callback) {
    playlistObj
      .loadTracks()
      .then((tracks) => {
        // because .then() can run when the currently selected playlist has already changed we need to verify
        if (!playlistSelVerif.isValid(playlistObj)) {
          return;
        }
        selPlaylistTracks = tracks;
        callback();

        playlistSelVerif.hasLoadedCurrSelected = true;
      })
      .catch((err) => {
        console.log("Error when getting tracks");
        console.error(err);
      });
  }
  function whenTracksLoading() {
    // hide these while loading tracks
    playlistSearchInput.value = "";
    playlistSearchInput.classList.add(config.CSS.CLASSES.hide);
    playlistOrder.classList.add(config.CSS.CLASSES.hide);
    trackUl.scrollTop = 0;
  }
  function onTracksLoadingDone() {
    // show them once tracks have loaded
    playlistSearchInput.classList.remove(config.CSS.CLASSES.hide);
    playlistOrder.classList.remove(config.CSS.CLASSES.hide);
  }
  /** Empty the track li and replace it with newly loaded track li.
   *
   * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
   */
  function showPlaylistTracks(playlistObj) {
    playlistTitleh2.textContent = playlistObj.name;

    // empty the track li
    removeAllChildNodes(trackUl);

    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="${config.PATHS.spinner}" />
            </li>`;
    let spinnerEl = htmlToEl(htmlString);
    trackUl.appendChild(spinnerEl);

    playlistSelVerif.selectionChanged(playlistObj);

    // tracks are already loaded so show them
    if (playlistObj.hasLoadedTracks()) {
      whenTracksLoading();
      onTracksLoadingDone();
      selPlaylistTracks = playlistObj.trackObjs;
      manageTracks.sortExpandedTracksToOrder();
    }
    // tracks aren't loaded so lazy load them then show them
    else {
      whenTracksLoading();
      loadPlaylistTracks(playlistObj, () => {
        manageTracks.sortExpandedTracksToOrder();
        onTracksLoadingDone();
      });
    }
  }

  /** When a card is clicked run the standard CardActionsHandler onClick then show its tracks on callback.
   *
   * @param {Array<Playlist>} playlistObjs
   * @param {HTMLElement} playlistCard
   */
  function clickCard(playlistObjs, playlistCard) {
    cardActionsHandler.onCardClick(playlistCard, playlistObjs, (selObj) =>
      showPlaylistTracks(selObj)
    );
  }

  /** Add event listeners to each playlist card.
   *
   * @param {Arr<Playlist>} playlistObjs - playlists that will be used for the events.
   */
  function addOnPlaylistCardListeners(playlistObjs) {
    let playlistCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.playlist)
    );

    playlistCards.forEach((playlistCard) => {
      playlistCard.addEventListener("click", () => {
        clickCard(playlistObjs, playlistCard);
      });

      playlistCard.addEventListener("mouseenter", () => {
        cardActionsHandler.scrollTextOnCardEnter(playlistCard);
      });
      playlistCard.addEventListener("mouseleave", () => {
        cardActionsHandler.scrollTextOnCardLeave(playlistCard);
      });
    });
  }

  return {
    clickCard,
    addOnPlaylistCardListeners,
    showPlaylistTracks,
    playlistSelVerif,
  };
})();

const infoRetrieval = (function () {
  const playlistObjs = [];

  /** Obtains playlist info from web api and displays their cards.
   *
   */
  async function getInitialInfo() {
    function onSuccesful(res) {
      // remove the info loading spinners as info has been loaded
      let infoSpinners = Array.from(
        document.getElementsByClassName(config.CSS.CLASSES.infoLoadingSpinners)
      );
      infoSpinners.forEach((spinner) => {
        spinner.parentNode.removeChild(spinner);
      });

      const playlistDatas = res.data;

      // generate Playlist instances from the data
      playlistDatas.forEach((data) => {
        playlistObjs.push(new Playlist(data.name, data.images, data.id));
      });

      displayCardInfo.displayPlaylistCards(playlistObjs);
    }

    // get playlists data and execute call back on succesful
    await promiseHandler(
      axios.get(config.URLs.getPlaylists),
      onSuccesful,
      (err) => {
        // throw an error that will be sent down to the promise handler that initially executed getInitialInfo()
        throw new Error(err);
      }
    );
  }
  return {
    getInitialInfo,
    playlistObjs,
  };
})();

const displayCardInfo = (function () {
  function determineResizeActiveness() {
    // allow resizing only when viewport is large enough to allow cards.
    if (window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches) {
      resizeActions.disableResize();
    } else {
      resizeActions.enableResize();
    }
  }
  /** Displays the playlist cards from a given array of playlists.
   *
   * @param {Array<Playlist>} playlistObjs
   */
  function displayPlaylistCards(playlistObjs) {
    removeAllChildNodes(playlistsCardContainer);
    let isInTextForm =
      playlistsCardContainer.classList.contains(config.CSS.CLASSES.textForm) ||
      window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches;

    determineResizeActiveness();
    const selectedCard = playlistActions.playlistSelVerif.currSelectedVal;

    // add card htmls to container element
    playlistObjs.map((playlistObj, idx) => {
      playlistsCardContainer.appendChild(
        playlistObj.getPlaylistCardHtml(idx, isInTextForm)
      );

      // if before the form change this playlist was selected, simulate a click on it in order to select it in the new form
      if (playlistObj === selectedCard) {
        playlistActions.clickCard(
          playlistObjs,
          document.getElementById(selectedCard.cardId)
        );
      }
    });

    // if there is a selected card scroll down to it.
    if (selectedCard) {
      document.getElementById(selectedCard.cardId).scrollIntoView();
    }

    // add event listener to cards
    playlistActions.addOnPlaylistCardListeners(playlistObjs);
    // animate the cards(show the cards)
    animationControl.animateAttributes(".playlist", config.CSS.CLASSES.appear);
  }

  return {
    displayPlaylistCards,
  };
})();

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const manageTracks = (function () {
  function sortExpandedTracksToOrder() {
    if (playlistOrder.value == "custom-order") {
      rerenderPlaylistTracks(selPlaylistTracks, trackUl);
    } else if (playlistOrder.value == "name") {
      let tracks = orderTracksByName(selPlaylistTracks);
      rerenderPlaylistTracks(tracks, trackUl);
    } else if (playlistOrder.value == "date-added") {
      let tracks = orderTracksByDateAdded(selPlaylistTracks);
      rerenderPlaylistTracks(tracks, trackUl);
    }
  }
  function orderTracksByName(tracks) {
    // shallow copy just so we dont modify the original order
    let tracksCopy = [...tracks];
    tracksCopy.sort(function (a, b) {
      a = a.getPlaylistTrackHtml();
      b = b.getPlaylistTrackHtml();
      let nameA = a.getElementsByClassName(config.CSS.CLASSES.name)[0];
      let nameATxt = nameA.textContent || nameA.innerText;

      let nameB = b.getElementsByClassName(config.CSS.CLASSES.name)[0];
      let nameBTxt = nameB.textContent || nameB.innerText;

      // -1 precedes, 1 suceeds, 0 is equal
      return nameATxt.toUpperCase() === nameBTxt.toUpperCase()
        ? 0
        : nameATxt.toUpperCase() < nameBTxt.toUpperCase()
        ? -1
        : 1;
    });
    return tracksCopy;
  }
  function orderTracksByDateAdded(tracks) {
    // shallow copy just so we dont modify the original order
    let tracksCopy = [...tracks];
    tracksCopy.sort(function (a, b) {
      // -1 'a' precedes 'b', 1 'a' suceeds 'b', 0 is 'a' equal 'b'
      return a.dateAddedToPlaylist === b.dateAddedToPlaylist
        ? 0
        : a.dateAddedToPlaylist < b.dateAddedToPlaylist
        ? -1
        : 1;
    });
    return tracksCopy;
  }
  function rerenderPlaylistTracks(tracks, trackArrUl) {
    removeAllChildNodes(trackArrUl);
    tracks.map((track) => {
      trackArrUl.appendChild(track.getPlaylistTrackHtml());
    });
  }

  return {
    sortExpandedTracksToOrder,
    orderTracksByDateAdded,
  };
})();

const addEventListeners = (function () {
  function addExpandedPlaylistModsSearchbarEvent() {
    // add key up event to the mods expanded playlist's search bar element
    expandedPlaylistMods
      .getElementsByClassName(config.CSS.CLASSES.playlistSearch)[0]
      .addEventListener("keyup", () => {
        searchUl(trackUl, playlistSearchInput);
      });
  }
  function addExpandedPlaylistModsOrderEvent() {
    // add on change event listener to the order selection element of the mods expanded playlist
    playlistOrder.addEventListener("change", () => {
      manageTracks.sortExpandedTracksToOrder();
    });
  }
  function addDeleteRecentlyAddedTrackEvent() {
    function onClick() {
      if (
        numToRemoveInput.value > selPlaylistTracks.length ||
        numToRemoveInput.value == 0
      ) {
        console.log("cant remove this many");
        // the user is trying to delete more songs then there are available, you may want to allow this
        return;
      }
      let orderedTracks =
        manageTracks.orderTracksByDateAdded(selPlaylistTracks);
      let tracksToRemove = orderedTracks.slice(0, numToRemoveInput.value);

      // remove songs contained in tracksToRemove from expandablePlaylistTracks
      selPlaylistTracks = selPlaylistTracks.filter(
        (track) => !tracksToRemove.includes(track)
      );

      let currPlaylist = playlistActions.playlistSelVerif.currSelectedVal;

      currPlaylist.addToUndoStack(tracksToRemove);

      manageTracks.sortExpandedTracksToOrder(selPlaylistTracks);

      promiseHandler(
        axios.delete(config.URLs.deletePlaylistTracks + currPlaylist.id, {
          data: { tracks: tracksToRemove },
        })
      );
    }
    const numToRemoveInput = document
      .getElementById(config.CSS.IDs.removeEarlyAdded)
      .getElementsByTagName("input")[0];

    const removeBtn = document
      .getElementById(config.CSS.IDs.removeEarlyAdded)
      .getElementsByTagName("button")[0];

    removeBtn.addEventListener("click", () => onClick());
  }
  function addUndoPlaylistTrackDeleteEvent() {
    function onClick() {
      const currPlaylist = playlistActions.playlistSelVerif.currSelectedVal;
      if (!currPlaylist || currPlaylist.undoStack.length == 0) {
        return;
      }
      const undonePlaylistId = currPlaylist.id;
      let tracksRemoved = currPlaylist.undoStack.pop();
      promiseHandler(
        axios.post(config.URLs.postPlaylistTracks + currPlaylist.id, {
          data: { tracks: tracksRemoved },
        }),
        () => {
          // if the request was succesful and the user is
          // still looking at the playlist that was undone back, reload it.
          if (
            undonePlaylistId ==
            playlistActions.playlistSelVerif.currSelectedVal.id
          ) {
            // reload the playlist after adding tracks in order to show the tracks added back
            playlistActions.showPlaylistTracks(
              playlistActions.playlistSelVerif.currSelectedVal
            );
          }
        }
      );
    }
    const undoBtn = document.getElementById(config.CSS.IDs.undo);

    undoBtn.addEventListener("click", () => onClick());
  }
  function addModsOpenerEvent() {
    const modsSection = document.getElementById(config.CSS.IDs.playlistMods);
    const openModsSection = document.getElementById(config.CSS.IDs.modsOpener);

    openModsSection.addEventListener("click", () => {
      modsSection.classList.toggle(config.CSS.CLASSES.appear);
      openModsSection
        .getElementsByTagName("img")[0]
        .classList.toggle(config.CSS.CLASSES.selected);
    });
  }
  function addConvertCards() {
    const convertBtn = document.getElementById(config.CSS.IDs.convertCard);
    const convertImg = convertBtn.getElementsByTagName("img")[0];

    function onClick() {
      playlistsCardContainer.classList.toggle(config.CSS.CLASSES.textForm);
      displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs);
      if (
        playlistsCardContainer.classList.contains(config.CSS.CLASSES.textForm)
      ) {
        convertImg.src = config.PATHS.gridView;
      } else {
        convertImg.src = config.PATHS.listView;
      }
    }

    convertBtn.addEventListener("click", () => onClick());
  }
  function addHideShowCards() {
    const hideShowCards = document.getElementById("hide-show-cards");
    function onClick() {
      hideShowCards.classList.toggle(config.CSS.CLASSES.selected);
      // if its selected we hide the cards otherwise we show them.
      if (hideShowCards.classList.contains(config.CSS.CLASSES.selected)) {
        cardResizeContainer.style.width = 0;
      } else {
        restrictResizeWidth();
      }
      updateHideShowCardsImg();
    }
    hideShowCards.addEventListener("click", () => onClick());
  }
  return {
    addExpandedPlaylistModsSearchbarEvent,
    addExpandedPlaylistModsOrderEvent,
    addDeleteRecentlyAddedTrackEvent,
    addUndoPlaylistTrackDeleteEvent,
    addModsOpenerEvent,
    addConvertCards,
    addHideShowCards,
  };
})();

function saveResizeWidth() {
  promiseHandler(
    axios.post(
      config.URLs.postSessionData +
        `playlist-resize-width&val=${
          cardResizeContainer.getBoundingClientRect().width
        }`
    )
  );
  console.log("end resize");
}
function loadResizeWidth() {
  promiseHandler(
    axios
      .get(config.URLs.getSessionData + "playlist-resize-width")
      .then((res) => {
        cardResizeContainer.style.width = res.data + "px";
      })
  );
}

function updateHideShowCardsImg() {
  const hideShowCards = document.getElementById("hide-show-cards");
  const hideShowImg = hideShowCards.getElementsByTagName("img")[0];
  // if its selected we hide the cards otherwise we show them.
  if (hideShowCards.classList.contains(config.CSS.CLASSES.selected)) {
    hideShowImg.src = config.PATHS.chevronRight;
  } else {
    hideShowImg.src = config.PATHS.chevronLeft;
  }
}

function checkIfCardFormChangeOnResize() {
  const prev = {
    vwIsSmall: window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches,
  };
  window.addEventListener("resize", function () {
    const wasBigNowSmall =
      window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches &&
      !prev.vwIsSmall;

    const wasSmallNowBig =
      prev.vwIsSmall &&
      window.matchMedia(`(min-width: ${VIEWPORT_MIN}px)`).matches;

    if (wasBigNowSmall || wasSmallNowBig) {
      if (wasSmallNowBig) {
        hideShowCards.classList.remove(config.CSS.CLASSES.selected);
        updateHideShowCardsImg();
      }
      // card form has changed on window resize
      displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs);
      prev.vwIsSmall = window.matchMedia(
        `(max-width: ${VIEWPORT_MIN}px)`
      ).matches;
    }
  });
}

(function () {
  promiseHandler(checkIfHasTokens(), (hasToken) => {
    onSuccessfulTokenCall(hasToken, () => {
      // get information and onSuccess animate the elements
      promiseHandler(
        infoRetrieval.getInitialInfo(),
        () =>
          animationControl.animateAttributes(
            ".playlist,#expanded-playlist-mods",
            config.CSS.CLASSES.appear,
            25
          ),
        () => console.log("Problem when getting information")
      );
    });
  });

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener();
  });
  checkIfCardFormChangeOnResize();

  loadResizeWidth();
})();

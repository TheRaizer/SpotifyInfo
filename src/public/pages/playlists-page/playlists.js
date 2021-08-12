import Playlist from "../../components/playlist.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";
import { config, htmlToEl, promiseHandler, searchUl } from "../../config.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";
import CardActionsHandler from "../../card-actions.js";

const expandedPlaylistMods = document.getElementById(
  config.CSS.IDs.expandedPlaylistMods
);
// add on change event listener to the order selection element of the mods expanded playlist
const playlistOrder = expandedPlaylistMods.getElementsByClassName(
  config.CSS.CLASSES.playlistOrder
)[0];
const trackArrUl = expandedPlaylistMods.getElementsByTagName("ul")[0];
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

const restrictResizeWidth = () =>
  (cardResizeContainer.style.width = VIEWPORT_MIN / 2.5 + "px");

const resizeActions = (function () {
  const resizeId =
    "#" +
    config.CSS.IDs.playlistsSection +
    ">." +
    config.CSS.CLASSES.resizeContainer;
  function enableResize() {
    interact(resizeId)
      .resizable({
        edges: { top: false, left: false, bottom: false, right: true },
        listeners: {
          move: function (event) {
            let { x, y } = event.target.dataset;

            x = (parseFloat(x) || 0) + event.deltaRect.left;
            y = (parseFloat(y) || 0) + event.deltaRect.top;

            Object.assign(event.target.style, {
              width: `${event.rect.width}px`,
              height: `${event.rect.height}px`,
              transform: `translate(${x}px, ${y}px)`,
            });

            Object.assign(event.target.dataset, { x, y });
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
    // once we disable the resize we must restrict the width so itll fit to a 600px vw
    restrictResizeWidth();
  }

  return {
    enableResize,
    disableResize,
  };
})();
// order of items should never change
var expandablePlaylistTracks = [];

const playlistActions = (function () {
  const selectionVerif = new AsyncSelectionVerif();
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
        if (!selectionVerif.isValid(playlistObj)) {
          return;
        }
        expandablePlaylistTracks = tracks;
        callback();

        selectionVerif.hasLoadedCurrSelected = true;
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
    trackArrUl.scrollTop = 0;
  }
  function onTracksLoadingDone() {
    // show them once tracks have loaded
    playlistSearchInput.classList.remove(config.CSS.CLASSES.hide);
    playlistOrder.classList.remove(config.CSS.CLASSES.hide);
  }
  /** Empty the track arr and replace it with newly loaded html track arr.
   *
   * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
   */
  function showExpandedPlaylist(playlistObj) {
    playlistTitleh2.textContent = playlistObj.name;

    // empty the track arr html
    removeAllChildNodes(trackArrUl);

    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="${config.PATHS.spinner}" />
            </li>`;
    let spinnerEl = htmlToEl(htmlString);
    trackArrUl.appendChild(spinnerEl);

    selectionVerif.selectionChanged(playlistObj);

    if (playlistObj.hasLoadedTracks()) {
      // tracks are already loaded so show them
      whenTracksLoading();
      onTracksLoadingDone();
      expandablePlaylistTracks = playlistObj.trackObjs;
      manageTracks.sortExpandedTracksToOrder();
    } else {
      // lazy load tracks then show them
      whenTracksLoading();
      loadPlaylistTracks(playlistObj, () => {
        manageTracks.sortExpandedTracksToOrder();
        onTracksLoadingDone();
      });
    }
  }
  /** Add an on click listener to each Playlist instance in the given arr.
   *
   * @param {Arr<Playlist>} playlistObjs - arr of Playlist instances whose on click event listeners are being initialized
   */
  function addOnPlaylistCardListeners(playlistObjs) {
    let playlistCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.playlist)
    );

    playlistCards.forEach((playlistCard) => {
      playlistCard.addEventListener("click", () => {
        cardActionsHandler.onCardClick(playlistCard, playlistObjs, (selObj) =>
          showExpandedPlaylist(selObj)
        );
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
    addOnPlaylistCardListeners,
    showExpandedPlaylist,
    selectionVerif,
  };
})();

const infoRetrieval = (function () {
  const playlistObjs = [];

  /* Obtains playlist info from web api and displays their cards.*/
  async function getInitialInfo() {
    // axios get request return a promise
    let response = await promiseHandler(axios.get(config.URLs.getPlaylists));

    // remove the info loading spinners as info has been loaded
    let infoSpinners = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.infoLoadingSpinners)
    );
    infoSpinners.forEach((spinner) => {
      spinner.parentNode.removeChild(spinner);
    });

    const playlistDatas = response.res.data;

    playlistDatas.forEach((data) => {
      playlistObjs.push(new Playlist(data.name, data.images, data.id));
    });

    displayCardInfo.displayPlaylistCards(playlistObjs);
  }
  return {
    getInitialInfo,
    playlistObjs,
  };
})();

const displayCardInfo = (function () {
  function displayPlaylistCards(playlistObjs) {
    removeAllChildNodes(playlistsCardContainer);
    let isInTextForm =
      playlistsCardContainer.classList.contains(config.CSS.CLASSES.textForm) ||
      window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches;

    // allow resizing only when viewport is large enough to allow cards.
    if (window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches) {
      resizeActions.disableResize();
    } else {
      resizeActions.enableResize();
    }

    // add card html to container element
    playlistObjs.map((playlistObj, idx) => {
      playlistsCardContainer.appendChild(
        playlistObj.getPlaylistCardHtml(idx, isInTextForm)
      );
    });
    // add event listener to cards
    playlistActions.addOnPlaylistCardListeners(playlistObjs);

    // animate the cards(show the cards)
    animationControl.animateAttributes(".playlist", config.CSS.CLASSES.appear);
  }

  return {
    displayPlaylistCards,
  };
})();

const animationControl = (function () {
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
   * @param {string} elementsToAnimate - comma separated string containing the classes or ids of elements to animate including prefix char.
   */
  function animateAttributes(elementsToAnimate, classToAdd) {
    const animationInterval = 25;

    // observable element that causes animation on scroll should contain a 'data-class-to-animate' attribute
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

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const manageTracks = (function () {
  function sortExpandedTracksToOrder() {
    if (playlistOrder.value == "custom-order") {
      rerenderPlaylistTracks(expandablePlaylistTracks, trackArrUl);
    } else if (playlistOrder.value == "name") {
      let tracks = orderTracksByName(expandablePlaylistTracks);
      rerenderPlaylistTracks(tracks, trackArrUl);
    } else if (playlistOrder.value == "date-added") {
      let tracks = orderTracksByDateAdded(expandablePlaylistTracks);
      rerenderPlaylistTracks(tracks, trackArrUl);
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
        searchUl(trackArrUl, playlistSearchInput);
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
        numToRemoveInput.value > expandablePlaylistTracks.length ||
        numToRemoveInput.value == 0
      ) {
        console.log("cant remove this many");
        // the user is trying to delete more songs then there are available, you may want to allow this
        return;
      }
      let orderedTracks = manageTracks.orderTracksByDateAdded(
        expandablePlaylistTracks
      );
      let tracksToRemove = orderedTracks.slice(0, numToRemoveInput.value);

      // remove songs contained in tracksToRemove from expandablePlaylistTracks
      expandablePlaylistTracks = expandablePlaylistTracks.filter(
        (track) => !tracksToRemove.includes(track)
      );

      let currPlaylist = playlistActions.selectionVerif.currSelectedVal;

      currPlaylist.addToUndoStack(tracksToRemove);

      manageTracks.sortExpandedTracksToOrder(expandablePlaylistTracks);

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
      const currPlaylist = playlistActions.selectionVerif.currSelectedVal;
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
            playlistActions.selectionVerif.currSelectedVal.id
          ) {
            // reload the playlist after adding tracks in order to show the tracks added back
            playlistActions.showExpandedPlaylist(
              playlistActions.selectionVerif.currSelectedVal
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
    function onClick() {
      playlistsCardContainer.classList.toggle(config.CSS.CLASSES.textForm);
      displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs);
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
      // card form has changed on window resize
      displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs);
      prev.vwIsSmall = window.matchMedia(
        `(max-width: ${VIEWPORT_MIN}px)`
      ).matches;
    }
  });
}

(function () {
  function onSuccesfulTokenCall(hasToken) {
    let getTokensSpinner = document.getElementById(
      config.CSS.IDs.getTokenLoadingSpinner
    );

    // remove token spinner because by this line we have obtained the token
    getTokensSpinner.parentNode.removeChild(getTokensSpinner);

    const infoContainer = document.getElementById(config.CSS.IDs.infoContainer);
    if (hasToken) {
      generateNavLogin();
      infoContainer.style.display = "block";
      // render and get information
      promiseHandler(
        infoRetrieval.getInitialInfo(),
        () =>
          animationControl.animateAttributes(
            ".playlist,#expanded-playlist-mods",
            config.CSS.CLASSES.appear
          ),
        () => console.log("Problem when getting information")
      );
    } else {
      // if there is no token redirect to allow access page
      window.location.href = "http://localhost:3000/";
    }
  }

  promiseHandler(checkIfHasTokens(), (hasToken) => {
    onSuccesfulTokenCall(hasToken);
  });

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener();
  });
  checkIfCardFormChangeOnResize();

  loadResizeWidth();
})();

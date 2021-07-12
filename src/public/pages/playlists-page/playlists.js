import Playlist from "../../components/playlist.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";
import { config, htmlToEl, promiseHandler, searchUl } from "../../config.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";
import { CardActionsHandler } from "../../card-actions.js";

const expandedPlaylistMods = document.getElementById(
  config.CSS.IDs.expandedPlaylistMods
);
// add on change event listener to the order selection element of the mods expanded playlist
const playlistOrder = expandedPlaylistMods.getElementsByClassName(
  config.CSS.CLASSES.playlistOrder
)[0];
const trackListUl = expandedPlaylistMods.getElementsByTagName("ul")[0];
const playlistSearchInput = expandedPlaylistMods.getElementsByClassName(
  config.CSS.CLASSES.playlistSearch
)[0];

const cardResizeContainer = document
  .getElementById(config.CSS.IDs.playlistsSection)
  .getElementsByClassName(config.CSS.CLASSES.resizeContainer)[0];

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
  function loadPlaylistTracksToHtmlString(playlistObj, callback) {
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
    trackListUl.scrollTop = 0;
  }
  function onTracksLoadingDone() {
    // show them once tracks have loaded
    playlistSearchInput.classList.remove(config.CSS.CLASSES.hide);
    playlistOrder.classList.remove(config.CSS.CLASSES.hide);
  }
  /** Empty the track list and replace it with newly loaded html track list.
   *
   * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
   */
  function showExpandedPlaylist(playlistObj) {
    playlistTitleh2.textContent = playlistObj.name;

    // empty the track list html
    removeAllChildNodes(trackListUl);

    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="${config.PATHS.spinner}" />
            </li>`;
    let spinnerEl = htmlToEl(htmlString);
    trackListUl.appendChild(spinnerEl);

    selectionVerif.selectionChanged(playlistObj);

    if (!playlistObj.trackObjs) {
      // lazy load tracks then show them
      whenTracksLoading();
      loadPlaylistTracksToHtmlString(playlistObj, () => {
        manageTracks.sortExpandedTracksToOrder();
        onTracksLoadingDone();
      });
    } else {
      // tracks are already loaded so show them
      whenTracksLoading();
      onTracksLoadingDone();
      expandablePlaylistTracks = playlistObj.trackObjs;
      manageTracks.sortExpandedTracksToOrder();
    }
  }
  /** Add an on click listener to each Playlist instance in the given list.
   *
   * @param {List<Playlist>} playlistObjs - list of Playlist instances whose on click event listeners are being initialized
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
  };
})();

const displayCardInfo = (function () {
  const playlistsContainer = document.getElementById(
    config.CSS.IDs.playlistCardsContainer
  );

  function displayPlaylistCards(playlistObjs) {
    removeAllChildNodes(playlistsContainer);

    // add card html to container element
    playlistObjs.map((playlistObj, idx) => {
      playlistsContainer.appendChild(playlistObj.getPlaylistCardHtml(idx));
    });
    // add event listener to cards
    playlistActions.addOnPlaylistCardListeners(playlistObjs);
  }

  return {
    displayPlaylistCards,
  };
})();

const animationControl = (function () {
  const animateOptions = {
    // the entire element should be visible before the observer counts it as intersecting
    threshold: 1,
    // how far down the screen the element needs to be before the observer counts it as intersecting
    rootMargin: "0px 0px -150px 0px",
  };
  const appearOnScrollObserver = new IntersectionObserver(function (
    entries,
    appearOnScroll
  ) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      // if there is no elements to animate attribute throw error
      if (
        entry.target.getAttribute(config.CSS.ATTRIBUTES.elementsToAnimate) ==
        null
      ) {
        throw new Error(
          "Element to observe " +
            entry +
            " does not contain attribute: " +
            config.CSS.ATTRIBUTES.elementsToAnimate
        );
      }

      const animationInterval = 25;

      // observable element that causes animation on scroll should contain a 'data-class-to-animate' attribute
      intervalElementsTransitions(
        entry.target.getAttribute(config.CSS.ATTRIBUTES.elementsToAnimate),
        config.CSS.CLASSES.appear,
        animationInterval
      );
      appearOnScroll.unobserve(entry.target);
    });
  },
  animateOptions);

  /** Adds a class to each element causing a transition to the changed css attributes
   * of the added class while still retaining unchanged attributes from original class.
   * This is done on set intervals.
   *
   *
   * @param {String} className - The class that all the transitioning elements contain
   * @param {String} classToTransitionToo - The class that all the transitioning elements will add
   * @param {Number} animationInterval - The interval to wait between animation of elements
   */
  function intervalElementsTransitions(
    elementsToAnimate,
    classToTransitionToo,
    animationInterval
  ) {
    // list of html selectors that point to elements to animate
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
  /** Use IntersectionObserver to observe some elements that will run some
   * animations when seen on the viewport.
   *
   */
  function addAnimateOnScroll() {
    const playlistsArea = document.getElementById("playlists-header");
    appearOnScrollObserver.observe(playlistsArea);
  }
  return {
    addAnimateOnScroll,
    intervalElementsTransitions,
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
      rerenderPlaylistTracks(expandablePlaylistTracks, trackListUl);
    } else if (playlistOrder.value == "name") {
      let tracks = orderTracksByName(expandablePlaylistTracks);
      rerenderPlaylistTracks(tracks, trackListUl);
    } else if (playlistOrder.value == "date-added") {
      let tracks = orderTracksByDateAdded(expandablePlaylistTracks);
      rerenderPlaylistTracks(tracks, trackListUl);
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
  function rerenderPlaylistTracks(tracks, trackListUl) {
    removeAllChildNodes(trackListUl);
    tracks.map((track) => {
      trackListUl.appendChild(track.getPlaylistTrackHtml());
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
        searchUl(trackListUl, playlistSearchInput);
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

      currPlaylist.addToUndoList(tracksToRemove);

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
      if (!currPlaylist || currPlaylist.undoList.length == 0) {
        return;
      }
      const undonePlaylistId = currPlaylist.id;
      let tracksRemoved = currPlaylist.undoList.pop();
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
  return {
    addExpandedPlaylistModsSearchbarEvent,
    addExpandedPlaylistModsOrderEvent,
    addDeleteRecentlyAddedTrackEvent,
    addUndoPlaylistTrackDeleteEvent,
    addModsOpenerEvent,
  };
})();

function saveResizeWidth() {
  axios
    .post(
      config.URLs.postSessionData +
        `playlist-resize-width&val=${
          cardResizeContainer.getBoundingClientRect().width
        }`
    )
    .catch((err) => console.error(err));
  console.log("end resize");
}
function loadResizeWidth() {
  axios
    .get(config.URLs.getSessionData + "playlist-resize-width")
    .then((res) => {
      cardResizeContainer.style.width = res.data + "px";
    })
    .catch((err) => console.error(err));
}

(function () {
  checkIfHasTokens()
    .then((hasToken) => {
      let getTokensSpinner = document.getElementById(
        config.CSS.IDs.getTokenLoadingSpinner
      );

      // remove token spinner because by this line we have obtained the token
      getTokensSpinner.parentNode.removeChild(getTokensSpinner);

      const infoContainer = document.getElementById(
        config.CSS.IDs.infoContainer
      );
      if (hasToken) {
        generateNavLogin();
        infoContainer.style.display = "block";
        // render and get information
        infoRetrieval
          .getInitialInfo()
          .then(() => {
            // Run .then() when information has been obtained and innerhtml has been changed
            animationControl.addAnimateOnScroll();
          })
          .catch((err) => {
            console.log("Problem when getting information");
            console.error(err);
          });
      } else {
        // if there is no token redirect to allow access page
        window.location.href = "http://localhost:3000/";
      }
    })
    .catch((err) => console.error(err));

  addEventListeners.addExpandedPlaylistModsSearchbarEvent();
  addEventListeners.addExpandedPlaylistModsOrderEvent();
  addEventListeners.addDeleteRecentlyAddedTrackEvent();
  addEventListeners.addUndoPlaylistTrackDeleteEvent();
  addEventListeners.addModsOpenerEvent();

  loadResizeWidth();
  interact(
    "#" +
      config.CSS.IDs.playlistsSection +
      ">." +
      config.CSS.CLASSES.resizeContainer
  )
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
})();

import Track from "./components/track.js";
import Playlist from "./components/playlist.js";
import { config, htmlToEl } from "./config.js";

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

const trackTimeRangeSelection = document.getElementById(
  "tracks-term-selection"
);

function createSpotifyLoginButton(changeAccount = false) {
  // Create anchor element.
  let btn = document.createElement("button");
  btn.style.width = "100px";
  btn.style.height = "50px";

  // Create the text node for anchor element.
  let link = document.createTextNode(
    changeAccount ? "Change Account" : "Login To Spotify"
  );
  // Append the text node to anchor element.
  btn.appendChild(link);
  btn.classList.add(config.CSS.CLASSES.glow);

  // clear current tokens when clicked
  btn.addEventListener("click", () => {
    axios.post(config.URLs.postClearTokens).catch((err) => console.error(err));
    window.location.href = config.URLs.auth;
  });

  // Append the anchor element to the body.
  document.getElementById(config.CSS.IDs.spotifyContainer).appendChild(btn);
}

async function promiseHandler(
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

async function obtainTokens() {
  let hasToken = false;
  // await promise resolve that returns whether the session has tokens.
  // because token is stored in session we need to reassign 'hasToken' to the client so we do not need to run this method again on refresh
  await promiseHandler(
    axios.get(config.URLs.getHasTokens),
    (res) => (hasToken = res.data)
  );

  if (hasToken) {
    console.log("has token");
    return hasToken;
  }

  console.log("get tokens");
  // create a parameter searcher in the URL after '?' which holds the requests body parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Get the code from the parameter called 'code' in the url which
  // hopefully came back from the spotify GET request otherwise it is null
  let authCode = urlParams.get("code");

  if (authCode) {
    await promiseHandler(
      axios.get(`${config.URLs.getTokensPrefix}${authCode}`),

      // if the request was succesful we have recieved a token
      () => (hasToken = true)
    );
    authCode = "";
  } else {
    // create spotify button if no auth code was found in the url
    createSpotifyLoginButton();
  }

  // because the code has been obtained we want to change the url
  // so it doesn't have the code without refreshing the page
  window.history.pushState(null, null, "/");
  return hasToken;
}

// order of items should never change
var expandablePlaylistTracks = [];

const cardActions = (function () {
  // returns whether the card was succesfully clicked with all actions run
  function onCardClick(currSelCardEl, cardEl, corrObjList) {
    if (currSelCardEl === cardEl) {
      return { cardEl: null, corrObj: null, ok: false };
    }
    // get corrosponding playlist object using the elements id
    let corrObj = corrObjList.find((x) => x.cardId === cardEl.id);
    // if there is an existing playlist selected, unselect it
    if (currSelCardEl) {
      currSelCardEl.classList.remove(config.CSS.CLASSES.selected);
    }

    // on click add the selected class onto the element which runs a transition
    cardEl.classList.add(config.CSS.CLASSES.selected);
    return { cardEl: cardEl, corrObj: corrObj, ok: true };
  }

  return {
    onCardClick,
  };
})();

class AsyncSelectionVerif {
  constructor() {
    // used to compare to a loaded value
    this.currSelectedVal = null;
    this.hasLoadedCurrSelected = false;
  }

  // change the value in the lock when another value is selected
  selectionChanged(currSelectedVal) {
    this.currSelectedVal = currSelectedVal;
    this.hasLoadedCurrSelected = false;
  }

  isValid(currLoadedVal) {
    // if the currently selected object is not the same as the one just loaded it is not valid
    // if it is the same object, but the object has already been loaded it is also not valid.
    if (this.currSelectedVal !== currLoadedVal || this.hasLoaded) {
      return false;
    } else {
      return true;
    }
  }
}

const playlistActions = (function () {
  const playlistTitleh2 = expandedPlaylistMods.getElementsByTagName("h2")[0];

  function loadPlaylistTracksToHtmlString(playlistObj, callback) {
    playlistSearchInput.value = "";
    playlistSearchInput.classList.add(config.CSS.CLASSES.hide);
    playlistOrder.classList.add(config.CSS.CLASSES.hide);
    // synchronously assign the currently selected playlist to be this playlist
    infoRetrieval.selectionLock.selectionChanged(playlistObj);

    // asynchronously load the tracks and replace the html once it loads
    playlistObj
      .getTracks()
      .then((tracks) => {
        // because .then() can run when the currently selected playlist has already changed we need a check
        if (!infoRetrieval.selectionLock.isValid(playlistObj)) {
          return;
        }
        expandablePlaylistTracks = tracks;
        callback();

        infoRetrieval.selectionLock.hasLoadedCurrSelected = true;
      })
      .catch((err) => {
        console.log("Error when getting tracks");
        console.error(err);
      });
  }
  function whenTracksLoading() {
    // hide these while loading tracks
    playlistSearchInput.classList.add(config.CSS.CLASSES.hide);
    playlistOrder.classList.add(config.CSS.CLASSES.hide);
  }
  function onTracksLoadingDone() {
    // show them once tracks have loaded
    playlistSearchInput.classList.remove(config.CSS.CLASSES.hide);
    playlistOrder.classList.remove(config.CSS.CLASSES.hide);
  }
  function showExpandedPlaylist(playlistObj) {
    playlistTitleh2.textContent = playlistObj.name;

    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="200pxLoadingSpinner.svg" />
            </li>`;
    let spinnerEl = htmlToEl(htmlString);

    removeAllChildNodes(trackListUl);
    trackListUl.appendChild(spinnerEl);

    whenTracksLoading();
    loadPlaylistTracksToHtmlString(playlistObj, () => {
      manageTracks.sortExpandedTracksToOrder();
      onTracksLoadingDone();
    });
  }
  function addOnPlaylistCardClick(playlistObjs) {
    var currSelPlaylistEl = null;
    function onPlaylistCardClick(playlistCard, playlistObjs) {
      let { cardEl, corrObj, ok } = cardActions.onCardClick(
        currSelPlaylistEl,
        playlistCard,
        playlistObjs
      );
      if (!ok) {
        return;
      }
      currSelPlaylistEl = cardEl;

      showExpandedPlaylist(corrObj);
    }

    let playlistCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.playlist)
    );

    playlistCards.forEach((playlistCard) => {
      playlistCard.addEventListener("click", () =>
        onPlaylistCardClick(playlistCard, playlistObjs)
      );
    });
  }

  return {
    addOnPlaylistCardClick,
    showExpandedPlaylist,
  };
})();

const trackActions = (function () {
  const selectionLock = new AsyncSelectionVerif();
  const trackInfoEls = (function () {
    const trackInfoEl = document
      .getElementById(config.CSS.IDs.tracksData)
      .getElementsByClassName(config.CSS.CLASSES.tracksInfo)[0];
    const titleEl = trackInfoEl.getElementsByClassName(
      config.CSS.CLASSES.infoTitle
    )[0];
    const albumNameEl = trackInfoEl.getElementsByClassName(
      config.CSS.CLASSES.albumName
    )[0];
    const releaseDateEl = trackInfoEl.getElementsByClassName(
      config.CSS.CLASSES.releaseDate
    )[0];
    const popularityEl = trackInfoEl.getElementsByClassName(
      config.CSS.CLASSES.popularityIdx
    )[0];

    return {
      titleEl,
      albumNameEl,
      releaseDateEl,
      popularityEl,
    };
  })();

  function loadTrackFeatures(trackObj, callback) {
    selectionLock.selectionChanged(trackObj);
    trackObj.getFeatures().then((features) => {
      if (!selectionLock.isValid(trackObj)) {
        return;
      }
      callback(features);
    });
    // this function is very similar to 'playlistActions.loadPlaylistTracksToHtmlString()'
  }
  function showTrackInfo(trackObj) {
    loadTrackFeatures(trackObj, (features) => {
      // stuff has been loaded now so remove loading spinner and show info
      trackInfoEls.titleEl.textContent = "Title: " + trackObj.name;
      trackInfoEls.releaseDateEl.textContent =
        "Release Date: " + trackObj.releaseDate.toDateString();
      trackInfoEls.popularityEl.textContent =
        "Popularity Index: " + trackObj.popularity;
    });
  }
  function addOnTrackCardClick(trackObjs) {
    var currSelTrackEl = null;
    function onTrackCardClick(trackCard, trackObjs) {
      let { cardEl, corrObj, ok } = cardActions.onCardClick(
        currSelTrackEl,
        trackCard,
        trackObjs
      );
      if (!ok) {
        return;
      }
      currSelTrackEl = cardEl;

      showTrackInfo(corrObj);
    }

    let trackCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.track)
    );

    trackCards.forEach((trackCard) => {
      trackCard.addEventListener("click", () =>
        onTrackCardClick(trackCard, trackObjs)
      );
    });
  }
  function getCurrentlySelTopTracks() {
    if (trackTimeRangeSelection.value == "short-term") {
      return infoRetrieval.topTrackObjsShortTerm;
    } else if (trackTimeRangeSelection.value == "medium-term") {
      return infoRetrieval.topTrackObjsMidTerm;
    } else if (trackTimeRangeSelection.value == "long-term") {
      return infoRetrieval.topTrackObjsLongTerm;
    }
  }
  return {
    addOnTrackCardClick,
    getCurrentlySelTopTracks,
  };
})();

const infoRetrieval = (function () {
  const selectionLock = new AsyncSelectionVerif();
  const playlistObjs = [];
  const topTrackObjsShortTerm = [];
  const topTrackObjsMidTerm = [];
  const topTrackObjsLongTerm = [];

  function loadDataToTrackLists(
    shortTrackDatas,
    midTrackDatas,
    longTrackDatas
  ) {
    shortTrackDatas.forEach((data) => {
      let props = {
        name: data.name,
        images: data.album.images,
        duration: data.duration_ms,
        uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
        popularity: data.popularity,
        releaseDate: data.album.release_date,
        id: data.id,
      };
      topTrackObjsShortTerm.push(new Track(props));
    });
    midTrackDatas.forEach((data) => {
      let props = {
        name: data.name,
        images: data.album.images,
        duration: data.duration_ms,
        uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
        popularity: data.popularity,
        releaseDate: data.album.release_date,
        id: data.id,
      };
      topTrackObjsMidTerm.push(new Track(props));
    });
    longTrackDatas.forEach((data) => {
      let props = {
        name: data.name,
        images: data.album.images,
        duration: data.duration_ms,
        uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
        popularity: data.popularity,
        releaseDate: data.album.release_date,
        id: data.id,
      };
      topTrackObjsLongTerm.push(new Track(props));
    });
  }
  /* Obtains information from web api and displays them.*/
  async function getInitialInfo() {
    // axios get requests return a promise
    let topArtistsReq = promiseHandler(axios.get(config.URLs.getTopArtists));
    let topTracksShortTermReq = promiseHandler(
      axios.get(config.URLs.getTopTracks + "short_term")
    );
    let topTracksMidTermReq = promiseHandler(
      axios.get(config.URLs.getTopTracks + "medium_term")
    );
    let topTracksLongTermReq = promiseHandler(
      axios.get(config.URLs.getTopTracks + "long_term")
    );
    let playListsReq = promiseHandler(axios.get(config.URLs.getPlaylists));

    // promise.all runs each promise in parallel before returning their values once theyre all done.
    // promise.all will also stop function execution if a error is thrown in any of the promises.

    // promise.settleAll will not throw error however it will store the state of each request. (rejected state is equivalent to a thrown error)
    let responses = await Promise.all([
      topArtistsReq,
      topTracksShortTermReq,
      topTracksMidTermReq,
      topTracksLongTermReq,
      playListsReq,
    ]);
    console.log(responses);

    // remove the info loading spinners as info has been loaded
    let infoSpinners = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.infoLoadingSpinners)
    );
    infoSpinners.forEach((spinner) => {
      spinner.parentNode.removeChild(spinner);
    });

    const playlistDatas = responses[4].res.data;
    playlistDatas.forEach((data) => {
      playlistObjs.push(new Playlist(data.name, data.images, data.id));
    });

    const shortTrackDatas = responses[1].res.data;
    const midTrackDatas = responses[2].res.data;
    const longTrackDatas = responses[3].res.data;
    loadDataToTrackLists(shortTrackDatas, midTrackDatas, longTrackDatas);

    displayCardInfo.initDisplay(playlistObjs, topTrackObjsShortTerm);
  }
  return {
    getInitialInfo,
    selectionLock,
    topTrackObjsShortTerm,
    topTrackObjsMidTerm,
    topTrackObjsLongTerm,
  };
})();

const displayCardInfo = (function () {
  const playlistsContainer = document.getElementById(
    config.CSS.IDs.playlistCardsContainer
  );
  const tracksContainer = document.getElementById(
    config.CSS.IDs.trackCardsContainer
  );

  function initDisplay(playlistObjs, trackObjs) {
    displayPlaylistCards(playlistObjs);
    displayTrackCards(trackObjs);
  }
  function displayPlaylistCards(playlistObjs) {
    removeAllChildNodes(playlistsContainer);
    playlistObjs.map((playlistObj, idx) => {
      playlistsContainer.appendChild(playlistObj.getPlaylistCardHtml(idx));
    });
    playlistActions.addOnPlaylistCardClick(playlistObjs);
  }
  function displayTrackCards(trackObjs) {
    removeAllChildNodes(tracksContainer);
    let cardHtmls = [];
    trackObjs.map((trackObj, idx) => {
      let cardHtml = trackObj.getTrackCardHtml(idx);
      cardHtmls.push(cardHtml);
      tracksContainer.appendChild(cardHtml);
    });
    trackActions.addOnTrackCardClick(trackObjs);
    if (chartsManager.charts.tracksChart == null) {
      chartsManager.generateTracksChart(trackObjs);
    } else {
      chartsManager.updateTracksChart(trackObjs);
    }

    return cardHtmls;
  }

  return {
    displayTrackCards,
    initDisplay,
  };
})();

const chartsManager = (function () {
  const tracksChartEl = document.getElementById(config.CSS.IDs.tracksChart);
  const charts = { tracksChart: null };
  const TRACK_FEATS = {
    popularity: "POPULARITY",
    acousticness: "ACOUSTICNESS",
    energy: "ENERGY",
  };
  const selections = { feature: TRACK_FEATS.popularity };

  function getNamesAndPopularity(trackObjs) {
    const names = trackObjs.map((track) => track.name);
    const popularities = trackObjs.map((track) => track.popularity);
    return { names, popularities };
  }
  // obtains all the features for each track in a selected time range
  async function loadTracksFeatures(trackObjs, tracksVerLoading) {
    let featLoadingPromises = [];
    trackObjs.forEach((trackObj) => {
      if (trackObj.features == null) {
        featLoadingPromises.push(trackObj.getFeatures());
      }
    });

    let featureList = await Promise.all(featLoadingPromises);

    return { featureList, tracksVerLoaded: tracksVerLoading };
  }
  // uses the AsyncSelectionLock class to create a lock when using loadTracksFeatures()
  function loadFeaturesVerif(trackObjs, callback) {
    const selectionLock = new AsyncSelectionVerif();
    let tracksVerSelected = trackTimeRangeSelection.value;
    selectionLock.selectionChanged(tracksVerSelected);

    loadTracksFeatures(trackObjs, tracksVerSelected).then(
      ({ featureList, tracksVerLoaded }) => {
        if (!selectionLock.isValid(tracksVerLoaded)) {
          return;
        }
        selectionLock.hasLoadedCurrSelected = true;
        callback(featureList);
      }
    );
  }

  function createFeatureLists(featureList) {
    let acousticnesses = featureList.map((features) =>
      Math.round(features.acousticness * 100)
    );
    let energies = featureList.map((features) =>
      Math.round(features.energy * 100)
    );

    return { acousticnesses, energies };
  }

  function generateTracksChart(trackObjs) {
    // display loading spinner, then load features of each track.
    let { names, popularities } = getNamesAndPopularity(trackObjs);
    loadFeaturesVerif(trackObjs, (featureList) => {
      // remove loading spinner for chart
      charts.tracksChart = new Chart(tracksChartEl, {
        type: "bar",
        data: {
          labels: names,
          datasets: [
            {
              label: "Popularity",
              data: popularities,
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(153, 102, 255, 0.5)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "Top Tracks Comparison",
            },
          },
          responsive: false,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 100,
              grid: {
                color: "#4b4b4ba9",
              },
            },
            x: {
              grid: {
                color: "#4b4b4ba9",
              },
            },
          },
        },
      });
    });
  }
  function updateTracksChart(trackObjs) {
    let { names, popularities } =
      chartsManager.getNamesAndPopularity(trackObjs);
    // display loading spinner, then load features of each track.
    loadFeaturesVerif(trackObjs, (featureList) => {
      // remove loading spinner for chart
      let { acousticnesses, energies } = createFeatureLists(featureList);
      let chart = charts.tracksChart;
      chart.data.labels = [];
      chart.data.datasets[0].data = [];

      chart.data.labels = names;
      if (selections.feature == TRACK_FEATS.popularity) {
        chart.data.datasets[0].data = popularities;
        chart.data.datasets[0].label = "Popularity";
      } else if (selections.feature == TRACK_FEATS.acousticness) {
        chart.data.datasets[0].data = acousticnesses;
        chart.data.datasets[0].label = "Acousticness";
      } else if (selections.feature == TRACK_FEATS.energy) {
        chart.data.datasets[0].data = energies;
        chart.data.datasets[0].label = "Energy";
      }
      chart.update();
    });
  }

  return {
    generateTracksChart,
    updateTracksChart,
    getNamesAndPopularity,
    charts,
    TRACK_FEATS,
    selections,
  };
})();

function searchUl(ul, input, stdDisplay = "grid") {
  let tracksLi = ul.getElementsByTagName("li");
  let filter = input.value.toUpperCase();

  for (let i = 0; i < tracksLi.length; i++) {
    let name = tracksLi[i].getElementsByClassName(config.CSS.CLASSES.name)[0];
    let nameTxt = name.textContent || name.innerText;
    if (nameTxt.toUpperCase().indexOf(filter) > -1) {
      tracksLi[i].style.display = stdDisplay;
    } else {
      tracksLi[i].style.display = "none";
    }
  }
}

// create custom promise
async function stall(stallTime = 3000) {
  await new Promise((resolve) => setTimeout(resolve, stallTime));
}

// TEST CODE START
console.log("Start long task");
stall().then(() => {
  console.log("Finished long task");
});
console.log("do other stuff:");
// TEST CODE END

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
  /*Adds a class to each element causing a transition to the changed css attributes
of the added class while still retaining unchanged attributes from original class.

This is done on set intervals.

@param {string} className - The class that all the transitioning elements contain
@param {string} classToTransitionToo - The class that all the transitioning elements will add
@param {number} animationInterval - The interval to wait between animation of elements
 */
  function intervalElementsTransitions(
    elementsToAnimate,
    classToTransitionToo,
    animationInterval
  ) {
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
  function addAnimateOnScroll() {
    const playlistsArea = document.getElementById("playlists-header");
    const tracksArea = document.getElementById("top-tracks-header");

    appearOnScrollObserver.observe(playlistsArea);
    appearOnScrollObserver.observe(tracksArea);
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
  function addTopTrackCardsSelectionEvent() {
    function onChange() {
      // cards displayed do not have the appear class because thats supposed to be added through animation,
      // so return the elements from .displayTrackCards and add the appear class to those elements' class list.
      let currTracks = trackActions.getCurrentlySelTopTracks();
      let cardHtmls = displayCardInfo.displayTrackCards(currTracks);

      cardHtmls.forEach((card) => {
        card.classList.add("appear");
      });
    }
    trackTimeRangeSelection.addEventListener("change", () => onChange());
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

      let currPlaylist = infoRetrieval.selectionLock.currSelectedVal;

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
      const currPlaylist = infoRetrieval.selectionLock.currSelectedVal;
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
            undonePlaylistId == infoRetrieval.selectionLock.currSelectedVal.id
          ) {
            // reload the playlist after adding tracks in order to show the tracks added back
            playlistActions.showExpandedPlaylist(
              infoRetrieval.selectionLock.currSelectedVal
            );
          }
        }
      );
    }
    const undoBtn = document
      .getElementById(config.CSS.IDs.playlistMods)
      .getElementsByTagName("button")[0];

    undoBtn.addEventListener("click", () => onClick());
  }
  function addTrackFeatureButtonEvents() {
    function onClick(btn, featBtns) {
      const feature = btn.getAttribute(config.CSS.ATTRIBUTES.dataSelection);
      let selectedFeat = chartsManager.TRACK_FEATS[feature];
      if (selectedFeat == undefined) {
        console.error(
          "The selected attribute " +
            feature +
            " from " +
            config.CSS.ATTRIBUTES.dataSelection +
            " is not valid. Occured in element(see next log):"
        );
        console.error(btn);
        return;
      }
      for (let i = 0; i < featBtns.length; i++) {
        let btn = featBtns[i];
        btn.classList.remove("selected");
      }
      btn.classList.add("selected");
      let currTracks = trackActions.getCurrentlySelTopTracks();
      chartsManager.selections.feature = selectedFeat;
      chartsManager.updateTracksChart(currTracks);
    }

    let featBtns = document
      .getElementById("feature-selections")
      .getElementsByTagName("button");
    for (let i = 0; i < featBtns.length; i++) {
      let btn = featBtns[i];
      btn.addEventListener("click", () => onClick(btn, featBtns));
    }
  }

  return {
    addExpandedPlaylistModsSearchbarEvent,
    addExpandedPlaylistModsOrderEvent,
    addDeleteRecentlyAddedTrackEvent,
    addUndoPlaylistTrackDeleteEvent,
    addTopTrackCardsSelectionEvent,
    addTrackFeatureButtonEvents,
  };
})();

(function () {
  obtainTokens()
    .then((hasToken) => {
      let getTokensSpinner = document.getElementById(
        config.CSS.IDs.getTokenLoadingSpinner
      );

      // remove token spinner because by this line we have obtained the token
      getTokensSpinner.parentNode.removeChild(getTokensSpinner);

      const infoContainer = document.getElementById(
        config.CSS.IDs.infoContainer
      );
      const allowAccessHeader = document.getElementById(
        config.CSS.IDs.allowAccessHeader
      );
      if (hasToken) {
        // if there is a token remove the allow access header from DOM
        allowAccessHeader.parentNode.removeChild(allowAccessHeader);
        createSpotifyLoginButton(true);
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
        // if there is no token show the allow access header and hide the info
        allowAccessHeader.style.display = "block";
        infoContainer.style.display = "none";
      }
    })
    .catch((err) => console.error(err));

  addEventListeners.addExpandedPlaylistModsSearchbarEvent();
  addEventListeners.addExpandedPlaylistModsOrderEvent();
  addEventListeners.addDeleteRecentlyAddedTrackEvent();
  addEventListeners.addUndoPlaylistTrackDeleteEvent();
  addEventListeners.addTopTrackCardsSelectionEvent();
  addEventListeners.addTrackFeatureButtonEvents();
})();

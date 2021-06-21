import Track from "./components/track.js";
import AsyncSelectionVerif from "./components/asyncSelectionVerif.js";
import { config } from "./config.js";

const trackTimeRangeSelection = document.getElementById(
  config.CSS.IDs.tracksTermSelections
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

const cardActions = (function () {
  // returns whether the card was succesfully clicked with all actions run
  function onCardClick(storedSelCardEl, selCardEl, corrObjList) {
    if (storedSelCardEl === selCardEl) {
      return { cardEl: null, corrObj: null, ok: false };
    }
    // get corrosponding playlist object using the elements id
    let corrObj = corrObjList.find((x) => x.cardId === selCardEl.id);
    // if there is an existing playlist selected, unselect it
    if (storedSelCardEl) {
      storedSelCardEl.classList.remove(config.CSS.CLASSES.selected);
    }

    // on click add the selected class onto the element which runs a transition
    selCardEl.classList.add(config.CSS.CLASSES.selected);
    return { selCardEl, corrObj: corrObj, ok: true };
  }

  return {
    onCardClick,
  };
})();

const trackActions = (function () {
  const selections = { trackTerm: "short-term" };
  // obtains all the features for each track in a given list
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
    let tracksVerSelected = selections.trackTerm;
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
  // MODIFY THIS WHEN USING CARD FLIPPING TO SHOW INFO
  function showTrackInfo(trackObj) {}
  // MODIFY THE ONTRACKCARDCLICK FUNCTION IN THIS FUNCTION WHEN USING CARD FLIPPING INSTEAD OF TURNING THE CARD GREEN
  function addOnTrackCardClick(trackObjs) {
    var storedSelTrackEl = null;
    function onTrackCardClick(trackCard, trackObjs) {
      let { selCardEl, corrObj, ok } = cardActions.onCardClick(
        storedSelTrackEl,
        trackCard,
        trackObjs
      );
      if (!ok) {
        return;
      }
      storedSelTrackEl = selCardEl;

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
  function getCurrSelTopTracks() {
    if (selections.trackTerm == "short-term") {
      return infoRetrieval.topTrackObjsShortTerm;
    } else if (selections.trackTerm == "medium-term") {
      return infoRetrieval.topTrackObjsMidTerm;
    } else if (selections.trackTerm == "long-term") {
      return infoRetrieval.topTrackObjsLongTerm;
    }
  }
  return {
    addOnTrackCardClick,
    getCurrSelTopTracks,
    loadFeaturesVerif,
    selections,
  };
})();

const infoRetrieval = (function () {
  // MOVE THIS TO PLAYLIST ACTIONS SCOPE
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

    // promise.all runs each promise in parallel before returning their values once theyre all done.
    // promise.all will also stop function execution if a error is thrown in any of the promises.

    // promise.settleAll will not throw error however it will store the state of each request. (rejected state is equivalent to a thrown error)
    let responses = await Promise.all([
      topArtistsReq,
      topTracksShortTermReq,
      topTracksMidTermReq,
      topTracksLongTermReq,
    ]);
    console.log(responses);

    // remove the info loading spinners as info has been loaded
    let infoSpinners = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.infoLoadingSpinners)
    );
    infoSpinners.forEach((spinner) => {
      spinner.parentNode.removeChild(spinner);
    });

    const shortTrackDatas = responses[1].res.data;
    const midTrackDatas = responses[2].res.data;
    const longTrackDatas = responses[3].res.data;
    loadDataToTrackLists(shortTrackDatas, midTrackDatas, longTrackDatas);

    displayCardInfo.initDisplay(topTrackObjsShortTerm);
  }
  return {
    getInitialInfo,
    topTrackObjsShortTerm,
    topTrackObjsMidTerm,
    topTrackObjsLongTerm,
  };
})();

const displayCardInfo = (function () {
  const tracksContainer = document.getElementById(
    config.CSS.IDs.trackCardsContainer
  );

  function initDisplay(trackObjs) {
    displayTrackCards(trackObjs);
  }
  function displayTrackCards(trackObjs, show = false) {
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

    if (show) {
      cardHtmls.forEach((card) => {
        card.classList.add("appear");
      });
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
    popularity: {
      value: "Popularity",
      data: null,
      definition:
        "Popularity is the value of how often this song has been listened too by everyone on spotify.",
    },
    valence: {
      value: "Valence",
      data: null,
      definition:
        "Higher valence sound more positive (e.g. happy, cheerful, euphoric). Lower valence sound more negative (e.g. sad, depressed, angry)",
    },
    danceability: {
      value: "Danceability",
      data: null,
      definition:
        "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, \
        rhythm stability, beat strength, and overall regularity",
    },
    instrumentalness: {
      value: "Instrumentalness",
      data: null,
      definition:
        "Instrumentalness represents the amount of vocals in the song. The closer it is to 100, the less vocals there are in the song.",
    },
    energy: {
      value: "Energy",
      data: null,
      definition:
        "Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy",
    },
    acousticness: {
      value: "Acousticness",
      data: null,
      definition:
        "Acousticness describes how acoustic a song is. Which is measured by the amount of the song that does not contain electrical amplification",
    },
  };
  const selections = { feature: TRACK_FEATS.popularity };

  function getNamesAndPopularity(trackObjs) {
    const names = trackObjs.map((track) => track.name);
    TRACK_FEATS.popularity.data = trackObjs.map((track) => track.popularity);
    return { names, popularities: TRACK_FEATS.popularity.data };
  }

  function updateFeatureData(featureList) {
    TRACK_FEATS.valence.data = featureList.map((features) =>
      Math.round(features.valence * 100)
    );
    TRACK_FEATS.danceability.data = featureList.map((features) =>
      Math.round(features.danceability * 100)
    );
    TRACK_FEATS.instrumentalness.data = featureList.map((features) =>
      Math.round(features.instrumentalness * 100)
    );
    TRACK_FEATS.energy.data = featureList.map((features) =>
      Math.round(features.energy * 100)
    );
    TRACK_FEATS.acousticness.data = featureList.map((features) =>
      Math.round(features.acousticness * 100)
    );
  }
  function generateTracksChart(trackObjs) {
    // display loading spinner, then load features of each track.
    let { names, popularities } = getNamesAndPopularity(trackObjs);
    trackActions.loadFeaturesVerif(trackObjs, (featureList) => {
      console.log(featureList);
      changeTracksChartExpl();
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
    let { names } = chartsManager.getNamesAndPopularity(trackObjs);
    // display loading spinner, then load features of each track.
    trackActions.loadFeaturesVerif(trackObjs, (featureList) => {
      // remove loading spinner for chart
      updateFeatureData(featureList);
      changeTracksChartExpl();
      let chart = charts.tracksChart;
      chart.data.labels = [];
      chart.data.datasets[0].data = [];

      chart.data.labels = names;
      chart.data.datasets[0].data = selections.feature.data;
      chart.data.datasets[0].label = selections.feature.value;
      chart.update();
    });
  }
  function changeTracksChartExpl() {
    const chartInfosEl = (function () {
      const chartInfoEl = document
        .getElementById(config.CSS.IDs.tracksData)
        .getElementsByClassName(config.CSS.CLASSES.chartInfo)[0];
      const featureDefEl = chartInfoEl
        .getElementsByClassName(config.CSS.CLASSES.featureDefinition)[0]
        .getElementsByTagName("h4")[0];

      return {
        chartInfoEl,
        featureDefEl,
      };
    })();
    chartInfosEl.featureDefEl.textContent = selections.feature.definition;
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
    const tracksArea = document.getElementById("top-tracks-header");
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

const addEventListeners = (function () {
  function addTopTrackCardsSelectionEvent() {
    function onChange() {
      // cards displayed do not have the appear class because thats supposed to be added through animation,
      // so return the elements from .displayTrackCards and add the appear class to those elements' class list.
      let currTracks = trackActions.getCurrSelTopTracks();
      displayCardInfo.displayTrackCards(currTracks, true);
    }
    trackTimeRangeSelection.addEventListener("change", () => onChange());
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
      let currTracks = trackActions.getCurrSelTopTracks();
      chartsManager.selections.feature = selectedFeat;
      chartsManager.updateTracksChart(currTracks);
    }

    let featBtns = document
      .getElementById(config.CSS.IDs.featureSelections)
      .getElementsByTagName("button");
    for (let i = 0; i < featBtns.length; i++) {
      let btn = featBtns[i];
      btn.addEventListener("click", () => onClick(btn, featBtns));
    }
  }
  function addTrackTermButtonEvents() {
    function onClick(btn, termBtns) {
      trackActions.selections.trackTerm = btn.getAttribute(
        config.CSS.ATTRIBUTES.dataSelection
      );
      for (let i = 0; i < termBtns.length; i++) {
        let btn = termBtns[i];
        btn.classList.remove("selected");
      }
      btn.classList.add("selected");
      let currTracks = trackActions.getCurrSelTopTracks();
      displayCardInfo.displayTrackCards(currTracks, true);
    }
    let trackTermBtns = document
      .getElementById(config.CSS.IDs.tracksTermSelections)
      .getElementsByTagName("button");
    for (let i = 0; i < trackTermBtns.length; i++) {
      let btn = trackTermBtns[i];
      btn.addEventListener("click", () => onClick(btn, trackTermBtns));
    }
  }

  return {
    addTopTrackCardsSelectionEvent,
    addTrackFeatureButtonEvents,
    addTrackTermButtonEvents,
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

  addEventListeners.addTopTrackCardsSelectionEvent();
  addEventListeners.addTrackFeatureButtonEvents();
  addEventListeners.addTrackTermButtonEvents();
})();

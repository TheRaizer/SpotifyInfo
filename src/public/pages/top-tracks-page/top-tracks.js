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

const DEFAULT_VIEWABLE_CARDS = 5;
const MAX_VIEWABLE_CARDS = 50;

const trackActions = (function () {
  const selectionVerif = new AsyncSelectionVerif();
  const cardActionsHandler = new CardActionsHandler(50);
  const selections = {
    numViewableCards: DEFAULT_VIEWABLE_CARDS,
    trackTerm: "short_term",
  };
  function addTrackCardListeners(trackObjs) {
    cardActionsHandler.clearSelectedEls();
    let trackCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.track)
    );

    trackCards.forEach((trackCard) => {
      trackCard.addEventListener("click", () =>
        cardActionsHandler.onCardClick(trackCard, trackObjs, null, true, false)
      );
      trackCard.addEventListener("mouseenter", () => {
        cardActionsHandler.scrollTextOnCardEnter(trackCard);
      });
      trackCard.addEventListener("mouseleave", () => {
        cardActionsHandler.scrollTextOnCardLeave(trackCard);
      });
    });
  }

  function getCurrSelTopTracks() {
    if (selections.trackTerm == "short_term") {
      return trackArrs.topTrackObjsShortTerm;
    } else if (selections.trackTerm == "medium_term") {
      return trackArrs.topTrackObjsMidTerm;
    } else if (selections.trackTerm == "long_term") {
      return trackArrs.topTrackObjsLongTerm;
    } else {
      throw new Error("Selected track term is invalid " + selections.trackTerm);
    }
  }

  /** Load the features of each track in the given arr from the
   * spotify web api and store them.
   *
   * @param {Array<Track>} trackArr - Array containing instances of Track whose features will be loaded.
   */
  async function loadFeatures(trackArr) {
    let ids = trackArr.map((track) => track.id);
    let res = await axios
      .get(config.URLs.getTrackFeatures + ids)
      .catch((err) => {
        throw err;
      });
    for (let i = 0; i < trackArr.length; i++) {
      let track = trackArr[i];
      let feats = res.data.audio_features[i];
      track.features = {
        danceability: feats.danceability,
        acousticness: feats.acousticness,
        instrumentalness: feats.instrumentalness,
        valence: feats.valence,
        energy: feats.energy,
      };
    }
  }
  function loadDatasToTrackArr(datas, trackArr) {
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
      trackArr.push(new Track(props));
    });
    return trackArr;
  }
  async function retrieveTracks(trackArr) {
    let { res, err } = await promiseHandler(
      axios.get(config.URLs.getTopTracks + selections.trackTerm)
    );
    if (err) {
      throw new Error(err);
    }
    loadDatasToTrackArr(res.data, trackArr);

    await promiseHandler(loadFeatures(trackArr));
  }
  return {
    addTrackCardListeners: addTrackCardListeners,
    getCurrSelTopTracks,
    retrieveTracks,
    selections,
    selectionVerif,
  };
})();

const trackArrs = (function () {
  const topTrackObjsShortTerm = [];
  const topTrackObjsMidTerm = [];
  const topTrackObjsLongTerm = [];

  return {
    topTrackObjsShortTerm,
    topTrackObjsMidTerm,
    topTrackObjsLongTerm,
  };
})();

const displayCardInfo = (function () {
  const tracksContainer = document.getElementById(
    config.CSS.IDs.trackCardsContainer
  );

  /** Show each element of a given className by adding the appear class.
   *
   * @param {String} className the class that each track card contains.
   */
  function makeCardsVisible(className) {
    let trackCards = tracksContainer.getElementsByClassName(className);
    let idx = 0;

    let interval = setInterval(() => {
      if (idx == trackCards.length) {
        clearInterval(interval);
        return;
      }
      let card = trackCards[idx];
      card.classList.add(config.CSS.CLASSES.appear);
      idx += 1;
    }, 80);
  }
  /** Generates the cards to the DOM then makes them visible
   *
   * @param {Array<Track>} trackObjs array of track objects whose cards should be generated.
   * @param {Boolean} autoAppear whether to show the card without animation or with animation.
   * @returns {Array<HTML>} array of the card elements.
   */
  function generateCards(trackObjs, autoAppear) {
    removeAllChildNodes(tracksContainer);
    let cardHtmls = [];

    // fill arr of card elements and append them to DOM
    let tracksDisplayed = [];
    for (let i = 0; i < trackObjs.length; i++) {
      let trackObj = trackObjs[i];
      if (i < trackActions.selections.numViewableCards) {
        let cardHtml = trackObj.getTrackCardHtml(i, autoAppear);
        tracksDisplayed.push(trackObj);
        cardHtmls.push(cardHtml);
        tracksContainer.appendChild(cardHtml);
      } else {
        break;
      }
    }

    trackActions.addTrackCardListeners(trackObjs);
    chartsManager.changeTracksChart(tracksDisplayed);
    if (!autoAppear) {
      makeCardsVisible(config.CSS.CLASSES.rankCard);
    }
    return cardHtmls;
  }
  /** Begins retrieving tracks then verifies it is the correct selected tracks.
   *
   * @param {Array<Track>} trackObjs array to load tracks into.
   */
  function startLoadingTracks(trackObjs) {
    // initially show the loading spinner
    const htmlString = `
            <div>
              <img src="${config.PATHS.spinner}" alt="Loading..." />
            </div>`;
    let spinnerEl = htmlToEl(htmlString);

    removeAllChildNodes(tracksContainer);
    tracksContainer.appendChild(spinnerEl);

    trackActions.retrieveTracks(trackObjs).then(() => {
      // after retrieving async verify if it is the same arr of trackObjs as what was selected
      if (!trackActions.selectionVerif.isValid(trackObjs)) {
        return;
      }
      return generateCards(trackObjs);
    });
  }

  /** Load track objects if not loaded, then generate cards with the objects.
   *
   * @param {Array<Track>} trackObjs - List of track objects whose cards should be generated or
   * empty list that should be filled when loading tracks.
   * @param {Boolean} autoAppear whether to show the cards without animation.
   * @returns {Array<HTML>} list of Card HTML's.
   */
  function displayTrackCards(trackObjs, autoAppear = false) {
    trackActions.selectionVerif.selectionChanged(trackObjs);
    if (trackObjs.length > 0) {
      return generateCards(trackObjs, autoAppear);
    } else {
      return startLoadingTracks(trackObjs);
    }
  }

  return {
    displayTrackCards,
  };
})();

/** The feature keys that are used in the 'feature' objectsobjects outputted by the spotify web api. */
const FEATURE_KEYS = {
  POPULARITY: "popularity",
  VALENCE: "valence",
  DANCEABILITY: "danceability",
  INSTRUMENTALNESS: "instrumentalness",
  ENERGY: "energy",
  ACOUSTICNESS: "acousticness",
};
Object.freeze(FEATURE_KEYS);

/** Manages a feature's information.*/
class Feature {
  constructor(featKey, definition) {
    this.featKey = featKey;
    this.data = null;
    this.EMA = 0;
    this.average = 0;
    this.definition = definition;
  }

  /** Calculate the arithemtic average of the data for this feature.
   *
   * @returns {Number} - The average calculated
   */
  calculateAverage() {
    let average = 0;
    this.data.forEach((val) => {
      average += val;
    });
    average /= this.data.length;
    this.average = Math.round(average);
  }
}

const chartsManager = (function () {
  const tracksChartEl = document.getElementById(config.CSS.IDs.tracksChart);
  const charts = {
    tracksChart: null,
  };
  const TRACK_FEATS = {
    popularity: new Feature(
      FEATURE_KEYS.POPULARITY,
      "Popularity is the value of how often this song has been arrened too by everyone on spotify."
    ),
    valence: new Feature(
      FEATURE_KEYS.VALENCE,
      "Higher valence sound more positive (e.g. happy, cheerful, euphoric). Lower valence sound more negative (e.g. sad, depressed, angry)."
    ),
    danceability: new Feature(
      FEATURE_KEYS.DANCEABILITY,
      "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, \
        rhythm stability, beat strength, and overall regularity."
    ),
    instrumentalness: new Feature(
      FEATURE_KEYS.INSTRUMENTALNESS,
      "Instrumentalness represents the amount of vocals in the song. The closer it is to 100, the less vocals there are in the song."
    ),
    energy: new Feature(
      FEATURE_KEYS.ENERGY,
      "Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy."
    ),
    acousticness: new Feature(
      FEATURE_KEYS.ACOUSTICNESS,
      "Acousticness describes how acoustic a song is. Which is measured by the amount of the song that does not contain electrical amplification."
    ),
  };
  const selections = {
    feature: TRACK_FEATS.popularity,
  };

  function changeTracksChart(trackObjs) {
    if (charts.tracksChart == null) {
      generateTracksChart(trackObjs);
    } else {
      updateTracksChart(trackObjs);
    }
  }
  function getNamesAndPopularity(trackObjs) {
    const names = trackObjs.map((track) => track.name);
    TRACK_FEATS.popularity.data = trackObjs.map((track) => track.popularity);
    TRACK_FEATS.popularity.calculateAverage();
    return {
      names,
      popularities: TRACK_FEATS.popularity.data,
    };
  }

  /** Recalculate/Update the attributes for each feature.
   *
   * @param {Array} featArr - contains the objects that hold features for each Track instance
   */
  function updateFeatureAttr(featArr) {
    const keys = Object.keys(TRACK_FEATS);
    keys.forEach((key) => {
      // avoid the popularity key as that is not contained in a tracks features
      if (key != FEATURE_KEYS.POPULARITY) {
        const feat = TRACK_FEATS[key];
        feat.data = featArr.map((features) =>
          Math.round(features[feat.featKey] * 100)
        );
        feat.calculateAverage();
      }
    });
  }

  /** Creates the chart.js chart with the initial trackObjects given.
   *
   * @param {Array<Track>} trackObjs tracks whose features will be used in the chart.
   */
  function generateTracksChart(trackObjs) {
    let names = updateInfos(trackObjs);

    // remove loading spinner for chart
    charts.tracksChart = new Chart(tracksChartEl, {
      type: "bar",
      data: {
        labels: names,
        datasets: [
          {
            label: capitalizeFirstLetter(selections.feature.featKey),
            data: selections.feature.data,
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
        responsive: true,
        maintainAspectRatio: false,
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
            ticks: {
              callback: function (value) {
                let val = this.getLabelForValue(value).substr(0, 20);
                if (val.length == this.getLabelForValue(value).length) {
                  return val;
                } else {
                  return val + "...";
                }
              },
            },
            grid: {
              color: "#4b4b4ba9",
            },
          },
        },
      },
    });
  }

  /** Update the infos with the features of the given Track's.
   *
   * @param {Array<Track>} trackObjs tracks whose features will be used to update info.
   * @returns {Array<String>} array holding the name of each track.
   */
  function updateInfos(trackObjs) {
    let { names } = getNamesAndPopularity(trackObjs);
    let featureArr = trackObjs.map((track) => track.features);
    updateFeatureAttr(featureArr);
    updateTracksChartInfo();
    return names;
  }

  /** Update the chart.js chart, feature attributes, and chart info
   *  with the given track object's feature data.
   *
   * @param {Array<Track>} trackObjs array of Track's whose feature data will update the chart.
   */
  function updateTracksChart(trackObjs) {
    let names = updateInfos(trackObjs);
    let chart = charts.tracksChart;
    chart.data.labels = [];
    chart.data.datasets[0].data = [];

    chart.data.labels = names;
    chart.data.datasets[0].data = selections.feature.data;
    chart.data.datasets[0].label = capitalizeFirstLetter(
      selections.feature.featKey
    );
    chart.update();
  }

  /** Update the info in the chart info section of the page. */
  function updateTracksChartInfo() {
    const featDef = document.getElementById(config.CSS.IDs.featDef);
    const featAverage = document.getElementById(config.CSS.IDs.featAverage);
    featDef.textContent = selections.feature.definition;
    featAverage.textContent = "Average: " + selections.feature.average;
  }

  return {
    generateTracksChart,
    updateTracksChart,
    getNamesAndPopularity,
    changeTracksChart,
    charts,
    TRACK_FEATS,
    selections,
  };
})();

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const addEventListeners = (function () {
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
      chartsManager.updateTracksChart(
        currTracks.slice(0, trackActions.selections.numViewableCards)
      );
    }

    let featBtns = document
      .getElementById(config.CSS.IDs.featureSelections)
      .getElementsByTagName("button");
    for (let i = 0; i < featBtns.length; i++) {
      let btn = featBtns[i];
      btn.addEventListener("click", () => onClick(btn, featBtns));
    }
  }

  function resetViewableCards() {
    let viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks);
    trackActions.selections.numViewableCards = DEFAULT_VIEWABLE_CARDS;
    viewAllEl.textContent = "See All 50";
  }

  function addTrackTermButtonEvents() {
    function onClick(btn, termBtns) {
      resetViewableCards();
      trackActions.selections.trackTerm = btn.getAttribute(
        config.CSS.ATTRIBUTES.dataSelection
      );

      for (let i = 0; i < termBtns.length; i++) {
        let btn = termBtns[i];
        btn.classList.remove("selected");
      }

      btn.classList.add("selected");
      let currTracks = trackActions.getCurrSelTopTracks();
      displayCardInfo.displayTrackCards(currTracks);
    }

    let trackTermBtns = document
      .getElementById(config.CSS.IDs.tracksTermSelections)
      .getElementsByTagName("button");
    for (let i = 0; i < trackTermBtns.length; i++) {
      let btn = trackTermBtns[i];
      btn.addEventListener("click", () => onClick(btn, trackTermBtns));
    }
  }

  function addExpandDescOnHoverEvents() {
    const DEFAULT_FLEX_BASIS = 60;
    const TOP_PADDING = 20;
    const BTM_PADDING = 10;
    // get each description area for the chart info
    const descDivs = document.getElementsByClassName(
      config.CSS.CLASSES.chartInfo
    )[0].children;

    for (let i = 0; i < descDivs.length; i++) {
      // obtain the description and the drop down button
      let desc = descDivs[i];
      let textContainer = desc.getElementsByClassName(
        config.CSS.CLASSES.expandableTxtContainer
      )[0];
      if (!textContainer) {
        continue;
      }
      let ellipsisText = textContainer.children[0];
      desc.addEventListener("mouseenter", () => {
        ellipsisText.classList.remove(config.CSS.CLASSES.ellipsisWrap);
        desc.style.flexBasis =
          TOP_PADDING + BTM_PADDING + textContainer.offsetHeight + "px";
      });
      desc.addEventListener("mouseleave", () => {
        ellipsisText.classList.add(config.CSS.CLASSES.ellipsisWrap);
        desc.style.flexBasis = DEFAULT_FLEX_BASIS + "px";
      });
    }
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
    addTrackFeatureButtonEvents,
    addTrackTermButtonEvents,
    addExpandDescOnHoverEvents,
    addViewAllTracksEvent,
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
      trackActions.selections.trackTerm = "short_term";
      displayCardInfo.displayTrackCards(trackArrs.topTrackObjsShortTerm);
    } else {
      // if there is no token redirect to allow access page
      window.location.href = "http://localhost:3000/";
    }
  }

  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken)
  );

  addEventListeners.addTrackFeatureButtonEvents();
  addEventListeners.addTrackTermButtonEvents();
  addEventListeners.addExpandDescOnHoverEvents();
  addEventListeners.addViewAllTracksEvent();
})();

import Track, { generateTracksFromData } from "../../components/track.js";
import {
  config,
  promiseHandler,
  htmlToEl,
  capitalizeFirstLetter,
  removeAllChildNodes,
  animationControl,
} from "../../config.js";
import SelectableTabEls from "../../components/SelectableTabEls.js";
import {
  checkIfHasTokens,
  onSuccessfulTokenCall,
} from "../../manage-tokens.js";
import AsyncSelectionVerif from "../../components/asyncSelectionVerif.js";
import CardActionsHandler from "../../card-actions.js";

const DEFAULT_VIEWABLE_CARDS = 5;
const MAX_VIEWABLE_CARDS = 50;

const trackActions = (function () {
  const selectionVerif = new AsyncSelectionVerif();
  const cardActionsHandler = new CardActionsHandler(MAX_VIEWABLE_CARDS);
  const selections = {
    numViewableCards: DEFAULT_VIEWABLE_CARDS,
    term: "short_term",
  };
  function addTrackCardListeners(trackArr) {
    cardActionsHandler.clearSelectedEls();
    let trackCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.track)
    );

    trackCards.forEach((trackCard) => {
      trackCard.addEventListener("click", () =>
        cardActionsHandler.onCardClick(trackCard, trackArr, null, true, false)
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
    if (selections.term == "short_term") {
      return trackArrs.topTrackObjsShortTerm;
    } else if (selections.term == "medium_term") {
      return trackArrs.topTrackObjsMidTerm;
    } else if (selections.term == "long_term") {
      return trackArrs.topTrackObjsLongTerm;
    } else {
      throw new Error("Selected track term is invalid " + selections.term);
    }
  }

  /** Load the features of multiple tracks at once into the given arr from the
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
  async function retrieveTracks(trackArr) {
    let { res, err } = await promiseHandler(
      axios.get(config.URLs.getTopTracks + selections.term)
    );
    if (err) {
      throw new Error(err);
    }
    generateTracksFromData(res.data, trackArr);

    await promiseHandler(loadFeatures(trackArr));
  }
  return {
    addTrackCardListeners,
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

  /** Generates the cards to the DOM then makes them visible
   *
   * @param {Array<Track>} trackArr array of track objects whose cards should be generated.
   * @param {Boolean} unanimatedAppear whether to show the card without animation or with animation.
   * @returns {Array<HTMLElement>} array of the card elements.
   */
  function generateCards(trackArr, unanimatedAppear) {
    removeAllChildNodes(tracksContainer);
    let cardHtmls = [];

    // fill arr of card elements and append them to DOM
    let tracksDisplayed = [];
    for (let i = 0; i < trackArr.length; i++) {
      let trackObj = trackArr[i];
      if (i < trackActions.selections.numViewableCards) {
        let cardHtml = trackObj.getTrackCardHtml(i, unanimatedAppear);
        tracksDisplayed.push(trackObj);
        cardHtmls.push(cardHtml);
        tracksContainer.appendChild(cardHtml);
      } else {
        break;
      }
    }

    trackActions.addTrackCardListeners(trackArr);
    featureManager.changeTracksChart(tracksDisplayed);

    if (!unanimatedAppear) {
      animationControl.animateAttributes(
        "." + config.CSS.CLASSES.rankCard,
        config.CSS.CLASSES.appear,
        25
      );
    }
    return cardHtmls;
  }
  /** Begins retrieving tracks then verifies it is the correct selected tracks.
   *
   * @param {Array<Track>} trackArr array to load tracks into.
   */
  function startLoadingTracks(trackArr) {
    // initially show the loading spinner
    const htmlString = `
            <div>
              <img src="${config.PATHS.spinner}" alt="Loading..." />
            </div>`;
    let spinnerEl = htmlToEl(htmlString);

    removeAllChildNodes(tracksContainer);
    tracksContainer.appendChild(spinnerEl);

    trackActions.retrieveTracks(trackArr).then(() => {
      // after retrieving async verify if it is the same arr of trackObjs as what was selected
      if (!trackActions.selectionVerif.isValid(trackArr)) {
        return;
      }
      return generateCards(trackArr, false);
    });
  }

  /** Load track objects if not loaded, then generate cards with the objects.
   *
   * @param {Array<Track>} trackArr - List of track objects whose cards should be generated or
   * empty list that should be filled when loading tracks.
   * @param {Boolean} autoAppear whether to show the cards without animation.
   * @returns {Array<HTMLElement>} list of Card HTMLElement's.
   */
  function displayTrackCards(trackArr, autoAppear = false) {
    trackActions.selectionVerif.selectionChanged(trackArr);
    if (trackArr.length > 0) {
      return generateCards(trackArr, autoAppear);
    } else {
      return startLoadingTracks(trackArr);
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
    this.mean = 0;
    this.std = 0;
    this.definition = definition;
  }

  setData(data) {
    this.data = data;
    this.calculateAverageAndStd();
  }

  /** Calculate the arithemtic average of the data for this feature. */
  calculateAverageAndStd() {
    this.calculateAverage();
    this.calculateStd();
  }
  calculateAverage() {
    let mean = 0;

    this.data.forEach((val) => {
      mean += val;
    });
    mean /= this.data.length;

    this.mean = Math.round(mean);
  }

  calculateStd() {
    let sum = 0;

    this.data.forEach((val) => {
      let distance = Math.abs(val - this.mean) ** 2;
      sum += distance;
    });
    sum /= this.data.length;

    this.std = Math.sqrt(sum);
  }
}

const featureManager = (function () {
  const tracksChartEl = document.getElementById(config.CSS.IDs.tracksChart);
  const FEAT_HIGH = 60;
  const FEAT_LOW = 40;
  const charts = {
    tracksChart: null,
  };
  const TRACK_FEATS = {
    popularity: new Feature(
      FEATURE_KEYS.POPULARITY,
      "Popularity is the value of how often this song has been listened too by everyone on spotify."
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
    updateFeatData(trackObjs);
    if (charts.tracksChart == null) {
      generateTracksChart(trackObjs);
    } else {
      updateTracksChart(trackObjs);
    }
  }
  function getNamesAndPopularity(trackObjs) {
    const names = trackObjs.map((track) => track.name);
    TRACK_FEATS.popularity.setData(trackObjs.map((track) => track.popularity));
    return {
      names,
      popularities: TRACK_FEATS.popularity.data,
    };
  }

  /** Recalculate/Update the attributes for each feature.
   *
   * @param {Array} featArr - contains the objects that hold features for each Track instance
   */
  function updateFeaturesAttrs(featArr) {
    const keys = Object.keys(TRACK_FEATS);
    keys.forEach((key) => {
      // avoid the popularity key as that is not contained in a tracks features
      if (key != FEATURE_KEYS.POPULARITY) {
        const feat = TRACK_FEATS[key];
        feat.setData(
          featArr.map((features) => Math.round(features[feat.featKey] * 100))
        );
      }
    });
  }

  /** Creates the chart.js chart with the initial trackObjects given.
   *
   * @param {Array<Track>} trackObjs tracks whose features will be used in the chart.
   */
  function generateTracksChart(trackObjs) {
    let names = updateFeatData(trackObjs);
    updateTracksChartInfo();

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

  /** Update the feature data using the given tracks.
   *
   * @param {Array<Track>} trackObjs tracks whose features will be used to update the data.
   * @returns {Array<String>} array holding the name of each track.
   */
  function updateFeatData(trackObjs) {
    let { names } = getNamesAndPopularity(trackObjs);
    let featureArr = trackObjs.map((track) => track.features);
    updateFeaturesAttrs(featureArr);
    generateEmojis();
    return names;
  }

  /** Update the chart.js chart, feature attributes, and chart info
   *  with the given track object's feature data.
   *
   * @param {Array<Track>} trackObjs array of Track's whose feature data will update the chart.
   */
  function updateTracksChart(trackObjs) {
    let { names } = getNamesAndPopularity(trackObjs);
    updateTracksChartInfo();

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
    let selFeat = selections.feature;

    function computeTendency() {
      if (selFeat.mean <= FEAT_LOW) {
        featAverage.textContent =
          "On average you tend to like tracks with LESS " +
          selFeat.featKey +
          ".";
      } else if (selFeat.mean >= FEAT_HIGH) {
        featAverage.textContent =
          "On average you tend to like tracks with MORE " +
          selFeat.featKey +
          ".";
      } else {
        featAverage.textContent =
          "On average you have a NEUTRAL tendency towards a track's " +
          selFeat.featKey +
          ".";
      }

      if (selFeat.std > 15) {
        featAverage.textContent +=
          " However some tracks vary GREATLY from others.";
      } else if (selFeat.std > 10) {
        featAverage.textContent +=
          " However some tracks vary SLIGHTLY from others.";
      }
    }
    const featDef = document.getElementById(config.CSS.IDs.featDef);
    const featAverage = document.getElementById(config.CSS.IDs.featAverage);
    featDef.textContent = selFeat.definition;
    computeTendency();
  }

  function generateEmojis() {
    const emojiHelpers = (function () {
      function popularityEmoji() {
        if (TRACK_FEATS.popularity.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.sheepEmoji));
        } else if (TRACK_FEATS.popularity.mean <= FEAT_LOW) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.wolfEmoji));
        } else {
        }
      }
      function valenceEmoji() {
        if (TRACK_FEATS.valence.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.happyEmoji));
        } else if (TRACK_FEATS.valence.mean <= FEAT_LOW) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.sad));
        } else {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.neutralEmoji));
        }
      }
      function acousticEmoji() {
        if (TRACK_FEATS.acousticness.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.acousticEmoji));
        } else if (TRACK_FEATS.acousticness.mean <= FEAT_LOW) {
          emojiContainer.appendChild(
            getEmojiHtml(config.PATHS.nonAcousticEmoji)
          );
        } else {
        }
      }
      function instrumentalEmoji() {
        if (TRACK_FEATS.instrumentalness.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(
            getEmojiHtml(config.PATHS.instrumentEmoji)
          );
        } else if (TRACK_FEATS.instrumentalness.mean <= FEAT_LOW) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.singerEmoji));
        } else {
        }
      }
      function danceEmoji() {
        if (TRACK_FEATS.danceability.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.dancingEmoji));
        } else if (TRACK_FEATS.danceability.mean <= FEAT_LOW) {
        } else {
        }
      }
      function getEmojiHtml(path) {
        let html = `<img src=${path} alt="emoji"/>`;

        return htmlToEl(html);
      }
      return {
        popularityEmoji,
        valenceEmoji,
        acousticEmoji,
        instrumentalEmoji,
        danceEmoji,
      };
    })();

    const emojiContainer = document.getElementById(config.CSS.IDs.emojis);
    removeAllChildNodes(emojiContainer);
    Object.entries(emojiHelpers).forEach(([, generator]) => {
      generator();
    });
  }

  return {
    updateTracksChart,
    changeTracksChart,
    updateFeatData,
    TRACK_FEATS,
    selections,
  };
})();

const addEventListeners = (function () {
  const selections = {
    featureTabManager: new SelectableTabEls(
      document
        .getElementById(config.CSS.IDs.featureSelections)
        .getElementsByTagName("button")[0], // first tab is selected first by default
      document
        .getElementById(config.CSS.IDs.featureSelections)
        .getElementsByClassName(config.CSS.CLASSES.borderCover)[0] // first tab is selected first by default
    ),
    termTabManager: new SelectableTabEls(
      document
        .getElementById(config.CSS.IDs.tracksTermSelections)
        .getElementsByTagName("button")[0], // first tab is selected first by default
      document
        .getElementById(config.CSS.IDs.tracksTermSelections)
        .getElementsByClassName(config.CSS.CLASSES.borderCover)[0] // first tab is selected first by default
    ),
  };
  function addTrackFeatureButtonEvents() {
    function onClick(btn, borderCover) {
      const feature = btn.getAttribute(config.CSS.ATTRIBUTES.dataSelection);
      let selectedFeat = featureManager.TRACK_FEATS[feature];
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
      selections.featureTabManager.selectNewTab(btn, borderCover);

      let currTracks = trackActions.getCurrSelTopTracks();
      featureManager.selections.feature = selectedFeat;
      featureManager.updateTracksChart(
        currTracks.slice(0, trackActions.selections.numViewableCards)
      );
    }

    const featBtns = document
      .getElementById(config.CSS.IDs.featureSelections)
      .getElementsByTagName("button");
    const featBorderCovers = document
      .getElementById(config.CSS.IDs.featureSelections)
      .getElementsByClassName(config.CSS.CLASSES.borderCover);
    if (featBtns.length != featBorderCovers.length) {
      console.error("Not all feat buttons contain a border cover");
      return;
    }

    for (let i = 0; i < featBtns.length; i++) {
      let btn = featBtns[i];
      let borderCover = featBorderCovers[i];
      btn.addEventListener("click", () => onClick(btn, borderCover));
    }
  }

  function addTrackTermButtonEvents() {
    function onClick(btn, borderCover) {
      trackActions.selections.term = btn.getAttribute(
        config.CSS.ATTRIBUTES.dataSelection
      );
      selections.termTabManager.selectNewTab(btn, borderCover);

      let currTracks = trackActions.getCurrSelTopTracks();
      displayCardInfo.displayTrackCards(currTracks);
    }

    const trackTermBtns = document
      .getElementById(config.CSS.IDs.tracksTermSelections)
      .getElementsByTagName("button");
    const trackTermBorderCovers = document
      .getElementById(config.CSS.IDs.tracksTermSelections)
      .getElementsByClassName(config.CSS.CLASSES.borderCover);

    if (trackTermBorderCovers.length != trackTermBtns.length) {
      console.error("Not all track term buttons contain a border cover");
      return;
    }
    for (let i = 0; i < trackTermBtns.length; i++) {
      let btn = trackTermBtns[i];
      let borderCover = trackTermBorderCovers[i];
      btn.addEventListener("click", () => onClick(btn, borderCover));
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
    addTrackFeatureButtonEvents,
    addTrackTermButtonEvents,
    addExpandDescOnHoverEvents,
    addViewAllTracksEvent,
  };
})();

(function () {
  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken, () => {
      // when entering the page always show short term tracks first
      trackActions.selections.term = "short_term";
      displayCardInfo.displayTrackCards(trackArrs.topTrackObjsShortTerm);
    })
  );

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener();
  });
})();

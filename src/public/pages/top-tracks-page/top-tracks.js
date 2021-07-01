import Track from "../../components/track.js";
import { config, promiseHandler, htmlToEl } from "../../config.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";

const trackTimeRangeSelection = document.getElementById(
  config.CSS.IDs.tracksTermSelections
);

const cardActions = (function () {
  // returns whether the card was succesfully clicked with all actions run
  function onCardClick(storedSelCardEl, selCardEl, corrObjList) {
    if (storedSelCardEl === selCardEl) {
      return {
        cardEl: null,
        corrObj: null,
        ok: false,
      };
    }
    // get corrosponding playlist object using the elements id
    let corrObj = corrObjList.find((x) => x.cardId === selCardEl.id);
    // if there is an existing playlist selected, unselect it
    if (storedSelCardEl) {
      storedSelCardEl.classList.remove(config.CSS.CLASSES.selected);
    }

    // on click add the selected class onto the element which runs a transition
    selCardEl.classList.add(config.CSS.CLASSES.selected);
    return {
      selCardEl,
      corrObj: corrObj,
      ok: true,
    };
  }

  return {
    onCardClick,
  };
})();

const trackActions = (function () {
  const selections = {
    trackTerm: "short_term",
  };
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
    if (selections.trackTerm == "short_term") {
      return infoRetrieval.topTrackObjsShortTerm;
    } else if (selections.trackTerm == "medium_term") {
      return infoRetrieval.topTrackObjsMidTerm;
    } else if (selections.trackTerm == "long_term") {
      return infoRetrieval.topTrackObjsLongTerm;
    }
  }

  function getFeatLoadingPromises(tracks) {
    let promiseList = [];
    tracks.forEach((track) => {
      promiseList.push(track.loadFeatures());
    });

    return promiseList;
  }
  return {
    addOnTrackCardClick,
    getCurrSelTopTracks,
    getFeatLoadingPromises,
    selections,
  };
})();

const infoRetrieval = (function () {
  // MOVE THIS TO PLAYLIST ACTIONS SCOPE
  const topTrackObjsShortTerm = [];
  const topTrackObjsMidTerm = [];
  const topTrackObjsLongTerm = [];

  function loadDatasToTrackList(datas, trackList) {
    datas.forEach((data) => {
      let props = {
        name: data.name,
        images: data.album.images,
        duration: data.duration_ms,
        uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
        popularity: data.popularity,
        releaseDate: data.album.release_date,
        id: data.id,
      };
      trackList.push(new Track(props));
    });
    return trackList;
  }

  async function retrieveTracks(trackList) {
    let { res, err } = await promiseHandler(
      axios.get(config.URLs.getTopTracks + trackActions.selections.trackTerm)
    );
    if (err) {
      throw new Error(err);
    }
    loadDatasToTrackList(res.data, trackList);
    let promiseList = trackActions.getFeatLoadingPromises(trackList);
    await Promise.all(promiseList);
  }
  return {
    retrieveTracks,
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

  function makeCardsVisible(className) {
    let trackCards = tracksContainer.getElementsByClassName(className);
    for (let i = 0; i < trackCards.length; i++) {
      let trackCard = trackCards[i];
      trackCard.classList.add(config.CSS.CLASSES.appear);
    }
  }

  function showCards(trackObjs) {
    let cardHtmls = [];

    trackObjs.map((trackObj, idx) => {
      let cardHtml = trackObj.getTrackCardHtml(idx);
      cardHtmls.push(cardHtml);
      tracksContainer.appendChild(cardHtml);
    });

    trackActions.addOnTrackCardClick(trackObjs);
    chartsManager.changeTracksChart(trackObjs);
    makeCardsVisible(config.CSS.CLASSES.track);
    return cardHtmls;
  }

  function startLoadingTracks(trackObjs) {
    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="200pxLoadingSpinner.svg" />
            </li>`;
    let spinnerEl = htmlToEl(htmlString);

    removeAllChildNodes(tracksContainer);
    tracksContainer.appendChild(spinnerEl);

    infoRetrieval.retrieveTracks(trackObjs);
  }

  function displayTrackCards(trackObjs) {
    if (trackObjs.length > 0) {
      return showCards(trackObjs);
    } else {
      startLoadingTracks(trackObjs);
    }
  }

  return {
    displayTrackCards,
    initDisplay,
  };
})();

const chartsManager = (function () {
  const tracksChartEl = document.getElementById(config.CSS.IDs.tracksChart);
  const charts = {
    tracksChart: null,
  };
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
    return {
      names,
      popularities: TRACK_FEATS.popularity.data,
    };
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
    let { names } = getNamesAndPopularity(trackObjs);
    trackObjs.map((track) => track.features);
    changeTracksChartExpl();
    // remove loading spinner for chart
    charts.tracksChart = new Chart(tracksChartEl, {
      type: "bar",
      data: {
        labels: names,
        datasets: [
          {
            label: selections.feature.value,
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
  }

  function updateTracksChart(trackObjs) {
    let { names } = chartsManager.getNamesAndPopularity(trackObjs);
    let featureList = trackObjs.map((track) => track.features);
    updateFeatureData(featureList);
    changeTracksChartExpl();
    let chart = charts.tracksChart;
    chart.data.labels = [];
    chart.data.datasets[0].data = [];

    chart.data.labels = names;
    chart.data.datasets[0].data = selections.feature.data;
    chart.data.datasets[0].label = selections.feature.value;
    chart.update();
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
  function addTopTrackCardsSelectionEvent() {
    function onChange() {
      // cards displayed do not have the appear class because thats supposed to be added through animation,
      // so return the elements from .displayTrackCards and add the appear class to those elements' class list.
      let currTracks = trackActions.getCurrSelTopTracks();
      displayCardInfo.displayTrackCards(currTracks);
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

  return {
    addTopTrackCardsSelectionEvent,
    addTrackFeatureButtonEvents,
    addTrackTermButtonEvents,
  };
})();

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
        displayCardInfo.displayTrackCards(infoRetrieval.topTrackObjsShortTerm);
      } else {
        // if there is no token redirect to allow access page
        window.location.href = "http://localhost:3000/";
      }
    })
    .catch((err) => console.error(err));

  addEventListeners.addTopTrackCardsSelectionEvent();
  addEventListeners.addTrackFeatureButtonEvents();
  addEventListeners.addTrackTermButtonEvents();
})();

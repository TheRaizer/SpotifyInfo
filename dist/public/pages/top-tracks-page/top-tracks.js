"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const track_1 = require("../../components/track");
const config_1 = require("../../config");
const SelectableTabEls_1 = __importDefault(require("../../components/SelectableTabEls"));
const manage_tokens_1 = require("../../manage-tokens");
const asyncSelectionVerif_1 = __importDefault(require("../../components/asyncSelectionVerif"));
const card_actions_1 = __importDefault(require("../../components/card-actions"));
const axios_1 = __importDefault(require("axios"));
const chart_js_1 = require("chart.js");
const save_load_term_1 = require("../../components/save-load-term");
chart_js_1.Chart.register(chart_js_1.LinearScale, chart_js_1.CategoryScale, chart_js_1.BarController, chart_js_1.BarElement);
const DEFAULT_VIEWABLE_CARDS = 5;
const MAX_VIEWABLE_CARDS = 50;
const trackActions = (function () {
    const selectionVerif = new asyncSelectionVerif_1.default();
    const cardActionsHandler = new card_actions_1.default(MAX_VIEWABLE_CARDS);
    const selections = {
        numViewableCards: DEFAULT_VIEWABLE_CARDS,
        term: save_load_term_1.TERMS.SHORT_TERM
    };
    function addTrackCardListeners(trackArr) {
        const trackCards = Array.from(document.getElementsByClassName(config_1.config.CSS.CLASSES.track));
        cardActionsHandler.addAllEventListeners(trackCards, trackArr, null, true, false);
    }
    function getCurrSelTopTracks() {
        if (selections.term === save_load_term_1.TERMS.SHORT_TERM) {
            return trackArrs.topTrackObjsShortTerm;
        }
        else if (selections.term === save_load_term_1.TERMS.MID_TERM) {
            return trackArrs.topTrackObjsMidTerm;
        }
        else if (selections.term === save_load_term_1.TERMS.LONG_TERM) {
            return trackArrs.topTrackObjsLongTerm;
        }
        else {
            throw new Error('Selected track term is invalid ' + selections.term);
        }
    }
    /** Load the features of multiple tracks at once into the given arr from the
     * spotify web api and store them.
     *
     * @param {Array<Track>} trackArr - Array containing instances of Track whose features will be loaded.
     */
    function loadFeatures(trackArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const ids = trackArr.map((track) => track.id);
            const res = yield axios_1.default
                .get(config_1.config.URLs.getTrackFeatures + ids)
                .catch((err) => {
                throw err;
            });
            for (let i = 0; i < trackArr.length; i++) {
                const track = trackArr[i];
                const feats = res.data.audio_features[i];
                track.features = {
                    danceability: feats.danceability,
                    acousticness: feats.acousticness,
                    instrumentalness: feats.instrumentalness,
                    valence: feats.valence,
                    energy: feats.energy
                };
            }
        });
    }
    function retrieveTracks(trackArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const { res } = yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getTopTracks + selections.term), () => { }, () => {
                throw new Error('Issue retrieving tracks');
            });
            (0, track_1.generateTracksFromData)(res === null || res === void 0 ? void 0 : res.data, trackArr);
            yield (0, config_1.promiseHandler)(loadFeatures(trackArr), () => { }, () => {
                throw new Error('Issue retrieving tracks');
            });
        });
    }
    return {
        addTrackCardListeners,
        getCurrSelTopTracks,
        retrieveTracks,
        selections,
        selectionVerif
    };
})();
const trackArrs = (function () {
    const topTrackObjsShortTerm = [];
    const topTrackObjsMidTerm = [];
    const topTrackObjsLongTerm = [];
    return {
        topTrackObjsShortTerm,
        topTrackObjsMidTerm,
        topTrackObjsLongTerm
    };
})();
const displayCardInfo = (function () {
    const tracksContainer = document.getElementById(config_1.config.CSS.IDs.trackCardsContainer);
    /** Generates the cards to the DOM then makes them visible
     *
     * @param {Array<Track>} trackArr array of track objects whose cards should be generated.
     * @param {Boolean} unanimatedAppear whether to show the card without animation or with animation.
     * @returns {Array<HTMLElement>} array of the card elements.
     */
    function generateCards(trackArr) {
        (0, config_1.removeAllChildNodes)(tracksContainer);
        const cardHtmls = [];
        // array is used to update chart with the shown cards
        const tracksDisplayed = [];
        for (let i = 0; i < trackArr.length; i++) {
            const trackObj = trackArr[i];
            const cardHtml = trackObj.getTrackCardHtml(i);
            cardHtmls.push(cardHtml);
            tracksContainer === null || tracksContainer === void 0 ? void 0 : tracksContainer.appendChild(cardHtml);
            if (i < trackActions.selections.numViewableCards) {
                tracksDisplayed.push(trackObj);
            }
            else {
                // make the card html invisible
                cardHtml.classList.add(config_1.config.CSS.CLASSES.displayNone);
            }
        }
        trackActions.addTrackCardListeners(trackArr);
        featureManager.changeTracksChart(tracksDisplayed);
        // set appear class on all cards, even though some are not going to be visible
        config_1.animationControl.animateAttributes('.' + config_1.config.CSS.CLASSES.rankCard, config_1.config.CSS.CLASSES.appear, 5);
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
              <img src="${config_1.config.PATHS.spinner}" alt="Loading..." />
            </div>`;
        const spinnerEl = (0, config_1.htmlToEl)(htmlString);
        (0, config_1.removeAllChildNodes)(tracksContainer);
        tracksContainer === null || tracksContainer === void 0 ? void 0 : tracksContainer.appendChild(spinnerEl);
        trackActions.retrieveTracks(trackArr).then(() => {
            // after retrieving async verify if it is the same arr of trackObjs as what was selected
            if (!trackActions.selectionVerif.isValid(trackArr)) {
                return;
            }
            return generateCards(trackArr);
        }).catch((err) => {
            throw new Error(err);
        });
    }
    /** Load track objects if not loaded, then generate cards with the objects.
     *
     * @param {Array<Track>} trackArr - List of track objects whose cards should be generated or
     * empty list that should be filled when loading tracks.
     * @param {Boolean} autoAppear whether to show the cards without animation.
     * @returns {Array<HTMLElement>} list of Card HTMLElement's.
     */
    function displayTrackCards(trackArr) {
        trackActions.selectionVerif.selectionChanged(trackArr);
        if (trackArr.length > 0) {
            return generateCards(trackArr);
        }
        else {
            return startLoadingTracks(trackArr);
        }
    }
    /**
     * Removes a css class off a given number of cards in order to make the visible.
     * @param numToDisplay the number of cards to display
     * @param trackArr the array of tracks that are currently displayed
     */
    function removeDisplayNoneClass(numToDisplay, trackArr) {
        const cards = tracksContainer === null || tracksContainer === void 0 ? void 0 : tracksContainer.childNodes;
        if (!cards || trackArr.length !== cards.length) {
            throw new Error('track array length and cards length do not match');
        }
        else if (!cards) {
            throw new Error('there are no valid card elements to display.');
        }
        const tracksDisplayed = [];
        // by removing displayNone, we are displaying the number of cards wanted to be visible
        for (let i = 0; i < numToDisplay; i++) {
            tracksDisplayed.push(trackArr[i]);
            cards[i].classList.remove(config_1.config.CSS.CLASSES.displayNone);
            // remove appear class if it exists as it will be added on through animation
            cards[i].classList.remove(config_1.config.CSS.CLASSES.appear);
        }
        featureManager.changeTracksChart(tracksDisplayed);
        // animate the cards into view
        config_1.animationControl.animateAttributes('.' + config_1.config.CSS.CLASSES.rankCard, config_1.config.CSS.CLASSES.appear, 5);
    }
    /**
     * Adds a css class to cards starting from the last in order to hide them.
     * @param numToDisplay the number of cards to display
     * @param trackArr the array of tracks that are currently displayed
     */
    function setDisplayNoneClass(numToDisplay, trackArr) {
        const cards = tracksContainer === null || tracksContainer === void 0 ? void 0 : tracksContainer.childNodes;
        if (!cards) {
            return;
        }
        const tracksDisplayed = [];
        // from the last cards to the index of the card you want to keep visible, hide them.
        for (let i = cards.length - 1; i >= numToDisplay; i--) {
            console.log(cards[i]);
            cards[i].classList.add(config_1.config.CSS.CLASSES.displayNone);
        }
        // add only the tracks that will end up shown
        for (let i = 0; i < numToDisplay; i++) {
            tracksDisplayed.push(trackArr[i]);
        }
        featureManager.changeTracksChart(tracksDisplayed);
    }
    return {
        displayTrackCards,
        removeDisplayNoneClass,
        setDisplayNoneClass
    };
})();
/** Manages a feature's information for all tracks in a term. */
class Feature {
    constructor(featKey, definition) {
        this.featKey = featKey;
        this.data = [];
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
            const distance = Math.pow(Math.abs(val - this.mean), 2);
            sum += distance;
        });
        sum /= this.data.length;
        this.std = Math.sqrt(sum);
    }
}
const featureManager = (function () {
    /** The feature keys that are used in the 'feature' objectsobjects outputted by the spotify web api. */
    let FEATURE_KEYS;
    (function (FEATURE_KEYS) {
        FEATURE_KEYS["POPULARITY"] = "popularity";
        FEATURE_KEYS["VALENCE"] = "valence";
        FEATURE_KEYS["DANCEABILITY"] = "danceability";
        FEATURE_KEYS["INSTRUMENTALNESS"] = "instrumentalness";
        FEATURE_KEYS["ENERGY"] = "energy";
        FEATURE_KEYS["ACOUSTICNESS"] = "acousticness";
    })(FEATURE_KEYS || (FEATURE_KEYS = {}));
    const tracksChartEl = document.getElementById(config_1.config.CSS.IDs.tracksChart);
    const FEAT_HIGH = 60;
    const FEAT_LOW = 40;
    const charts = {
        tracksChart: null
    };
    const TRACK_FEATS = {
        popularity: new Feature(FEATURE_KEYS.POPULARITY, 'Popularity is the value of how often this song has been listened too by everyone on spotify.'),
        valence: new Feature(FEATURE_KEYS.VALENCE, 'Higher valence sound more positive (e.g. happy, cheerful, euphoric). Lower valence sound more negative (e.g. sad, depressed, angry).'),
        danceability: new Feature(FEATURE_KEYS.DANCEABILITY, `Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo,
        rhythm stability, beat strength, and overall regularity.`),
        instrumentalness: new Feature(FEATURE_KEYS.INSTRUMENTALNESS, 'Instrumentalness represents the amount of vocals in the song. The closer it is to 100, the less vocals there are in the song.'),
        energy: new Feature(FEATURE_KEYS.ENERGY, 'Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy.'),
        acousticness: new Feature(FEATURE_KEYS.ACOUSTICNESS, 'Acousticness describes how acoustic a song is. Which is measured by the amount of the song that does not contain electrical amplification.')
    };
    const selections = {
        feature: TRACK_FEATS.popularity
    };
    /** Updates the chart if it exists or generates it.
     *
     * @param trackObjs - track objects that the chart data depends on
     */
    function changeTracksChart(trackObjs) {
        const titles = updateFeatData(trackObjs);
        if (charts.tracksChart == null) {
            generateTracksChart(titles);
        }
        else {
            updateTracksChart(titles);
        }
    }
    function updatePopularity(trackObjs) {
        TRACK_FEATS.popularity.setData(trackObjs.map((track) => parseInt(track.popularity)));
    }
    /** Recalculate/Update the attributes for each feature.
     *
     * @param {Array<FeaturesData>} featsDataArr - contains the objects that hold features for each Track instance
     */
    function updateFeaturesAttrs(featsDataArr) {
        const keys = Object.keys(TRACK_FEATS);
        keys.forEach((key) => {
            // avoid the popularity key as that is not contained in a tracks features
            if (key !== FEATURE_KEYS.POPULARITY) {
                const feat = TRACK_FEATS[key];
                feat.setData(featsDataArr.map((features) => {
                    return Math.round(parseFloat(features[feat.featKey]) * 100);
                }));
            }
        });
    }
    /** Creates the chart.js chart with the initial trackObjects given.
     *
     * @param {Array<Track>} trackObjs tracks whose features will be used in the chart.
     */
    function generateTracksChart(titles) {
        updateTracksChartInfo();
        // remove loading spinner for chart
        charts.tracksChart = new chart_js_1.Chart(tracksChartEl, {
            type: 'bar',
            data: {
                labels: titles,
                datasets: [
                    {
                        label: (0, config_1.capitalizeFirstLetter)(selections.feature.featKey),
                        data: selections.feature.data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Tracks Comparison'
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMin: 0,
                        suggestedMax: 100,
                        grid: {
                            color: '#4b4b4ba9'
                        }
                    },
                    x: {
                        ticks: {
                            callback: function (val) {
                                const labelSubStr = this.getLabelForValue(val).substr(0, 20);
                                if (labelSubStr.length === this.getLabelForValue(val).length) {
                                    return labelSubStr;
                                }
                                else {
                                    return labelSubStr + '...';
                                }
                            }
                        },
                        grid: {
                            color: '#4b4b4ba9'
                        }
                    }
                }
            }
        });
    }
    /** Update the feature data using the given tracks. NOTE THIS RUNS MANY TIMES BECAUSE FEATURES AREN'T STORED FOR EVERY TERM: TODO: OPTIMIZE THIS
     *
     * @param {Array<Track>} trackObjs tracks whose features will be used to update the data.
     * @returns {Array<String>} array holding the name of each track.
     */
    function updateFeatData(trackObjs) {
        // update popularity Feature class in TRACK_FEATS
        updatePopularity(trackObjs);
        const featsDataArr = trackObjs.map((track) => track.features);
        // update other Feature class's in TRACK_FEATS
        updateFeaturesAttrs(featsDataArr);
        generateEmojis();
        const titles = trackObjs.map((track) => track.title);
        return titles;
    }
    /** Update the chart.js chart, feature attributes, and chart info
     *  with the given track object's feature data.
     *
     * @param {Array<Track>} trackObjs array of Track's whose feature data will update the chart.
     */
    function updateTracksChart(titles) {
        updateTracksChartInfo();
        const chart = charts.tracksChart;
        if (chart === null) {
            throw new Error('Chart has not been initialized');
        }
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.labels = titles;
        chart.data.datasets[0].data = selections.feature.data;
        chart.data.datasets[0].label = (0, config_1.capitalizeFirstLetter)(selections.feature.featKey);
        chart.update();
    }
    /** Update the info in the chart info section of the page. */
    function updateTracksChartInfo() {
        var _a, _b;
        const selFeat = selections.feature;
        function computeTendency() {
            if (selFeat.mean <= FEAT_LOW) {
                featAverage.textContent =
                    'On average you tend to like tracks with LESS ' +
                        selFeat.featKey +
                        '.';
            }
            else if (selFeat.mean >= FEAT_HIGH) {
                featAverage.textContent =
                    'On average you tend to like tracks with MORE ' +
                        selFeat.featKey +
                        '.';
            }
            else {
                featAverage.textContent =
                    "On average you have a NEUTRAL tendency towards a track's " +
                        selFeat.featKey +
                        '.';
            }
            if (selFeat.std > 15) {
                featAverage.textContent +=
                    ' However some tracks vary GREATLY from others.';
            }
            else if (selFeat.std > 10) {
                featAverage.textContent +=
                    ' However some tracks vary SLIGHTLY from others.';
            }
        }
        const featDef = (_a = document.getElementById(config_1.config.CSS.IDs.featDef)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`element of id ${config_1.config.CSS.IDs.featDef} does not exist`);
        const featAverage = (_b = document.getElementById(config_1.config.CSS.IDs.featAverage)) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)(`element of id ${config_1.config.CSS.IDs.featAverage} does not exist`);
        featDef.textContent = selFeat.definition;
        computeTendency();
    }
    function generateEmojis() {
        var _a;
        const emojiContainer = (_a = document.getElementById(config_1.config.CSS.IDs.emojis)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`Emoji container of id ${config_1.config.CSS.IDs.emojis} does not exist`);
        const emojiHelpers = (function () {
            function popularityEmoji() {
                if (TRACK_FEATS.popularity.mean >= FEAT_HIGH) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.sheepEmoji));
                }
                else if (TRACK_FEATS.popularity.mean <= FEAT_LOW) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.wolfEmoji));
                }
                else {
                    // TODO
                }
            }
            function valenceEmoji() {
                if (TRACK_FEATS.valence.mean >= FEAT_HIGH) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.happyEmoji));
                }
                else if (TRACK_FEATS.valence.mean <= FEAT_LOW) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.sadEmoji));
                }
                else {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.neutralEmoji));
                }
            }
            function acousticEmoji() {
                if (TRACK_FEATS.acousticness.mean >= FEAT_HIGH) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.acousticEmoji));
                }
                else if (TRACK_FEATS.acousticness.mean <= FEAT_LOW) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.nonAcousticEmoji));
                }
                else {
                    // TODO
                }
            }
            function instrumentalEmoji() {
                if (TRACK_FEATS.instrumentalness.mean >= FEAT_HIGH) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.instrumentEmoji));
                }
                else if (TRACK_FEATS.instrumentalness.mean <= FEAT_LOW) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.singerEmoji));
                }
                else {
                    // TODO
                }
            }
            function danceEmoji() {
                if (TRACK_FEATS.danceability.mean >= FEAT_HIGH) {
                    emojiContainer.appendChild(getEmojiHtml(config_1.config.PATHS.dancingEmoji));
                }
                else if (TRACK_FEATS.danceability.mean <= FEAT_LOW) {
                    // TODO
                }
                else {
                    // TODO
                }
            }
            function getEmojiHtml(path) {
                const html = `<img src=${path} alt="emoji"/>`;
                return (0, config_1.htmlToEl)(html);
            }
            return {
                popularityEmoji,
                valenceEmoji,
                acousticEmoji,
                instrumentalEmoji,
                danceEmoji
            };
        })();
        (0, config_1.removeAllChildNodes)(emojiContainer);
        Object.entries(emojiHelpers).forEach(([, generator]) => {
            generator();
        });
    }
    return {
        updateTracksChart,
        changeTracksChart,
        TRACK_FEATS,
        selections
    };
})();
const featureSelections = (_a = document
    .getElementById(config_1.config.CSS.IDs.featureSelections)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`element of id ${config_1.config.CSS.IDs.featureSelections} does not exist`);
const trackTermSelections = (_b = document
    .getElementById(config_1.config.CSS.IDs.tracksTermSelections)) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)(`element of id ${config_1.config.CSS.IDs.tracksTermSelections} does not exist`);
const selections = {
    featureTabManager: new SelectableTabEls_1.default(),
    termTabManager: new SelectableTabEls_1.default()
};
function selectInitialTabs(term) {
    (0, save_load_term_1.selectStartTermTab)(term, selections.termTabManager, trackTermSelections);
    const featBtn = featureSelections.getElementsByTagName('button')[0];
    const featBorder = featureSelections.getElementsByClassName(config_1.config.CSS.CLASSES.borderCover)[0];
    selections.featureTabManager.selectNewTab(featBtn, featBorder);
}
const addEventListeners = (function () {
    function addTrackFeatureButtonEvents() {
        function onClick(btn, borderCover) {
            var _a;
            const feature = (_a = btn.getAttribute(config_1.config.CSS.ATTRIBUTES.dataSelection)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('track feature button does not contain data selection attribute');
            const selectedFeat = featureManager.TRACK_FEATS[feature];
            if (selectedFeat === undefined) {
                console.error('The selected attribute ' +
                    feature +
                    ' from ' +
                    config_1.config.CSS.ATTRIBUTES.dataSelection +
                    ' is not valid. Occured in element(see next log):');
                console.error(btn);
                return;
            }
            selections.featureTabManager.selectNewTab(btn, borderCover);
            const currTracks = trackActions.getCurrSelTopTracks();
            featureManager.selections.feature = selectedFeat;
            featureManager.changeTracksChart(currTracks.slice(0, trackActions.selections.numViewableCards));
        }
        const featBtns = featureSelections
            .getElementsByTagName('button');
        const featBorderCovers = featureSelections
            .getElementsByClassName(config_1.config.CSS.CLASSES.borderCover);
        if (featBtns.length !== featBorderCovers.length) {
            console.error('Not all feat buttons contain a border cover');
            return;
        }
        for (let i = 0; i < featBtns.length; i++) {
            const btn = featBtns[i];
            const borderCover = featBorderCovers[i];
            btn.addEventListener('click', () => onClick(btn, borderCover));
        }
    }
    function addTrackTermButtonEvents() {
        function onClick(btn, borderCover) {
            var _a;
            trackActions.selections.term = (0, save_load_term_1.determineTerm)((_a = btn.getAttribute(config_1.config.CSS.ATTRIBUTES.dataSelection)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('a track term button does not have the data selection attribute'));
            (0, save_load_term_1.saveTerm)(trackActions.selections.term, save_load_term_1.TERM_TYPE.TRACKS);
            selections.termTabManager.selectNewTab(btn, borderCover);
            const currTracks = trackActions.getCurrSelTopTracks();
            displayCardInfo.displayTrackCards(currTracks);
        }
        const trackTermBtns = trackTermSelections
            .getElementsByTagName('button');
        const trackTermBorderCovers = trackTermSelections
            .getElementsByClassName(config_1.config.CSS.CLASSES.borderCover);
        if (trackTermBorderCovers.length !== trackTermBtns.length) {
            console.error('Not all track term buttons contain a border cover');
            return;
        }
        for (let i = 0; i < trackTermBtns.length; i++) {
            const btn = trackTermBtns[i];
            const borderCover = trackTermBorderCovers[i];
            btn.addEventListener('click', () => onClick(btn, borderCover));
        }
    }
    function addExpandDescOnHoverEvents() {
        const DEFAULT_FLEX_BASIS = 60;
        const TOP_PADDING = 20;
        const BTM_PADDING = 10;
        // get each description area for the chart info
        const descDivs = document.getElementsByClassName(config_1.config.CSS.CLASSES.chartInfo)[0].children;
        for (let i = 0; i < descDivs.length; i++) {
            // obtain the description and the drop down button
            const desc = descDivs[i];
            const textContainer = desc.getElementsByClassName(config_1.config.CSS.CLASSES.expandableTxtContainer)[0];
            if (!textContainer) {
                continue;
            }
            const ellipsisText = textContainer.children[0];
            desc.addEventListener('mouseenter', () => {
                ellipsisText.classList.remove(config_1.config.CSS.CLASSES.ellipsisWrap);
                desc.style.flexBasis =
                    TOP_PADDING + BTM_PADDING + textContainer.offsetHeight + 'px';
            });
            desc.addEventListener('mouseleave', () => {
                ellipsisText.classList.add(config_1.config.CSS.CLASSES.ellipsisWrap);
                desc.style.flexBasis = DEFAULT_FLEX_BASIS + 'px';
            });
        }
    }
    function resetViewableCards() {
        var _a;
        const currTracks = trackActions.getCurrSelTopTracks();
        const viewAllEl = (_a = document.getElementById(config_1.config.CSS.IDs.viewAllTopTracks)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`element of id ${config_1.config.CSS.IDs.viewAllTopTracks} does not exist`);
        trackActions.selections.numViewableCards = DEFAULT_VIEWABLE_CARDS;
        viewAllEl.textContent = 'See All 50';
        displayCardInfo.setDisplayNoneClass(trackActions.selections.numViewableCards, currTracks);
    }
    function addViewAllTracksEvent() {
        var _a;
        const viewAllEl = (_a = document.getElementById(config_1.config.CSS.IDs.viewAllTopTracks)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`element of id ${config_1.config.CSS.IDs.viewAllTopTracks} does not exist`);
        function onClick() {
            if (trackActions.selections.numViewableCards === DEFAULT_VIEWABLE_CARDS) {
                trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS;
                viewAllEl.textContent = 'See Less';
            }
            else {
                resetViewableCards();
            }
            const currTracks = trackActions.getCurrSelTopTracks();
            displayCardInfo.removeDisplayNoneClass(trackActions.selections.numViewableCards, currTracks);
        }
        viewAllEl.addEventListener('click', () => onClick());
    }
    function addGeneratePlaylistEvent() {
        function generatePlaylistFromTopTracks(term) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const promise = yield (0, config_1.promiseHandler)((0, axios_1.default)({
                    method: 'post',
                    url: config_1.config.URLs.postPlaylist('Top ' + term + ' tracks of ' + new Date().toDateString()),
                    data: {
                        description: 'description'
                    }
                }), () => { }, () => {
                    throw new Error('Issue creating playlist');
                });
                const uris = trackActions.getCurrSelTopTracks().map((track) => track.uri);
                yield (0, config_1.addItemsToPlaylist)((_a = promise.res) === null || _a === void 0 ? void 0 : _a.data.id, uris);
            });
        }
        const button = document.getElementById(config_1.config.CSS.IDs.generatePlaylist);
        button === null || button === void 0 ? void 0 : button.addEventListener('click', () => generatePlaylistFromTopTracks(trackActions.selections.term));
    }
    function addConvertCards() {
        const convertBtn = document.getElementById(config_1.config.CSS.IDs.convertCard);
        const convertImg = convertBtn === null || convertBtn === void 0 ? void 0 : convertBtn.getElementsByTagName('img')[0];
        const textContainer = document.getElementById(config_1.config.CSS.IDs.topTracksTextFormContainer);
        function onClick() {
            if (convertImg === undefined) {
                throw new Error('convert cards to text form buttons image is not found');
            }
            textContainer === null || textContainer === void 0 ? void 0 : textContainer.classList.toggle(config_1.config.CSS.CLASSES.displayNone);
            // ALSO HIDE THE CARD CONTAINER
            if (textContainer === null || textContainer === void 0 ? void 0 : textContainer.classList.contains(config_1.config.CSS.CLASSES.displayNone)) {
                saveLoad.saveTopTracksForm(false);
                convertImg.src = config_1.config.PATHS.listView;
            }
            else {
                saveLoad.saveTopTracksForm(true);
                convertImg.src = config_1.config.PATHS.gridView;
            }
        }
        convertBtn === null || convertBtn === void 0 ? void 0 : convertBtn.addEventListener('click', () => onClick());
    }
    return {
        addTrackFeatureButtonEvents,
        addTrackTermButtonEvents,
        addExpandDescOnHoverEvents,
        addViewAllTracksEvent,
        addGeneratePlaylistEvent,
        addConvertCards
    };
})();
const saveLoad = (function () {
    function saveTopTracksForm(isInTextForm) {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putTopTracksIsInTextFormData(String(isInTextForm))));
    }
    function loadTopTracksForm() {
    }
    return { saveTopTracksForm, loadTopTracksForm };
})();
const initialLoads = (function () {
    function loadPlaylistForm() {
        (0, config_1.promiseHandler)(axios_1.default
            .get(config_1.config.URLs.getTopTracksIsInTextFormData)
            .then((res) => {
            if (res.data === true) {
                const convertBtn = document.getElementById(config_1.config.CSS.IDs.convertCard);
                const convertImg = convertBtn === null || convertBtn === void 0 ? void 0 : convertBtn.getElementsByTagName('img')[0];
                if (convertImg === undefined) {
                    throw new Error('convert cards to text form buttons image is not found');
                }
                // show text versions of the cards and hide card versions
                convertImg.src = config_1.config.PATHS.gridView;
            }
            // else it is in card form which is the default.
        }));
    }
    return {
        loadPlaylistForm
    };
})();
(function () {
    (0, config_1.promiseHandler)((0, manage_tokens_1.checkIfHasTokens)(), (hasToken) => (0, manage_tokens_1.onSuccessfulTokenCall)(hasToken, () => {
        // load the term that was the user last had it on
        (0, save_load_term_1.loadTerm)(save_load_term_1.TERM_TYPE.TRACKS).then(term => {
            trackActions.selections.term = term;
            displayCardInfo.displayTrackCards(trackActions.getCurrSelTopTracks());
            selectInitialTabs(term);
        });
    }));
    Object.entries(addEventListeners).forEach(([, addEventListener]) => {
        addEventListener();
    });
    Object.entries(initialLoads).forEach(([, loader]) => {
        loader();
    });
})();
//# sourceMappingURL=top-tracks.js.map
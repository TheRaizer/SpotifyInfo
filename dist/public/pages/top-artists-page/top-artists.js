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
Object.defineProperty(exports, "__esModule", { value: true });
const artist_js_1 = require("../../components/artist.js");
const config_js_1 = require("../../config.js");
const selectableTabEls_js_1 = __importDefault(require("../../components/selectableTabEls.js"));
const manage_tokens_js_1 = require("../../manage-tokens.js");
const asyncSelectionVerif_js_1 = __importDefault(require("../../components/asyncSelectionVerif.js"));
const MAX_VIEWABLE_CARDS = 5;
const artistActions = (function () {
    const selections = {
        numViewableCards: MAX_VIEWABLE_CARDS,
        term: "short_term",
    };
    function loadArtistTopTracks(artistObj, callback) {
        artistObj
            .loadTopTracks()
            .then(() => {
            callback();
        })
            .catch((err) => {
            console.log("Error when loading artists");
            console.error(err);
        });
    }
    function showTopTracks(artistObj) {
        loadArtistTopTracks(artistObj, () => {
            let trackList = getTopTracksUlFromArtist(artistObj);
            let rank = 1;
            artistObj.topTracks.forEach((track) => {
                trackList.appendChild(track.getRankedTrackHtml(rank));
                rank++;
            });
        });
    }
    function getTopTracksUlFromArtist(artistObj) {
        let trackList = document
            .getElementById(artistObj.cardId)
            .getElementsByClassName(config_js_1.config.CSS.CLASSES.trackList)[0];
        return trackList;
    }
    function retrieveArtists(artistArr) {
        return __awaiter(this, void 0, void 0, function* () {
            let { res, err } = yield (0, config_js_1.promiseHandler)(axios.get(config_js_1.config.URLs.getTopArtists + selections.term));
            if (err) {
                return;
            }
            (0, artist_js_1.generateArtistsFromData)(res.data, artistArr);
        });
    }
    function getCurrSelTopArtists() {
        if (selections.term == "short_term") {
            return artistArrs.topArtistObjsShortTerm;
        }
        else if (selections.term == "medium_term") {
            return artistArrs.topArtistObjsMidTerm;
        }
        else if (selections.term == "long_term") {
            return artistArrs.topArtistObjsLongTerm;
        }
        else {
            throw new Error("Selected track term is invalid " + selections.term);
        }
    }
    return {
        showTopTracks,
        retrieveArtists,
        selections,
        getCurrSelTopArtists,
    };
})();
const displayArtistCards = (function () {
    const selectionVerif = new asyncSelectionVerif_js_1.default();
    const artistContainer = document.getElementById(config_js_1.config.CSS.IDs.artistCardsContainer);
    /** Generates the cards to the DOM then makes them visible
     *
     * @param {Array<Track>} artistArr array of track objects whose cards should be generated.
     * @param {Boolean} autoAppear whether to show the card without animation or with animation.
     * @returns {Array<HTMLElement>} array of the card elements.
     */
    function generateCards(artistArr, autoAppear) {
        (0, config_js_1.removeAllChildNodes)(artistContainer);
        let cardHtmls = [];
        // fill arr of card elements and append them to DOM
        for (let i = 0; i < artistArr.length; i++) {
            if (i < artistActions.selections.numViewableCards) {
                let artistObj = artistArr[i];
                let cardHtml = artistObj.getArtistHtml(i, autoAppear);
                cardHtmls.push(cardHtml);
                artistContainer.appendChild(cardHtml);
                artistActions.showTopTracks(artistObj);
            }
            else {
                break;
            }
        }
        if (!autoAppear) {
            config_js_1.animationControl.animateAttributes("." + config_js_1.config.CSS.CLASSES.artist, config_js_1.config.CSS.CLASSES.appear, 25);
        }
        return cardHtmls;
    }
    /** Begins retrieving artists then when done verifies it is the correct selected artist.
     *
     * @param {Array<Track>} artistArr array to load artists into.
     */
    function startLoadingArtists(artistArr) {
        // initially show the loading spinner
        const htmlString = `
            <div>
              <img src="${config_js_1.config.PATHS.spinner}" alt="Loading..." />
            </div>`;
        let spinnerEl = (0, config_js_1.htmlToEl)(htmlString);
        (0, config_js_1.removeAllChildNodes)(artistContainer);
        artistContainer.appendChild(spinnerEl);
        artistActions.retrieveArtists(artistArr).then(() => {
            // after retrieving async verify if it is the same arr of Artist's as what was selected
            if (!selectionVerif.isValid(artistArr)) {
                return;
            }
            return generateCards(artistArr, false);
        });
    }
    /** Load artist objects if not loaded, then generate cards with the objects.
     *
     * @param {Array<Track>} artistArr - List of track objects whose cards should be generated or
     * empty list that should be filled when loading tracks.
     * @param {Boolean} autoAppear whether to show the cards without animation.
     * @returns {Array<HTMLElement>} list of Card HTMLElement's.
     */
    function displayArtistCards(artistArr, autoAppear = false) {
        selectionVerif.selectionChanged(artistArr);
        if (artistArr.length > 0) {
            return generateCards(artistArr, autoAppear);
        }
        else {
            return startLoadingArtists(artistArr);
        }
    }
    return {
        displayArtistCards,
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
const addEventListeners = (function () {
    const selections = {
        termTabManager: new selectableTabEls_js_1.default(document
            .getElementById(config_js_1.config.CSS.IDs.artistTermSelections)
            .getElementsByTagName("button")[0], // first tab is selected first by default
        document
            .getElementById(config_js_1.config.CSS.IDs.artistTermSelections)
            .getElementsByClassName(config_js_1.config.CSS.CLASSES.borderCover)[0] // first tab is selected first by default
        ),
    };
    function addTrackTermButtonEvents() {
        function onClick(btn, borderCover) {
            artistActions.selections.term = btn.getAttribute(config_js_1.config.CSS.ATTRIBUTES.dataSelection);
            selections.termTabManager.selectNewTab(btn, borderCover);
            let currArtists = artistActions.getCurrSelTopArtists();
            displayArtistCards.displayArtistCards(currArtists);
        }
        const artistTermBtns = document
            .getElementById(config_js_1.config.CSS.IDs.artistTermSelections)
            .getElementsByTagName("button");
        const trackTermBorderCovers = document
            .getElementById(config_js_1.config.CSS.IDs.artistTermSelections)
            .getElementsByClassName(config_js_1.config.CSS.CLASSES.borderCover);
        if (trackTermBorderCovers.length != artistTermBtns.length) {
            console.error("Not all track term buttons contain a border cover");
            return;
        }
        for (let i = 0; i < artistTermBtns.length; i++) {
            let btn = artistTermBtns[i];
            let borderCover = trackTermBorderCovers[i];
            btn.addEventListener("click", () => onClick(btn, borderCover));
        }
    }
    function resetViewableCards() {
        let viewAllEl = document.getElementById(config_js_1.config.CSS.IDs.viewAllTopTracks);
        trackActions.selections.numViewableCards = DEFAULT_VIEWABLE_CARDS;
        viewAllEl.textContent = "See All 50";
    }
    function addViewAllTracksEvent() {
        let viewAllEl = document.getElementById(config_js_1.config.CSS.IDs.viewAllTopTracks);
        function onClick() {
            if (trackActions.selections.numViewableCards == DEFAULT_VIEWABLE_CARDS) {
                trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS;
                viewAllEl.textContent = "See Less";
            }
            else {
                resetViewableCards();
            }
            let currTracks = trackActions.getCurrSelTopTracks();
            displayCardInfo.displayTrackCards(currTracks);
        }
        viewAllEl.addEventListener("click", () => onClick());
    }
    return {
        addTrackTermButtonEvents,
        // addViewAllTracksEvent,
    };
})();
(function () {
    (0, config_js_1.promiseHandler)((0, manage_tokens_js_1.checkIfHasTokens)(), (hasToken) => (0, manage_tokens_js_1.onSuccessfulTokenCall)(hasToken, () => {
        // when entering the page always show short term tracks first
        artistActions.selections.term = "short_term";
        displayArtistCards.displayArtistCards(artistArrs.topArtistObjsShortTerm);
    }));
    Object.entries(addEventListeners).forEach(([, addEventListener]) => {
        addEventListener();
    });
})();

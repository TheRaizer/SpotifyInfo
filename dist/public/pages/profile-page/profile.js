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
const config_js_1 = require("../../config.js");
const profile_js_1 = __importDefault(require("../../components/profile.js"));
const playlist_js_1 = require("../../components/playlist.js");
const manage_tokens_js_1 = require("../../manage-tokens.js");
const artist_js_1 = require("../../components/artist.js");
const card_actions_js_1 = __importDefault(require("../../card-actions.js"));
const doubly_linked_list_js_1 = __importDefault(require("../../components/doubly-linked-list.js"));
function displayProfile(profile) {
    const displayName = document
        .getElementById(config_js_1.config.CSS.IDs.profileHeader)
        .getElementsByTagName("h1")[0];
    const followerCount = document
        .getElementById(config_js_1.config.CSS.IDs.profileHeader)
        .getElementsByTagName("h4")[0];
    const profileImage = document
        .getElementById(config_js_1.config.CSS.IDs.profileHeader)
        .getElementsByTagName("img")[0];
    displayName.textContent = profile.displayName;
    followerCount.textContent = profile.followers + " followers";
    profileImage.src =
        profile.profileImgUrl == ""
            ? "/images/profile-user.png"
            : profile.profileImgUrl;
}
function retrieveProfile() {
    return __awaiter(this, void 0, void 0, function* () {
        function onSuccesful(res) {
            const data = res.data;
            let profile = new profile_js_1.default(data.display_name, data.country, data.email, data.images, data.followers.total, data.external_urls.spotify);
            displayProfile(profile);
        }
        // get profile data from api
        yield (0, config_js_1.promiseHandler)(axios.get(config_js_1.config.URLs.getCurrentUserProfile), onSuccesful, (err) => {
            // throw error that will be passed down to the promise handler that ran retrieveProfile().
            throw new Error(err);
        });
    });
}
const addEventListeners = (function () {
    /** Adds the click event listener that clears session data and returns user back to home page.
     *
     */
    function addClearDataListener() {
        const clearDataEl = document.getElementById(config_js_1.config.CSS.IDs.clearData);
        clearDataEl.href = config_js_1.config.URLs.siteUrl;
        function onClick() {
            axios.put(config_js_1.config.URLs.putClearSession);
        }
        clearDataEl.addEventListener("click", onClick);
    }
    return { addClearDataListener };
})();
const savedTracksActions = (function () {
    function getSavedTracks() {
        (0, config_js_1.promiseHandler)(axios.get(config_js_1.config.URLs.getCurrentUserSavedTracks), (res) => {
            // if we retrieved the tracks succesfully, then display them
            let trackList = new doubly_linked_list_js_1.default();
            let tracksData = res.data.items.map((item) => item.track);
            (0, playlist_js_1.getPlaylistTracksFromDatas)(tracksData, res.data.items, trackList);
            displaySavedTracks(trackList);
        });
    }
    function displaySavedTracks(trackList) {
        const likedTracksUl = document.getElementById(config_js_1.config.CSS.IDs.likedTracks);
        for (const track of trackList.values()) {
            likedTracksUl.append(track.getPlaylistTrackHtml(trackList));
        }
    }
    return { getSavedTracks };
})();
const followedArtistActions = (function () {
    const cardActionsHandler = new card_actions_js_1.default(50);
    function getFollowedArtists() {
        (0, config_js_1.promiseHandler)(axios.get(config_js_1.config.URLs.getFollowedArtists), (res) => {
            // if we retrieved the artists succesfully, then display them
            var artistArr = [];
            (0, artist_js_1.generateArtistsFromData)(res.data.artists.items, artistArr);
            displayFollowedArtists(artistArr);
        });
    }
    function displayFollowedArtists(followedArtists) {
        const cardGrid = document.getElementById(config_js_1.config.CSS.IDs.followedArtists);
        // display the cards
        let i = 0;
        followedArtists.forEach((artist) => {
            cardGrid.append(artist.getArtistCardHtml(i, true));
            i++;
        });
        let artistCards = Array.from(document.getElementsByClassName(config_js_1.config.CSS.CLASSES.artist));
        // add event listeners to the cards
        cardActionsHandler.addAllEventListeners(artistCards, followedArtists, null, true, false);
    }
    return { getFollowedArtists };
})();
(function () {
    (0, config_js_1.promiseHandler)((0, manage_tokens_js_1.checkIfHasTokens)(), (hasToken) => (0, manage_tokens_js_1.onSuccessfulTokenCall)(hasToken, () => {
        // get user profile
        (0, config_js_1.promiseHandler)(retrieveProfile(), () => {
            (0, manage_tokens_js_1.generateLogin)({
                classesToAdd: ["glow"],
                parentEl: document.getElementById("account-btns"),
            });
        }, () => console.log("Problem when getting information"));
        savedTracksActions.getSavedTracks();
        followedArtistActions.getFollowedArtists();
    }));
    Object.entries(addEventListeners).forEach(([, addEventListener]) => {
        addEventListener();
    });
})();

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
exports.generateTracksFromData = void 0;
const config_js_1 = require("../config.js");
const playback_sdk_js_1 = require("./playback-sdk.js");
const album_js_1 = __importDefault(require("./album.js"));
const card_js_1 = __importDefault(require("./card.js"));
const track_play_args_js_1 = __importDefault(require("./pubsub/event-args/track-play-args.js"));
class Track extends card_js_1.default {
    constructor(props) {
        super();
        let { title, images, duration, uri, popularity, releaseDate, id, album, externalUrl, artists, idx = -1, } = props;
        // This tracks index in an array if it is contained in one. (used to find previous and next tracks)
        this.idx = idx;
        this.externalUrl = externalUrl;
        this.id = id;
        this.title = title;
        this.filterDataFromArtists(artists);
        this.duration = (0, config_js_1.millisToMinutesAndSeconds)(duration);
        // either the normal uri, or the linked_from.uri
        this.uri = uri;
        this.popularity = popularity;
        this.dateAddedToPlaylist;
        this.releaseDate = new Date(releaseDate);
        this.album = album;
        this.features = undefined;
        this.imageUrl = (0, config_js_1.getValidImage)(images);
        this.selEl = null;
    }
    setDateAdded(dateAddedToPlaylist) {
        this.dateAddedToPlaylist = new Date(dateAddedToPlaylist);
    }
    filterDataFromArtists(artists) {
        this.artists = artists.map((artist) => {
            return { name: artist.name, externalUrl: artist.external_urls.spotify };
        });
    }
    generateHTMLArtistNames() {
        let artistNames = "";
        for (let i = 0; i < this.artists.length; i++) {
            const artist = this.artists[i];
            artistNames += `<a href="${artist.externalUrl}" target="_blank">${artist.name}</a>`;
            if (i < this.artists.length - 1) {
                artistNames += ", ";
            }
        }
        return artistNames;
    }
    /** Produces the card element of this track.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
     */
    getTrackCardHtml(idx, unanimatedAppear = false) {
        let id = `${config_js_1.config.CSS.IDs.trackPrefix}${idx}`;
        this.cardId = id;
        let appearClass = unanimatedAppear ? config_js_1.config.CSS.CLASSES.appear : "";
        let html = `
            <div class="${config_js_1.config.CSS.CLASSES.rankCard} ${config_js_1.config.CSS.CLASSES.fadeIn} ${appearClass}">
              <h4 id="${config_js_1.config.CSS.IDs.rank}">${idx + 1}.</h4>
              <div class="${config_js_1.config.CSS.CLASSES.flipCard} ${config_js_1.config.CSS.CLASSES.noSelect}  ${config_js_1.config.CSS.CLASSES.expandOnHover}">
                <button class="${config_js_1.config.CSS.CLASSES.card} ${config_js_1.config.CSS.CLASSES.flipCardInner} ${config_js_1.config.CSS.CLASSES.track}" id="${this.getCardId()}">
                  <div class="${config_js_1.config.CSS.CLASSES.flipCardFront}"  title="Click to view more Info">
                    <img src="${this.imageUrl}" alt="Album Cover"></img>
                    <div>
                      <h4 class="${config_js_1.config.CSS.CLASSES.ellipsisWrap} ${config_js_1.config.CSS.CLASSES.scrollingText}">${this.title}</h4>
                    </div>
                  </div>
                  <div class=${config_js_1.config.CSS.CLASSES.flipCardBack}>
                    <h3>Duration:</h3>
                    <p>${this.duration}</p>
                    <h3>Release Date:</h3>
                    <p>${this.releaseDate.toDateString()}</p>
                    <h3>Album Name:</h3>
                    <a href="${this.album.externalUrl}">
                      <p class="${config_js_1.config.CSS.CLASSES.ellipsisWrap}">${this.album.name}</p>
                    </a>
                  </div>
                </button>
              </div>
            </div>
          `;
        return (0, config_js_1.htmlToEl)(html);
    }
    /** Get a track html to be placed as a list element.
     *
     * @param {Boolean} displayDate - whether to display the date.
     * @returns {ChildNode} - The converted html string to an element
     */
    getPlaylistTrackHtml(trackList, displayDate = true) {
        const track = this;
        var trackNode = trackList.get(this.idx, true);
        function playPauseClick() {
            // select this track to play or pause by publishing the track play event arg
            window.eventAggregator.publish(new track_play_args_js_1.default(track, trackNode));
        }
        let html = `
            <li class="${config_js_1.config.CSS.CLASSES.playlistTrack}">
              <button class="play-pause ${(0, playback_sdk_js_1.isSamePlayingURI)(this.uri) ? config_js_1.config.CSS.CLASSES.selected : ""}"><img src="" alt="play/pause" 
              class="${config_js_1.config.CSS.CLASSES.noSelect}"/></button>
              <img class="${config_js_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}"></img>
              <div class="${config_js_1.config.CSS.CLASSES.links}">
                <a href="${this.externalUrl}" target="_blank">
                  <h4 class="${config_js_1.config.CSS.CLASSES.ellipsisWrap} ${config_js_1.config.CSS.CLASSES.name}">${this.title}
                  </h4>
                <a/>
                <div class="${config_js_1.config.CSS.CLASSES.ellipsisWrap}">
                  ${this.generateHTMLArtistNames()}
                </div>
              </div>
              <h5>${this.duration}</h5>
              ${displayDate
            ? `<h5>${this.dateAddedToPlaylist.toLocaleDateString()}</h5>`
            : ""}
            </li>
            `;
        let el = (0, config_js_1.htmlToEl)(html);
        // get play pause button
        let playPauseBtn = el.childNodes[1];
        this.selEl = playPauseBtn;
        playPauseBtn.addEventListener("click", () => playPauseClick(playPauseBtn));
        (0, playback_sdk_js_1.checkIfIsPlayingElAfterRerender)(this.uri, playPauseBtn, trackNode);
        return el;
    }
    /** Get a track html to be placed as a list element on a ranked list.
     *
     * @returns {ChildNode} - The converted html string to an element
     */
    getRankedTrackHtml(rank) {
        let html = `
            <li class="${config_js_1.config.CSS.CLASSES.playlistTrack}">
              <p>${rank}.</p>
              <img class="${config_js_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}"></img>
              <div class="${config_js_1.config.CSS.CLASSES.links}">
                <a href="${this.externalUrl}" target="_blank">
                  <h4 class="${config_js_1.config.CSS.CLASSES.ellipsisWrap} ${config_js_1.config.CSS.CLASSES.name}">${this.title}
                  </h4>
                <a/>
                <div class="${config_js_1.config.CSS.CLASSES.ellipsisWrap}">
                  ${this.generateHTMLArtistNames()}
                </div>
              </div>
              <h5>${this.duration}</h5>
            </li>
            `;
        return (0, config_js_1.htmlToEl)(html);
    }
    /** Load the features of this track from the spotify web api.*/
    loadFeatures() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios
                .get(config_js_1.config.URLs.getTrackFeatures + this.id)
                .catch((err) => {
                throw err;
            });
            let feats = res.data.audio_features;
            this.features = {
                danceability: feats.danceability,
                acousticness: feats.acousticness,
                instrumentalness: feats.instrumentalness,
                valence: feats.valence,
                energy: feats.energy,
            };
            return this.features;
        });
    }
}
/** Generate tracks from data excluding date added.
 *
 * @param {*} datas
 * @param {DoublyLinkedList} trackList - double linked list
 * @returns
 */
function generateTracksFromData(datas, trackList) {
    for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        if (data) {
            let props = {
                title: data.name,
                images: data.album.images,
                duration: data.duration_ms,
                uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
                popularity: data.popularity,
                releaseDate: data.album.release_date,
                id: data.id,
                album: new album_js_1.default(data.album.name, data.album.external_urls.spotify),
                externalUrl: data.external_urls.spotify,
                artists: data.artists,
                idx: i,
            };
            if (trackList) {
                trackList.add(new Track(props));
            }
        }
    }
    return trackList;
}
exports.generateTracksFromData = generateTracksFromData;
exports.default = Track;

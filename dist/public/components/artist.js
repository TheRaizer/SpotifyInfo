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
exports.generateArtistsFromData = void 0;
const config_js_1 = require("../config.js");
const track_js_1 = require("../components/track.js");
const card_js_1 = __importDefault(require("./card.js"));
const doubly_linked_list_js_1 = __importDefault(require("./doubly-linked-list.js"));
class Artist extends card_js_1.default {
    constructor(id, name, genres, followerCount, externalUrl, images) {
        super();
        this.artistId = id;
        this.name = name;
        this.genres = genres;
        this.followerCount = followerCount;
        this.externalUrl = externalUrl;
        this.imageUrl = (0, config_js_1.getValidImage)(images);
        this.topTracks = undefined;
    }
    /** Produces the card element of this artist.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
     */
    getArtistHtml(idx) {
        let id = `${config_js_1.config.CSS.IDs.artistPrefix}${idx}`;
        this.cardId = id;
        let genreList = "";
        this.genres.forEach((genre) => {
            genreList += "<li>" + genre + "</li>";
        });
        let html = `
      <div class="${config_js_1.config.CSS.CLASSES.artist} ${config_js_1.config.CSS.CLASSES.fadeIn}" id="${this.cardId}">
        <section class="${config_js_1.config.CSS.CLASSES.content}">
          <header class="artist-base">
            <img src=${this.imageUrl} alt="Artist"/>
            <h3>${this.name}</h3>
            <ul class="genres">
              ${genreList}
            </ul>
          </header>
          <div class="${config_js_1.config.CSS.CLASSES.tracksArea}">
            <section class="${config_js_1.config.CSS.CLASSES.artistTopTracks}">
              <header>
                <h4>Top Tracks</h4>
              </header>
              <ul class="${config_js_1.config.CSS.CLASSES.scrollBar} ${config_js_1.config.CSS.CLASSES.trackList}">
              </ul>
            </section>
          </div>
        </section>
      </div>
      `;
        return (0, config_js_1.htmlToEl)(html);
    }
    /** Produces the card element of this artist.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
     */
    getArtistCardHtml(idx, unanimatedAppear = false) {
        let id = `${config_js_1.config.CSS.IDs.artistPrefix}${idx}`;
        this.cardId = id;
        let appearClass = unanimatedAppear ? config_js_1.config.CSS.CLASSES.appear : "";
        let html = `
            <div class="${config_js_1.config.CSS.CLASSES.rankCard} ${config_js_1.config.CSS.CLASSES.fadeIn} ${appearClass}">
              <div class="${config_js_1.config.CSS.CLASSES.flipCard} ${config_js_1.config.CSS.CLASSES.noSelect}  ${config_js_1.config.CSS.CLASSES.expandOnHover}">
                <button class="${config_js_1.config.CSS.CLASSES.card} ${config_js_1.config.CSS.CLASSES.flipCardInner} ${config_js_1.config.CSS.CLASSES.artist}" id="${this.getCardId()}">
                  <div class="${config_js_1.config.CSS.CLASSES.flipCardFront}"  title="Click to view more Info">
                    <img src="${this.imageUrl}" alt="Album Cover"></img>
                    <div>
                      <h4 class="${config_js_1.config.CSS.CLASSES.ellipsisWrap} ${config_js_1.config.CSS.CLASSES.scrollingText}">${this.name}</h4>
                    </div>
                  </div>
                  <div class=${config_js_1.config.CSS.CLASSES.flipCardBack}>
                    <h3>Followers:</h3>
                    <p>${this.followerCount}</p>
                  </div>
                </button>
              </div>
            </div>
          `;
        return (0, config_js_1.htmlToEl)(html);
    }
    loadTopTracks() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios.get(config_js_1.config.URLs.getArtistTopTracks(this.artistId));
            let tracksData = res.data.tracks;
            let trackObjs = new doubly_linked_list_js_1.default();
            (0, track_js_1.generateTracksFromData)(tracksData, trackObjs);
            this.topTracks = trackObjs;
            return trackObjs;
        });
    }
    hasLoadedTopTracks() {
        return this.topTracks === undefined ? false : true;
    }
}
function generateArtistsFromData(datas, artistArr) {
    datas.forEach((data) => {
        artistArr.push(new Artist(data.id, data.name, data.genres, data.followers.total, data.external_urls.spotify, data.images));
    });
    return artistArr;
}
exports.generateArtistsFromData = generateArtistsFromData;
exports.default = Artist;

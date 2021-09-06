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
exports.getPlaylistTracksFromDatas = void 0;
const config_js_1 = require("../config.js");
const track_js_1 = require("./track.js");
const card_js_1 = __importDefault(require("./card.js"));
const doubly_linked_list_js_1 = __importDefault(require("./doubly-linked-list.js"));
class Playlist extends card_js_1.default {
    constructor(name, images, id) {
        super();
        this.name = name;
        this.id = id;
        this.undoStack = [];
        this.order = "custom-order"; // set it as the initial order
        this.trackList = undefined;
        // the id of the playlist card element
        this.imageUrl = (0, config_js_1.getValidImage)(images);
    }
    addToUndoStack(tracks) {
        this.undoStack.push(tracks);
    }
    /** Produces the card element of this playlist.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
     */
    getPlaylistCardHtml(idx, inTextForm, isSelected = false) {
        let id = `${config_js_1.config.CSS.IDs.playlistPrefix}${idx}`;
        const expandOnHover = inTextForm ? "" : config_js_1.config.CSS.CLASSES.expandOnHover;
        this.cardId = id;
        let html = `
        <div class="${expandOnHover}">
          <button class="${config_js_1.config.CSS.CLASSES.fadeIn} ${config_js_1.config.CSS.CLASSES.card} ${config_js_1.config.CSS.CLASSES.playlist} ${config_js_1.config.CSS.CLASSES.noSelect} ${isSelected ? config_js_1.config.CSS.CLASSES.selected : ""}" id="${this.getCardId()}" title="Click to View Tracks">
              <img src="${this.imageUrl}" alt="Playlist Cover"></img>
              <h4 class="${config_js_1.config.CSS.CLASSES.scrollingText} ${config_js_1.config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
          </button>
        </div>
      `;
        return (0, config_js_1.htmlToEl)(html);
    }
    /** Produces list of Track class instances using track datas from spotify web api.
     *
     * @returns {List} - List of track classes created using the obtained track datas.
     */
    loadTracks() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield axios
                .get(config_js_1.config.URLs.getPlaylistTracks + this.id)
                .catch((err) => {
                throw new Error(err);
            });
            if (!res) {
                return [];
            }
            var trackList = new doubly_linked_list_js_1.default();
            let tracksData = res.data.map((data) => data.track);
            getPlaylistTracksFromDatas(tracksData, res.data, trackList);
            // define track objects
            this.trackList = trackList;
            return trackList;
        });
    }
    hasLoadedTracks() {
        return this.trackList === undefined ? false : true;
    }
}
/** Gets playlist tracks from data. This also initializes the date added.
 *
 * @param {*} tracksData
 * @param {*} dateAddedObjects - The object that contains the added_at variable.
 * @param {DoublyLinkedList} tracksList
 */
function getPlaylistTracksFromDatas(tracksData, dateAddedObjects, trackList) {
    (0, track_js_1.generateTracksFromData)(tracksData, trackList);
    var i = 0;
    // set the dates added
    for (const trackOut of trackList.values()) {
        let dateAddedObj = dateAddedObjects[i];
        let track = trackOut;
        track.setDateAdded(dateAddedObj.added_at);
        i++;
    }
}
exports.getPlaylistTracksFromDatas = getPlaylistTracksFromDatas;
exports.default = Playlist;

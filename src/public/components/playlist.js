import { config, htmlToEl, getValidImage } from "../config.js";
import { generateTracksFromData } from "./track.js";
import Card from "./card.js";

class Playlist extends Card {
  constructor(name, images, id) {
    super();
    this.name = name;
    this.id = id;
    this.undoStack = [];

    // the id of the playlist card element
    this.imageUrl = getValidImage(images);
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
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    const expandOnHover = inTextForm ? "" : config.CSS.CLASSES.expandOnHover;

    this.cardId = id;
    let html = `
        <div class="${expandOnHover}">
          <button class="${config.CSS.CLASSES.fadeIn} ${
      config.CSS.CLASSES.card
    } ${config.CSS.CLASSES.playlist} ${config.CSS.CLASSES.noSelect} ${
      isSelected ? config.CSS.CLASSES.selected : ""
    }" id="${this.getCardId()}" title="Click to View Tracks">
              <img src="${this.imageUrl}" alt="Playlist Cover"></img>
              <h4 class="${config.CSS.CLASSES.scrollingText} ${
      config.CSS.CLASSES.ellipsisWrap
    }">${this.name}</h4>
          </button>
        </div>
      `;
    return htmlToEl(html);
  }

  /** Produces list of Track class instances using track datas from spotify web api.
   *
   * @returns {List} - List of track classes created using the obtained track datas.
   */
  async loadTracks() {
    let res = await axios
      .get(config.URLs.getPlaylistTracks + this.id)
      .catch((err) => {
        throw new Error(err);
      });

    if (!res) {
      return [];
    }
    var trackObjs = [];

    let tracksData = res.data.map((data) => data.track);
    getPlaylistTracksFromDatas(tracksData, res.data, trackObjs);

    // define track objects
    this.trackObjs = trackObjs;
    return trackObjs;
  }

  hasLoadedTracks() {
    return this.trackObjs === undefined ? false : true;
  }
}

/** Gets playlist tracks from data. This also initializes the date added.
 *
 * @param {*} tracksData
 * @param {*} dateAddedObjects - The object that contains the added_at variable.
 * @param {*} tracksArr
 */
export function getPlaylistTracksFromDatas(
  tracksData,
  dateAddedObjects,
  tracksArr
) {
  generateTracksFromData(tracksData, tracksArr);

  // set the dates added
  for (let i = 0; i < tracksArr.length; i++) {
    let dateAddedObj = dateAddedObjects[i];
    let track = tracksArr[i];

    track.setDateAdded(dateAddedObj.added_at);
  }
}

export default Playlist;

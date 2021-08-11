import { config, htmlToEl, getValidImage } from "../config.js";
import Track from "./track.js";

class Playlist {
  constructor(name, images, id) {
    this.name = name;
    this.id = id;
    this.undoStack = [];

    // the id of the playlist card element
    this.cardId = "";
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
  getPlaylistCardHtml(idx, inTextForm) {
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    const expandOnHover = inTextForm ? "" : config.CSS.CLASSES.expandOnHover;

    this.cardId = id;
    let html = `
        <div class="${expandOnHover}">
          <button class="${config.CSS.CLASSES.fadeIn} ${config.CSS.CLASSES.card} ${config.CSS.CLASSES.playlist} ${config.CSS.CLASSES.noSelect}" id="${id}" title="Click to View Tracks">
              <img src="${this.imageUrl}" alt="Playlist Cover"></img>
              <h4 class="${config.CSS.CLASSES.scrollingText} ${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
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
    let tracksData = res.data;
    var trackObjs = [];

    tracksData.forEach((data) => {
      // if the data exists
      let track = data.track;
      if (data && data.track) {
        let props = {
          name: track.name,
          images: track.album.images,
          duration: track.duration_ms,
          uri:
            track.linked_from !== undefined ? track.linked_from.uri : track.uri,
          popularity: track.popularity,
          dateAddedToPlaylist: data.added_at,
          releaseDate: track.album.release_date,
          id: track.id,
          externalUrl: track.external_urls.spotify,
          artists: track.artists,
        };

        // push an instance of a Track class to the list
        trackObjs.push(new Track(props));
      }
    });

    // define track objects
    this.trackObjs = trackObjs;
    return trackObjs;
  }

  hasLoadedTracks() {
    return this.trackObjs === undefined ? false : true;
  }
}

export default Playlist;

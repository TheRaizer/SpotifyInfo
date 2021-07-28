import { config, htmlToEl, getValidImage } from "../config.js";
import Track from "./track.js";

class Playlist {
  constructor(name, images, id) {
    this.name = name;
    this.id = id;
    this.undoArr = [];

    // the id of the playlist card element
    this.cardId = "";
    this.imageUrl = getValidImage(images);
  }

  addToUndoArr(tracks) {
    this.undoArr.push(tracks);
  }

  /** Produces the card element of this playlist.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getPlaylistCardHtml(idx) {
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    this.cardId = id;
    let html = `
          <button class="${config.CSS.CLASSES.fadeIn} ${config.CSS.CLASSES.card} ${config.CSS.CLASSES.playlist} ${config.CSS.CLASSES.noSelect}" id="${id}" title="Click to View Tracks">
            <img src="${this.imageUrl}" alt="Playlist Cover"></img>
            <h4 class="${config.CSS.CLASSES.scrollingText} ${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
          </button>
      `;
    return htmlToEl(html);
  }

  /** Produces list of Track class instances using track datas from spotify web api.
   *
   * @returns {List} - List of track classes created using the obtained track datas.
   */
  async loadTracks() {
    let response = await axios
      .get(config.URLs.getPlaylistTracks + this.id)
      .catch((err) => {
        throw new Error(err);
      });
    if (!response) {
      return [];
    }
    let tracksData = response.data;
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

    this.trackObjs = trackObjs;
    return trackObjs;
  }
}

export default Playlist;

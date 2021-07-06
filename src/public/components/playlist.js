import { config, htmlToEl } from "../config.js";
import Track from "./track.js";

class Playlist {
  constructor(name, images, id) {
    this.images = images;
    this.name = name;
    this.id = id;
    this.undoList = [];

    // the id of the playlist card element
    this.cardId = "";
  }

  addToUndoList(tracks) {
    this.undoList.push(tracks);
  }

  /** Produces the card element of this playlist.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getPlaylistCardHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    this.cardId = id;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;

      let html = `
            <button class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.playlist}" id="${id}">
              <img src="${url}"></img>
              <div>
                <h4 class="${config.CSS.CLASSES.scrollingText} ${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
              </div>
            </button>
        `;
      return htmlToEl(html);
    }
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
      if (data && data.track) {
        let props = {
          name: data.track.name,
          images: data.track.album.images,
          duration: data.track.duration_ms,
          uri:
            data.track.linked_from !== undefined
              ? data.track.linked_from.uri
              : data.track.uri,
          popularity: data.track.popularity,
          dateAddedToPlaylist: data.added_at,
          releaseDate: data.track.album.release_date,
          id: data.track.id,
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

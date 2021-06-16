import { config } from "../config.js";
import Track from "./track.js";

class Playlist {
  constructor(name, images, id) {
    this.images = images;
    this.name = name;
    this.id = id;
    this.undoList = [];
    // the id of the playlist card element
    this.playlistElementId = "";
  }

  addToUndoList(tracks) {
    this.undoList.push(tracks);
  }

  getPlaylistCardHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    this.playlistElementId = id;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;

      return `
            <button class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.playlist}" id="${id}">
              <img src="${url}"></img>
              <h4 class="${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
            </button>
        `;
    }
  }

  async getTracks() {
    let response = await axios
      .get(config.URLs.getPlaylistTracks + this.id)
      .catch((err) => console.error(err));
    if (!response) {
      return [];
    }
    let tracksData = response.data;
    console.log(tracksData);
    var trackObjs = [];

    tracksData.forEach((data) => {
      // if the data is not null or undefined etc.
      if (data) {
        trackObjs.push(
          new Track(
            data.track.name,
            data.track.album.images,
            data.track.duration_ms,
            data.track.linked_from !== undefined
              ? data.track.linked_from.uri
              : data.track.uri,
            data.added_at
          )
        );
      }
    });
    return trackObjs;
  }
}

export default Playlist;

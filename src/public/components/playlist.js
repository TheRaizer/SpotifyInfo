import { config } from "../config.js";
import Track from "./track.js";

class Playlist {
  constructor(name, images, id) {
    this.images = images;
    this.name = name;
    this.id = id;

    // the id of the playlist card element
    this.playlistElementId = "";
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
    let tracksData = response.data;
    var trackObjs = [];
    tracksData.forEach((data) => {
      // if the data is not null or undefined etc.
      if (data) {
        trackObjs.push(
          new Track(data.name, data.album.images, data.duration_ms)
        );
      }
    });
    return trackObjs;
  }
}

export default Playlist;

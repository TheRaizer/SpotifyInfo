import { config } from "../config.js";

// custom promise to handle axios get requests
const axiosGetReq = (url) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

class Playlist {
  constructor(name, images, id) {
    this.images = images;
    this.name = name;
    this.id = id;

    // the id of the playlist card element
    this.playlistElementId = "";

    // the number corrosponding to this playlist's expanded element
    this.expandedPlaylistNum = -1;
  }

  getPlaylistHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    this.playlistElementId = id;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;

      return `
            <div class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.playlist}" id="${id}">
              <img src="${url}"></img>
              <h4>${this.name}</h4>
            </div>
        `;
    }
  }

  async getTracks() {
    let tracks = await axiosGetReq(config.URLs.getPlaylistTracks + this.id);
    return tracks;
  }
}

export default Playlist;

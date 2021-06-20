import { config, millisToMinutesAndSeconds, htmlToEl } from "../config.js";

class Track {
  constructor(props) {
    let {
      name,
      images,
      duration,
      uri,
      popularity,
      dateAddedToPlaylist = "",
      releaseDate,
      id,
    } = props;

    this.id = id;
    this.name = name;
    this.images = images;
    this.duration = millisToMinutesAndSeconds(duration);

    // either the normal uri, or the linked_from.uri
    this.uri = uri;
    this.popularity = popularity;
    this.cardId = "";
    this.dateAddedToPlaylist = new Date(dateAddedToPlaylist);
    this.releaseDate = new Date(releaseDate);

    if (this.images.length > 0) {
      let img = this.images[0];
      this.imgURL = img.url;
    } else {
      this.imgURL = "";
    }
  }

  getTrackCardHtml(idx) {
    let id = `${config.CSS.IDs.trackPrefix}${idx}`;
    this.cardId = id;
    let html = `
            <button class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.track}" id="${id}">
              <img src="${this.imgURL}"></img>
              <h4 class="${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
            </button>
          `;
    return htmlToEl(html);
  }

  getPlaylistTrackHtml() {
    let html = `
            <li class="${config.CSS.CLASSES.playlistTrack}">
              <img src="${this.imgURL}"></img>
              <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.name
    }">${this.name}
              </h4>
              <h5>${this.duration}</h5>
              <h5>${this.dateAddedToPlaylist.toLocaleDateString()}</h5>
            </li>
            `;

    return htmlToEl(html);
  }

  async getFeatures() {
    let response = await axios
      .get(config.URLs.getTrackFeatures + this.id)
      .catch((err) => console.error(err));

    return response.data;
  }
}

export default Track;

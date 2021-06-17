import { config, millisToMinutesAndSeconds } from "../config.js";

class Track {
  constructor(
    name,
    images,
    duration,
    uri,
    popularity,
    dateAddedToPlaylist = ""
  ) {
    this.name = name;
    this.images = images;
    if (dateAddedToPlaylist) {
      this.dateAddedToPlaylist = new Date(dateAddedToPlaylist);
    } else {
      this.dateAddedToPlaylist = "";
    }

    if (this.images.length > 0) {
      let img = this.images[0];
      this.imgURL = img.url;
    } else {
      this.imgURL = "";
    }

    this.duration = millisToMinutesAndSeconds(duration);

    // either the normal uri, or the linked_from.uri
    this.uri = uri;
    this.popularity = popularity;
    console.log(this.popularity);
  }

  getTrackCardHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.trackPrefix}${idx}`;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;
    }

    return `
            <button class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.track}" id="${id}">
              <img src="${this.imgURL}"></img>
              <h4 class="${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
            </button>
          `;
  }

  getPlaylistTrackHtml() {
    return `
            <li class="${config.CSS.CLASSES.playlistTrack}">
              <img src="${this.imgURL}"></img>
              <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.name
    }">${this.name}</h4>
              <h5>${this.duration}</h5>
              <h5>${this.dateAddedToPlaylist.toLocaleDateString()}</h5>
            </li>
            `;
  }
}

export default Track;

import { config, millisToMinutesAndSeconds } from "../config.js";

class Track {
  constructor(name, images, duration) {
    this.name = name;
    this.images = images;

    if (this.images.length > 0) {
      let img = this.images[0];
      this.url = img.url;
    } else {
      this.url = "";
    }

    this.duration = millisToMinutesAndSeconds(duration);
  }

  getTrackCardHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.trackPrefix}${idx}`;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;
    }

    return `
            <div class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.track}" id="${id}">
              <img src="${this.url}"></img>
              <h4>${this.name}</h4>
            </div>
          `;
  }

  getPlaylistTrackHtml() {
    return `
              <li class="${config.CSS.CLASSES.playlistTrack}">
                <img src="${this.url}"></img>
                <h4>${this.name}</h4>
                <h5>${this.duration}</h5>
              </li>
            `;
  }
}

export default Track;

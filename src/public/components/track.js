import { config } from "../config.js";

class Track {
  constructor(name, images) {
    this.name = name;
    this.images = images;
  }

  getTrackHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.trackPrefix}${idx}`;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;
    }

    return `
            <div class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.track}" id="${id}">
              <img src="${url}"></img>
              <h4>${this.name}</h4>
            </div>
        `;
  }
}

export default Track;

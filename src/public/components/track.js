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
      album,
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
    this.album = album;

    // obtain the correct image
    if (this.images.length > 0) {
      let img = this.images[0];
      this.imgURL = img.url;
    } else {
      this.imgURL = "";
    }
  }

  /** Produces the card element of this track.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getTrackCardHtml(idx) {
    let id = `${config.CSS.IDs.trackPrefix}${idx}`;
    this.cardId = id;
    let html = `
            <div class="${config.CSS.CLASSES.flipCard}">
              <button class="${config.CSS.CLASSES.card} ${
      config.CSS.CLASSES.flipCardInner
    } ${config.CSS.CLASSES.track}" id="${id}">
                <div class="${config.CSS.CLASSES.flipCardFront}">
                  <img src="${this.imgURL}"></img>
                  <div>
                    <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.scrollingText
    }">${this.name}</h4>
                  </div>
                </div>
                <div class=${config.CSS.CLASSES.flipCardBack}>
                <h3>Duration:</h3>
                <p>${this.duration}</p>
                <h3>Release Date:</h3>
                <p>${this.releaseDate.toDateString()}</p>
                <h3>Album Name:</h3>
                <p class="${config.CSS.CLASSES.ellipsisWrap}">${
      this.album.albumName
    }</p>
                </div>
              </button>
            </div>
          `;
    return htmlToEl(html);
  }

  /** Get a track html to be placed as a list element.
   *
   * @returns {ChildNode} - The converted html string to an element
   */
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

  /** Load the feeatures of a track from the spotify web api and store them.
   *
   */
  async loadFeatures() {
    let response = await axios
      .get(config.URLs.getTrackFeatures + this.id)
      .catch((err) => {
        console.error(err);
        throw new Error(err);
      });

    if (response) {
      this.features = response.data;
    }
  }
}

export default Track;

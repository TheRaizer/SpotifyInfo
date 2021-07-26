import { config, htmlToEl, getValidImage } from "../config.js";

class Artist {
  constructor(name, genres, followerCount, externalUrl, images) {
    this.name = name;
    this.genres = genres;
    this.followerCount = followerCount;
    this.externalUrl = externalUrl;
    this.imageUrl = getValidImage(images);
  }

  /** Produces the card element of this artist.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getArtistCardHtml(idx) {
    let id = `${config.CSS.IDs.artistPrefix}${idx}`;

    this.cardId = id;
    let html = `
          <button class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.noSelect} ${config.CSS.CLASSES.artist}" id="${id}" title="Click to View Tracks">
            <img src="${this.imageUrl}" alt="Artist Cover"></img>
            <h4 class="${config.CSS.CLASSES.scrollingText} ${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
          </button>
      `;
    return htmlToEl(html);
  }
}

export default Artist;

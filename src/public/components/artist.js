import { config, htmlToEl, getValidImage } from "../config.js";

class Artist {
  constructor(genres, followerCount, externalUrl, images) {
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
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    this.cardId = id;
    let html = `
          <button class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.playlist} ${config.CSS.CLASSES.noSelect}" id="${id}" title="Click to View Tracks">
            <img src="${this.imageUrl}" alt="Artist Cover"></img>
            <div>
              <h4 class="${config.CSS.CLASSES.scrollingText} ${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
            </div>
          </button>
      `;
    return htmlToEl(html);
  }
}

export default Artist;

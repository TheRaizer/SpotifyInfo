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
    let genreList = "";
    this.genres.forEach((genre) => {
      genreList += "<li>" + genre + "</li>";
    });

    let html = `
          <button class="${config.CSS.CLASSES.card} ${config.CSS.CLASSES.noSelect} ${config.CSS.CLASSES.artist} ${config.CSS.CLASSES.fadeIn}" id="${id}" title="Click to View Tracks">
            <div id="${config.CSS.IDs.initialCard}" title="Click to Expand">
              <img src="${this.imageUrl}" alt="Artist Cover"></img>
              <div>
                <h4 class="${config.CSS.CLASSES.scrollingText} ${config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
              </div>
            </div>
            <div class="${config.CSS.CLASSES.firstExpansion}" style="display:none">
              <h4>Genres</h4>
              <ul>${genreList}</ul>
              <h4>Followers</h4>
              <h4>Popularity</h4>
            </div>
            <div class="${config.CSS.CLASSES.secondExpansion}" style="display:none">
              <h4>Most Popular</h4>
              <ul></ul>
              <h4>Recommended For You</h4>
              <ul></ul>
            </div>
          </button>
      `;
    return htmlToEl(html);
  }
}

export default Artist;

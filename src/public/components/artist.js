import { config, htmlToEl, getValidImage } from "../config.js";

class Artist {
  constructor(id, name, genres, followerCount, externalUrl, images) {
    this.artistId = id;
    this.name = name;
    this.genres = genres;
    this.followerCount = followerCount;
    this.externalUrl = externalUrl;
    this.imageUrl = getValidImage(images);
    this.topTracks = undefined;
  }

  /** Produces the card element of this artist.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getArtistHtml(idx) {
    let id = `${config.CSS.IDs.artistPrefix}${idx}`;

    this.cardId = id;
    let genreList = "";
    this.genres.forEach((genre) => {
      genreList += "<li>" + genre + "</li>";
    });

    let html = `
      <button class="${config.CSS.CLASSES.artist}">
        <div class="artist-base">
          <img src=${this.imageUrl} alt="Artist"/>
          <h4>${this.name}</h4>
          <ul class="genres">
            ${genreList}
          </ul>
        </div>
        <div class="tracks-area">
          <div>
            <h4>Top Tracks</h4>
            <ul class="scroll-bar track-list">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            </ul>
          </div>
          <div>
            <h4>Recommended Tracks</h4>
            <ul class="scroll-bar track-list">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            </ul>
          </div>
        </div>
      </button>
      `;
    return htmlToEl(html);
  }

  async loadTopTracks() {
    let res = await axios.get(config.URLs.getArtistTopTracks + this.artistId);
    console.log(res);
    return;
  }

  hasLoadedTopTracks() {
    return this.topTracks === undefined ? false : true;
  }
}

export default Artist;

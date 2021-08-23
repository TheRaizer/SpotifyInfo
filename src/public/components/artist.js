import { config, htmlToEl, getValidImage } from "../config.js";
import { generateTracksFromData } from "../components/track.js";
import Card from "./card.js";

class Artist extends Card {
  constructor(id, name, genres, followerCount, externalUrl, images) {
    super();
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
      <div class="${config.CSS.CLASSES.artist} ${config.CSS.CLASSES.fadeIn}" id="${this.cardId}">
        <section class="${config.CSS.CLASSES.content}">
          <header class="artist-base">
            <img src=${this.imageUrl} alt="Artist"/>
            <h3>${this.name}</h3>
            <ul class="genres">
              ${genreList}
            </ul>
          </header>
          <div class="${config.CSS.CLASSES.tracksArea}">
            <section class="${config.CSS.CLASSES.artistTopTracks}">
              <header>
                <h4>Top Tracks</h4>
              </header>
              <ul class="${config.CSS.CLASSES.scrollBar} ${config.CSS.CLASSES.trackList}">
              </ul>
            </section>
          </div>
        </section>
      </div>
      `;
    return htmlToEl(html);
  }

  /** Produces the card element of this artist.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getArtistCardHtml(idx, unanimatedAppear = false) {
    let id = `${config.CSS.IDs.artistPrefix}${idx}`;
    this.cardId = id;
    let appearClass = unanimatedAppear ? config.CSS.CLASSES.appear : "";
    let html = `
            <div class="${config.CSS.CLASSES.rankCard} ${
      config.CSS.CLASSES.fadeIn
    } ${appearClass}">
              <h4 id="${config.CSS.IDs.rank}">${idx + 1}.</h4>
              <div class="${config.CSS.CLASSES.flipCard} ${
      config.CSS.CLASSES.noSelect
    }  ${config.CSS.CLASSES.expandOnHover}">
                <button class="${config.CSS.CLASSES.card} ${
      config.CSS.CLASSES.flipCardInner
    } ${config.CSS.CLASSES.artist}" id="${this.getCardId()}">
                  <div class="${
                    config.CSS.CLASSES.flipCardFront
                  }"  title="Click to view more Info">
                    <img src="${this.imageUrl}" alt="Album Cover"></img>
                    <div>
                      <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.scrollingText
    }">${this.name}</h4>
                    </div>
                  </div>
                  <div class=${config.CSS.CLASSES.flipCardBack}>
                    <h3>Followers:</h3>
                    <p>${this.followerCount}</p>
                  </div>
                </button>
              </div>
            </div>
          `;
    return htmlToEl(html);
  }

  async loadTopTracks() {
    let res = await axios.get(config.URLs.getArtistTopTracks + this.artistId);
    let tracksData = res.data.tracks;
    let trackObjs = [];

    generateTracksFromData(tracksData, trackObjs);

    this.topTracks = trackObjs;
    return trackObjs;
  }

  hasLoadedTopTracks() {
    return this.topTracks === undefined ? false : true;
  }
}

export function generateArtistsFromData(datas, artistArr) {
  datas.forEach((data) => {
    artistArr.push(
      new Artist(
        data.id,
        data.name,
        data.genres,
        data.followers.total,
        data.external_urls.spotify,
        data.images
      )
    );
  });
  return artistArr;
}

export default Artist;

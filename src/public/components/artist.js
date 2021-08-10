import { config, htmlToEl, getValidImage } from "../config.js";
import Track from "../components/track.js";

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
      <div class="${config.CSS.CLASSES.artist}">
        <div class="artist-base">
          <img src=${this.imageUrl} alt="Artist"/>
          <h3>${this.name}</h3>
          <ul class="genres">
            ${genreList}
          </ul>
        </div>
        <div class="${config.CSS.CLASSES.tracksArea}">
          <div class="${config.CSS.CLASSES.artistTopTracks}">
            <h4>Top Tracks</h4>
            <ul class="${config.CSS.CLASSES.scrollBar} ${config.CSS.CLASSES.trackList}">
            </ul>
          </div>
        </div>
      </div>
      `;
    return htmlToEl(html);
  }

  async loadTopTracks() {
    let res = await axios.get(config.URLs.getArtistTopTracks + this.artistId);
    let tracksData = res.data.tracks;
    let trackObjs = [];

    tracksData.forEach((track) => {
      let props = {
        name: track.name,
        images: track.album.images,
        duration: track.duration_ms,
        uri:
          track.linked_from !== undefined ? track.linked_from.uri : track.uri,
        popularity: track.popularity,
        dateAddedToPlaylist: "",
        releaseDate: track.album.release_date,
        id: track.id,
        externalUrl: track.external_urls.spotify,
        artists: track.artists,
      };
      // push an instance of a Track class to the list
      trackObjs.push(new Track(props));
    });

    this.topTracks = trackObjs;
    return trackObjs;
  }

  hasLoadedTopTracks() {
    return this.topTracks === undefined ? false : true;
  }
}

export default Artist;

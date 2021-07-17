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
      externalUrl,
      artists,
    } = props;

    this.externalUrl = externalUrl;
    this.id = id;
    this.name = name;
    this.images = images;
    this.filterDataFromArtists(artists);
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

  filterDataFromArtists(artists) {
    this.artists = artists.map((artist) => {
      return { name: artist.name, externalUrl: artist.external_urls.spotify };
    });
  }

  generateHTMLArtistNames() {
    let artistNames = "";
    for (let i = 0; i < this.artists.length; i++) {
      const artist = this.artists[i];
      artistNames += `<a href="${artist.externalUrl}">${artist.name}</a>`;

      if (i < this.artists.length - 1) {
        artistNames += ", ";
      }
    }

    return artistNames;
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
            <div class="${config.CSS.CLASSES.rankCard}">
              <h4 id="${config.CSS.IDs.rank}">${idx + 1}.</h4>
              <div class="${config.CSS.CLASSES.flipCard} ${
      config.CSS.CLASSES.noSelect
    }">
                <button class="${config.CSS.CLASSES.card} ${
      config.CSS.CLASSES.flipCardInner
    } ${config.CSS.CLASSES.track}" id="${id}">
                  <div class="${
                    config.CSS.CLASSES.flipCardFront
                  }"  title="Click to view more Info">
                    <img src="${this.imgURL}" alt="Album Cover"></img>
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
              <img class="${config.CSS.CLASSES.noSelect}" src="${
      this.imgURL
    }"></img>
              <div>
                <a href="${this.externalUrl}">
                  <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.name
    }">${this.name}
                  </h4>
                <a/>
                <div class="${config.CSS.CLASSES.ellipsisWrap}">
                  ${this.generateHTMLArtistNames()}
                </div>
              </div>
              <h5>${this.duration}</h5>
              <h5>${this.dateAddedToPlaylist.toLocaleDateString()}</h5>
            </li>
            `;

    return htmlToEl(html);
  }
}

export default Track;

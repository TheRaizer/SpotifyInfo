import {
  config,
  millisToMinutesAndSeconds,
  htmlToEl,
  getValidImage,
} from "../config.js";
import {
  checkIfIsPlayingElAfterRerender,
  isSamePlayingURI,
} from "./playback-sdk.js";
import Album from "./album.js";
import Card from "./card.js";
import TrackPlayEventArg from "./pubsub/event-args/track-play-args.js";
import DoublyLinkedList from "./doubly-linked-list.js";

class Track extends Card {
  constructor(props) {
    super();
    let {
      name,
      images,
      duration,
      uri,
      popularity,
      releaseDate,
      id,
      album,
      externalUrl,
      artists,
      idx = -1,
    } = props;

    // This tracks index in an array if it is contained in one. (used to find previous and next tracks)
    this.idx = idx;
    this.externalUrl = externalUrl;
    this.id = id;
    this.name = name;
    this.filterDataFromArtists(artists);
    this.duration = millisToMinutesAndSeconds(duration);

    // either the normal uri, or the linked_from.uri
    this.uri = uri;
    this.popularity = popularity;
    this.dateAddedToPlaylist;
    this.releaseDate = new Date(releaseDate);
    this.album = album;
    this.features = undefined;

    this.imageUrl = getValidImage(images);
    this.playBtn = null;
  }

  setDateAdded(dateAddedToPlaylist) {
    this.dateAddedToPlaylist = new Date(dateAddedToPlaylist);
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
      artistNames += `<a href="${artist.externalUrl}" target="_blank">${artist.name}</a>`;

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
  getTrackCardHtml(idx, unanimatedAppear = false) {
    let id = `${config.CSS.IDs.trackPrefix}${idx}`;
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
    } ${config.CSS.CLASSES.track}" id="${this.getCardId()}">
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
                    <h3>Duration:</h3>
                    <p>${this.duration}</p>
                    <h3>Release Date:</h3>
                    <p>${this.releaseDate.toDateString()}</p>
                    <h3>Album Name:</h3>
                    <a href="${this.album.externalUrl}">
                      <p class="${config.CSS.CLASSES.ellipsisWrap}">${
      this.album.name
    }</p>
                    </a>
                  </div>
                </button>
              </div>
            </div>
          `;
    return htmlToEl(html);
  }

  /** Get a track html to be placed as a list element.
   *
   * @param {Boolean} displayDate - whether to display the date.
   * @returns {ChildNode} - The converted html string to an element
   */
  getPlaylistTrackHtml(trackDataList, displayDate = true) {
    const track_uri = this.uri;
    const title = this.name;

    var trackDataNode = trackDataList.get(this.idx, true);

    function playPauseClick(btn) {
      // select this track to play or pause by publishing the track play event arg
      window.eventAggregator.publish(
        new TrackPlayEventArg(
          {
            selEl: btn,
            track_uri: track_uri,
            trackTitle: title,
          },
          trackDataNode
        )
      );
    }

    let html = `
            <li class="${config.CSS.CLASSES.playlistTrack}">
              <button class="play-pause ${
                isSamePlayingURI(this.uri) ? config.CSS.CLASSES.selected : ""
              }"><img src="" alt="play/pause" 
              class="${config.CSS.CLASSES.noSelect}"/></button>
              <img class="${config.CSS.CLASSES.noSelect}" src="${
      this.imageUrl
    }"></img>
              <div class="${config.CSS.CLASSES.links}">
                <a href="${this.externalUrl}" target="_blank">
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
              ${
                displayDate
                  ? `<h5>${this.dateAddedToPlaylist.toLocaleDateString()}</h5>`
                  : ""
              }
            </li>
            `;

    let el = htmlToEl(html);

    // get play pause button
    let playPauseBtn = el.childNodes[1];
    playPauseBtn.addEventListener("click", () => playPauseClick(playPauseBtn));

    checkIfIsPlayingElAfterRerender(this.uri, playPauseBtn, trackDataNode);

    return el;
  }

  /** Get a track html to be placed as a list element on a ranked list.
   *
   * @returns {ChildNode} - The converted html string to an element
   */
  getRankedTrackHtml(rank) {
    let html = `
            <li class="${config.CSS.CLASSES.playlistTrack}">
              <p>${rank}.</p>
              <img class="${config.CSS.CLASSES.noSelect}" src="${
      this.imageUrl
    }"></img>
              <div class="${config.CSS.CLASSES.links}">
                <a href="${this.externalUrl}" target="_blank">
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
            </li>
            `;

    return htmlToEl(html);
  }

  /** Load the features of this track from the spotify web api.*/
  async loadFeatures() {
    let res = await axios
      .get(config.URLs.getTrackFeatures + this.id)
      .catch((err) => {
        throw err;
      });
    let feats = res.data.audio_features;
    this.features = {
      danceability: feats.danceability,
      acousticness: feats.acousticness,
      instrumentalness: feats.instrumentalness,
      valence: feats.valence,
      energy: feats.energy,
    };

    return this.features;
  }
}

/** Generate tracks from data excluding date added.
 *
 * @param {*} datas
 * @param {DoublyLinkedList} trackList - double linked list
 * @returns
 */
export function generateTracksFromData(datas, trackList) {
  for (let i = 0; i < datas.length; i++) {
    const data = datas[i];
    if (data) {
      let props = {
        name: data.name,
        images: data.album.images,
        duration: data.duration_ms,
        uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
        popularity: data.popularity,
        releaseDate: data.album.release_date,
        id: data.id,
        album: new Album(data.album.name, data.album.external_urls.spotify),
        externalUrl: data.external_urls.spotify,
        artists: data.artists,
        idx: i,
      };
      if (trackList) {
        trackList.add(new Track(props));
      }
    }
  }
  return trackList;
}

/** Generate track datas doubly linked list to be passed whose node representing this track will be passed into the track event args.
 *
 * @param {DoublyLinkedList} trackList
 */
export function generateTrackEventDataFromList(trackList) {
  var trackDataList = new DoublyLinkedList();
  for (const track of trackList.values()) {
    trackDataList.add({
      selEl: track.playBtn,
      track_uri: track.uri,
      trackTitle: track.name,
    });
  }

  return trackDataList;
}

export default Track;

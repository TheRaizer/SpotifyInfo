import {
  config,
  millisToMinutesAndSeconds,
  htmlToEl,
  getValidImage
} from '../config'
import {
  checkIfIsPlayingElAfterRerender,
  isSamePlayingURI
} from './playback-sdk'
import Album from './album'
import Card from './card'
import PlayableEventArg from './pubsub/event-args/track-play-args'
import { SpotifyImg, FeaturesData, IArtistTrackData, IPlayable, ExternalUrls, TrackData } from '../../types'
import DoublyLinkedList, { DoublyLinkedListNode } from '../components/doubly-linked-list'
import axios from 'axios'
import EventAggregator from './pubsub/aggregator'

const eventAggregator = (window as any).eventAggregator as EventAggregator

class Track extends Card implements IPlayable {
  private externalUrls: ExternalUrls;
  private _id: string;
  private _title: string;
  private _duration: string;
  private _uri: string;
  private _dateAddedToPlaylist: Date;

  popularity: string;
  releaseDate: Date;
  album: Album;
  features: FeaturesData | undefined;
  imageUrl: string;
  selEl: Element;
  artistsDatas: Array<IArtistTrackData>
  onPlaying: Function
  onStopped: Function

  public get id (): string {
    return this._id
  }

  public get title (): string {
    return this._title
  }

  public get uri (): string {
    return this._uri
  }

  public get dateAddedToPlaylist (): Date {
    return this._dateAddedToPlaylist
  }

  public setDateAddedToPlaylist (val: string | number | Date) {
    this._dateAddedToPlaylist = new Date(val)
  }

  constructor (props: { title: string; images: Array<SpotifyImg>; duration: number; uri: string; popularity: string; releaseDate: string; id: string; album: Album; externalUrls: ExternalUrls; artists: Array<unknown>; idx: number }) {
    super()
    const {
      title,
      images,
      duration,
      uri,
      popularity,
      releaseDate,
      id,
      album,
      externalUrls,
      artists
    } = props

    this.externalUrls = externalUrls
    this._id = id
    this._title = title
    this.artistsDatas = this.filterDataFromArtists(artists)
    this._duration = millisToMinutesAndSeconds(duration)
    this._dateAddedToPlaylist = new Date()

    // either the normal uri, or the linked_from.uri
    this._uri = uri
    this.popularity = popularity
    this.releaseDate = new Date(releaseDate)
    this.album = album
    this.features = undefined

    this.imageUrl = getValidImage(images)
    this.selEl = htmlToEl('<></>') as Element

    this.onPlaying = () => {}
    this.onStopped = () => {}
  }

  private filterDataFromArtists (artists: Array<unknown>) {
    return artists.map((artist) => artist as IArtistTrackData)
  }

  public generateHTMLArtistNames () {
    let artistNames = ''
    for (let i = 0; i < this.artistsDatas.length; i++) {
      const artist = this.artistsDatas[i]
      artistNames += `<a href="${artist.external_urls.spotify}" target="_blank">${artist.name}</a>`

      if (i < this.artistsDatas.length - 1) {
        artistNames += ', '
      }
    }
    return artistNames
  }

  /** Produces the card element of this track.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  public getTrackCardHtml (idx: number, unanimatedAppear = false) : Node {
    const id = `${config.CSS.IDs.trackPrefix}${idx}`
    this.cardId = id
    const appearClass = unanimatedAppear ? config.CSS.CLASSES.appear : ''

    const html = `
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
                    <div ${config.CSS.ATTRIBUTES.restrictFlipOnClick}="true" id="${this._uri}" class="${config.CSS.CLASSES.playBtn} ${
                isSamePlayingURI(this.uri) ? config.CSS.CLASSES.selected : ''
              }" title="Click to play song"></div>
                    <img src="${this.imageUrl}" alt="Album Cover"></img>
                    <div>
                      <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.scrollingText
    }">${this.title}</h4>
                    </div>
                  </div>
                  <div class=${config.CSS.CLASSES.flipCardBack}>
                    <h3>Duration:</h3>
                    <p>${this._duration}</p>
                    <h3>Release Date:</h3>
                    <p>${this.releaseDate.toDateString()}</p>
                    <h3>Album Name:</h3>
                    <a href="${this.externalUrls.spotify}">
                      <p ${config.CSS.ATTRIBUTES.restrictFlipOnClick}="true" class="${config.CSS.CLASSES.ellipsisWrap}">${
      this.album.name
    }</p>
                    </a>
                  </div>
                </button>
              </div>
            </div>
          `

    const el = htmlToEl(html) as HTMLElement
    const playBtn = el.getElementsByClassName(config.CSS.CLASSES.playBtn)[0]

    this.selEl = playBtn

    playBtn.addEventListener('click', () => {
      const trackNode = new DoublyLinkedListNode<IPlayable>(this)
      this.playPauseClick(trackNode)
    })

    return el as Node
  }

  private playPauseClick (trackNode: DoublyLinkedListNode<IPlayable>) {
    const track = this as IPlayable
    // select this track to play or pause by publishing the track play event arg
    eventAggregator.publish(new PlayableEventArg(track, trackNode))
  }

  /** Get a track html to be placed as a list element.
   *
   * @param {Boolean} displayDate - whether to display the date.
   * @returns {ChildNode} - The converted html string to an element
   */
  public getPlaylistTrackHtml (trackList: DoublyLinkedList<IPlayable>, displayDate: boolean = true): Node {
    const trackNode = trackList.find((x) => x.uri === this.uri, true) as DoublyLinkedListNode<IPlayable>
    // for the unique play pause ID also use the date added to playlist as there can be duplicates of a song in a playlist.
    const playPauseId = this._uri + this.dateAddedToPlaylist

    const html = `
            <li class="${config.CSS.CLASSES.playlistTrack}">
              <button id="${playPauseId}" class="${config.CSS.CLASSES.playBtn} ${
                isSamePlayingURI(this.uri) ? config.CSS.CLASSES.selected : ''
              }">
              </button>
              <img class="${config.CSS.CLASSES.noSelect}" src="${
      this.imageUrl
    }"></img>
              <div class="${config.CSS.CLASSES.links}">
                <a href="${this.externalUrls.spotify}" target="_blank">
                  <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.name
    }">${this.title}
                  </h4>
                <a/>
                <div class="${config.CSS.CLASSES.ellipsisWrap}">
                  ${this.generateHTMLArtistNames()}
                </div>
              </div>
              <h5>${this._duration}</h5>
              ${
                displayDate
                  ? `<h5>${this.dateAddedToPlaylist.toLocaleDateString()}</h5>`
                  : ''
              }
            </li>
            `

    const el = htmlToEl(html)

    // get play pause button
    const playPauseBtn = el?.childNodes[1]
    if (playPauseBtn === null) {
      throw new Error('Play pause button on track was not found')
    }
    this.selEl = playPauseBtn as Element
    playPauseBtn?.addEventListener('click', () => this.playPauseClick(trackNode))

    checkIfIsPlayingElAfterRerender(this.uri, playPauseBtn as Element, trackNode)

    return el as Node
  }

  /** Get a track html to be placed as a list element on a ranked list.
   *
   * @param {DoublyLinkedList<Track>} trackList - list of tracks that contains this track.
   * @param {number} rank - the rank of this card
   * @returns {ChildNode} - The converted html string to an element
   */
  public getRankedTrackHtml (trackList: DoublyLinkedList<Track>, rank: number): Node {
    const trackNode = trackList.find((x) => x.uri === this.uri, true) as DoublyLinkedListNode<IPlayable>
    const html = `
            <li class="${config.CSS.CLASSES.playlistTrack}">
            <div class="${config.CSS.CLASSES.rankedTrackInteract} ${
                isSamePlayingURI(this.uri) ? config.CSS.CLASSES.selected : ''
              }">
              <button id="${this._uri}" class="${config.CSS.CLASSES.playBtn} ${
                  isSamePlayingURI(this.uri) ? config.CSS.CLASSES.selected : ''
                }">
              </button>
              <p>${rank}.</p>
            </div>
              <img class="${config.CSS.CLASSES.noSelect}" src="${
      this.imageUrl
    }"></img>
              <div class="${config.CSS.CLASSES.links}">
                <a href="${this.externalUrls.spotify}" target="_blank">
                  <h4 class="${config.CSS.CLASSES.ellipsisWrap} ${
      config.CSS.CLASSES.name
    }">${this.title}
                  </h4>
                <a/>
                <div class="${config.CSS.CLASSES.ellipsisWrap}">
                  ${this.generateHTMLArtistNames()}
                </div>
              </div>
              <h5>${this._duration}</h5>
            </li>
            `

    const el = htmlToEl(html)

    // get play pause button
    const playPauseBtn = el?.childNodes[1].childNodes[1]

    if (playPauseBtn === null) {
      throw new Error('Play pause button on track was not found')
    }
    this.selEl = playPauseBtn as Element

    // select the rank area as to keep the play/pause icon shown
    const rankedInteract = (el as HTMLElement).getElementsByClassName(config.CSS.CLASSES.rankedTrackInteract)[0]
    this.onPlaying = () => rankedInteract.classList.add(config.CSS.CLASSES.selected)
    this.onStopped = () => rankedInteract.classList.remove(config.CSS.CLASSES.selected)

    playPauseBtn?.addEventListener('click', () => {
      this.playPauseClick(trackNode)
    })

    checkIfIsPlayingElAfterRerender(this.uri, playPauseBtn as Element, trackNode)

    return el as Node
  }

  /** Load the features of this track from the spotify web api. */
  public async loadFeatures () {
    const res = await axios
      .get(config.URLs.getTrackFeatures + this.id)
      .catch((err) => {
        throw err
      })
    const feats = res.data.audio_features
    this.features = {
      danceability: feats.danceability,
      acousticness: feats.acousticness,
      instrumentalness: feats.instrumentalness,
      valence: feats.valence,
      energy: feats.energy
    }

    return this.features
  }
}

/** Generate tracks from data excluding date added.
 *
 * @param {Array<TrackData>} datas
 * @param {DoublyLinkedList<Track> | Array<Track>} tracks - double linked list
 * @returns
 */
export function generateTracksFromData (datas: Array<TrackData>, tracks: DoublyLinkedList<Track> | Array<Track>) {
  for (let i = 0; i < datas.length; i++) {
    const data = datas[i]
    if (data) {
      const props = {
        title: data.name,
        images: data.album.images,
        duration: data.duration_ms,
        uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
        popularity: data.popularity,
        releaseDate: data.album.release_date,
        id: data.id,
        album: new Album(data.album.name, data.album.external_urls.spotify),
        externalUrls: data.external_urls,
        artists: data.artists,
        idx: i
      }
      if (Array.isArray(tracks)) {
        tracks.push(new Track(props))
      } else {
        tracks.add(new Track(props))
      }
    }
  }
  return tracks
}

export default Track

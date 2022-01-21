import { config, htmlToEl, getValidImage } from '../config'
import Track, { generateTracksFromData } from './track'
import Card from './card'
import DoublyLinkedList from './doubly-linked-list'
import { PlaylistTrackData, SpotifyImg, TrackData } from '../../types'
import axios from 'axios'

class Playlist extends Card {
  name: string
  id: string
  undoStack: Array<Array<Track>>
  order: string
  trackList: undefined | DoublyLinkedList<Track>
  imageUrl: string

  constructor (name: string, images: Array<SpotifyImg>, id: string) {
    super()
    this.name = name
    this.id = id
    this.undoStack = []
    this.order = 'custom-order' // set it as the initial order
    this.trackList = undefined

    // the id of the playlist card element
    this.imageUrl = getValidImage(images)
  }

  addToUndoStack (tracks: Array<Track>) {
    this.undoStack.push(tracks)
  }

  /**
   * Produces the card element of this playlist.
   *
   * @param {Number} idx The card index to use for the elements id suffix
   * @returns {ChildNode} The converted html string to an element
   */
  getPlaylistCardHtml (idx: number, inTextForm: boolean, isSelected = false): Node {
    const id = `${config.CSS.IDs.playlistPrefix}${idx}`

    const expandOnHover = inTextForm ? '' : config.CSS.CLASSES.expandOnHover

    this.cardId = id
    const html = `
        <div class="${expandOnHover}">
          <button class="${config.CSS.CLASSES.fadeIn} ${
      config.CSS.CLASSES.card
    } ${config.CSS.CLASSES.playlist} ${config.CSS.CLASSES.noSelect} ${
      isSelected ? config.CSS.CLASSES.selected : ''
    }" id="${this.getCardId()}" title="Click to View Tracks">
              <img src="${this.imageUrl}" alt="Playlist Cover" title="Playlist Cover"></img>
              <h4 class="${config.CSS.CLASSES.scrollingText} ${
      config.CSS.CLASSES.ellipsisWrap
    }">${this.name}</h4>
          </button>
        </div>
      `
    return htmlToEl(html) as Node
  }

  /**
   * Produces list of Track class instances using track datas from spotify web api.
   *
   * @returns {DoublyLinkedList<Track>} List of track classes created using the obtained track datas.
   */
  async loadTracks (): Promise<DoublyLinkedList<Track> | null> {
    const res = await axios.request<Array<PlaylistTrackData>>({ method: 'get', url: `${config.URLs.getPlaylistTracks + this.id}` })
      .catch((err) => {
        throw new Error(err)
      })

    if (!res) {
      return null
    }
    const trackList = new DoublyLinkedList<Track>()

    // map each track data in the playlist data to an array.
    let tracksData = res.data.map((data) => data.track) as Array<TrackData>

    // filter any data that has a null id as the track would not be unplayable
    tracksData = tracksData.filter((data) => data.id !== null)

    getPlaylistTracksFromDatas(tracksData, res.data, trackList)

    // define track objects
    this.trackList = trackList
    return trackList
  }

  hasLoadedTracks () {
    return this.trackList !== undefined
  }
}

/**
 * Gets playlist tracks from data. This also initializes the date added.
 *
 * @param {Array<TrackData>} tracksData an array of containing each track's data
 * @param {Array<PlaylistTrackData>} dateAddedObjects The object that contains the added_at variable.
 * @param {DoublyLinkedList<Track>} tracksList the doubly linked list to put the tracks into.
 */
export function getPlaylistTracksFromDatas (
  tracksData: Array<TrackData>,
  dateAddedObjects: Array<PlaylistTrackData>,
  trackList: DoublyLinkedList<Track>
) {
  generateTracksFromData(tracksData, trackList)

  let i = 0
  // set the dates added
  for (const trackOut of trackList.values()) {
    const dateAddedObj = dateAddedObjects[i]
    const track: Track = trackOut

    track.setDateAddedToPlaylist(dateAddedObj.added_at)
    i++
  }
}

export default Playlist

import { config, htmlToEl, getValidImage } from '../config'
import Track, { generateTracksFromData } from './track'
import Card from './card'
import DoublyLinkedList from './doubly-linked-list'
import { ArtistData, SpotifyImg } from '../../types'
import axios from 'axios'

class Artist extends Card {
  artistId: string;
  name: string;
  genres: Array<string>;
  followerCount: string;
  externalUrl: string;
  imageUrl: string;
  topTracks: DoublyLinkedList<Track> | undefined;

  constructor (id: string, name: string, genres: Array<string>, followerCount: string, externalUrl: string, images: Array<SpotifyImg>) {
    super()
    this.artistId = id
    this.name = name
    this.genres = genres
    this.followerCount = followerCount
    this.externalUrl = externalUrl
    this.imageUrl = getValidImage(images)
    this.topTracks = undefined
  }

  /**
   *  Produces the card element of this artist.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getArtistHtml (idx: number): Node {
    const id = `${config.CSS.IDs.artistPrefix}${idx}`

    this.cardId = id
    let genreList = ''
    this.genres.forEach((genre) => {
      genreList += '<li>' + genre + '</li>'
    })

    const html = `
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
      `
    return htmlToEl(html) as Node
  }

  /**
   * Produces the card element of this artist.
   *
   * @param {Number} idx - The card index to use for the elements id suffix
   * @returns {ChildNode} - The converted html string to an element
   */
  getArtistCardHtml (idx: number, unanimatedAppear = false): Node {
    const id = `${config.CSS.IDs.artistPrefix}${idx}`
    this.cardId = id
    const appearClass = unanimatedAppear ? config.CSS.CLASSES.appear : ''
    const html = `
            <div class="${config.CSS.CLASSES.rankCard} ${
      config.CSS.CLASSES.fadeIn
    } ${appearClass}">
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
          `
    return htmlToEl(html) as Node
  }

  async loadTopTracks () {
    const res = await axios.get(config.URLs.getArtistTopTracks(this.artistId))
    const tracksData = res.data.tracks
    const trackObjs = new DoublyLinkedList<Track>()

    generateTracksFromData(tracksData, trackObjs)

    this.topTracks = trackObjs
    return trackObjs
  }

  hasLoadedTopTracks () {
    return this.topTracks !== undefined
  }
}

export function generateArtistsFromData (datas: Array<ArtistData>, artistArr: Array<Artist>) {
  datas.forEach((data: ArtistData) => {
    artistArr.push(
      new Artist(
        data.id,
        data.name,
        data.genres,
        data.followers.total,
        data.external_urls.spotify,
        data.images
      )
    )
  })
  return artistArr
}

export default Artist

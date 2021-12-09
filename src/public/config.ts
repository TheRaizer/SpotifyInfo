
import { IPromiseHandlerReturn, SpotifyImg } from '../types'
import { TERMS, TERM_TYPE } from './components/save-load-term'
import axios from 'axios'

const authEndpoint = 'https://accounts.spotify.com/authorize'
// Replace with your app's client ID, redirect URI and desired scopes
const redirectUri = 'http://localhost:3000'
const clientId = '434f5e9f442a4e4586e089a33f65c857'
const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
]
export const config = {
  CSS: {
    IDs: {
      removeEarlyAdded: 'remove-early-added',
      getTokenLoadingSpinner: 'get-token-loading-spinner',
      playlistCardsContainer: 'playlist-cards-container',
      trackCardsContainer: 'track-cards-container',
      playlistPrefix: 'playlist-',
      trackPrefix: 'track-',
      spotifyContainer: 'spotify-container',
      infoContainer: 'info-container',
      allowAccessHeader: 'allow-access-header',
      expandedPlaylistMods: 'expanded-playlist-mods',
      playlistMods: 'playlist-mods',
      tracksData: 'tracks-data',
      tracksChart: 'tracks-chart',
      tracksTermSelections: 'tracks-term-selections',
      featureSelections: 'feature-selections',
      playlistsSection: 'playlists-section',
      undo: 'undo',
      redo: 'redo',
      modsOpener: 'mods-opener',
      featDef: 'feat-definition',
      featAverage: 'feat-average',
      rank: 'rank',
      viewAllTopTracks: 'view-all-top-tracks',
      emojis: 'emojis',
      artistCardsContainer: 'artist-cards-container',
      artistPrefix: 'artist-',
      initialCard: 'initial-card',
      convertCard: 'convert-card',
      artistTermSelections: 'artists-term-selections',
      profileHeader: 'profile-header',
      clearData: 'clear-data',
      likedTracks: 'liked-tracks',
      followedArtists: 'followed-artists',
      webPlayer: 'web-player',
      playTimeBar: 'playtime-bar',
      playlistHeaderArea: 'playlist-main-header-area',
      playNext: 'play-next',
      playPrev: 'play-prev',
      webPlayerPlayPause: 'play-pause-player',
      webPlayerVolume: 'web-player-volume-bar',
      webPlayerProgress: 'web-player-progress-bar',
      playerTrackImg: 'player-track-img',
      webPlayerArtists: 'web-player-artists',
      generatePlaylist: 'generate-playlist',
      hideShowPlaylistTxt: 'hide-show-playlist-txt',
      topTracksTextFormContainer: 'term-text-form-container',
      username: 'username',
      topNavMobile: 'topnav-mobile',
      shuffle: 'shuffle'
    },
    CLASSES: {
      glow: 'glow',
      playlist: 'playlist',
      track: 'track',
      artist: 'artist',
      rankCard: 'rank-card',
      playlistTrack: 'playlist-track',
      infoLoadingSpinners: 'info-loading-spinner',
      appear: 'appear',
      hide: 'hide',
      selected: 'selected',
      card: 'card',
      playlistSearch: 'playlist-search',
      ellipsisWrap: 'ellipsis-wrap',
      name: 'name',
      playlistOrder: 'playlist-order',
      chartInfo: 'chart-info',
      flipCardInner: 'flip-card-inner',
      flipCardFront: 'flip-card-front',
      flipCardBack: 'flip-card-back',
      flipCard: 'flip-card',
      resizeContainer: 'resize-container',
      scrollLeft: 'scroll-left',
      scrollingText: 'scrolling-text',
      noSelect: 'no-select',
      dropDown: 'drop-down',
      expandableTxtContainer: 'expandable-text-container',
      borderCover: 'border-cover',
      firstExpansion: 'first-expansion',
      secondExpansion: 'second-expansion',
      invisible: 'invisible',
      fadeIn: 'fade-in',
      fromTop: 'from-top',
      expandOnHover: 'expand-on-hover',
      tracksArea: 'tracks-area',
      scrollBar: 'scroll-bar',
      trackList: 'track-list',
      artistTopTracks: 'artist-top-tracks',
      textForm: 'text-form',
      content: 'content',
      links: 'links',
      progress: 'progress',
      playPause: 'play-pause',
      rankedTrackInteract: 'ranked-interaction-area',
      slider: 'slider',
      playBtn: 'play-btn',
      displayNone: 'display-none',
      column: 'column',
      webPlayerControls: 'web-player-controls'
    },
    ATTRIBUTES: {
      dataSelection: 'data-selection',
      restrictFlipOnClick: 'data-restrict-flip-on-click'
    }
  },
  URLs: {
    siteUrl: 'http://localhost:3000',
    auth: `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      '%20'
    )}&response_type=code&show_dialog=true`,
    getHasTokens: '/tokens/has-tokens',
    getAccessToken: '/tokens/get-access-token',
    getObtainTokensPrefix: (code: string) => `/tokens/obtain-tokens?code=${code}`,
    getTopArtists: '/spotify/get-top-artists?time_range=',
    getTopTracks: '/spotify/get-top-tracks?time_range=',
    getPlaylists: '/spotify/get-playlists',
    getPlaylistTracks: '/spotify/get-playlist-tracks?playlist_id=',
    putClearTokens: '/tokens/clear-tokens',
    deletePlaylistTracks: (playlistId: string) => `/spotify/delete-playlist-items?playlist_id=${playlistId}`,
    postPlaylistTracks: (playlistId: string) => `/spotify/post-playlist-items?playlist_id=${playlistId}`,
    getTrackFeatures: '/spotify/get-tracks-features?track_ids=',
    putRefreshAccessToken: '/tokens/refresh-token',
    putSessionData: '/spotify/put-session-data?attr=',
    putPlaylistResizeData: (val: string) => `/user/put-playlist-resize-data?val=${val}`,
    getPlaylistResizeData: '/user/get-playlist-resize-data',
    putPlaylistIsInTextFormData: (val: string) => `/user/put-playlist-text-form-data?val=${val}`,
    getPlaylistIsInTextFormData: '/user/get-playlist-text-form-data',
    putTopTracksIsInTextFormData: (val: string) => `/user/put-top-tracks-text-form-data?val=${val}`,
    getTopTracksIsInTextFormData: '/user/get-top-tracks-text-form-data',
    getArtistTopTracks: (id: string) => `/spotify/get-artist-top-tracks?id=${id}`,
    getCurrentUserProfile: '/spotify/get-current-user-profile',
    putClearSession: '/clear-session',
    getCurrentUserSavedTracks: '/spotify/get-current-user-saved-tracks',
    getFollowedArtists: '/spotify/get-followed-artists',
    putPlayTrack: (device_id: string, track_uri: string) =>
      `/spotify/play-track?device_id=${device_id}&track_uri=${track_uri}`,
    putPlayerVolumeData: (val: string) => `/user/put-player-volume?val=${val}`,
    getPlayerVolumeData: '/user/get-player-volume',
    putTerm: (term: TERMS, termType: TERM_TYPE) => `/user/put-top-${termType}-term?term=${term}`,
    getTerm: (termType: TERM_TYPE) => `/user/get-top-${termType}-term`,
    putCurrPlaylistId: (id: string) => `/user/put-current-playlist-id?id=${id}`,
    getCurrPlaylistId: '/user/get-current-playlist-id',
    postPlaylist: (name: string) => `/spotify/post-playlist?name=${name}`,
    postItemsToPlaylist: (playlistId: string) => `/spotify/post-items-to-playlist?playlist_id=${playlistId}`,
    getUsername: '/user/get-username'
  },
  PATHS: {
    spinner: '/images/200pxLoadingSpinner.svg',
    acousticEmoji: '/images/Emojis/AcousticEmoji.svg',
    nonAcousticEmoji: '/images/Emojis/ElectricGuitarEmoji.svg',
    happyEmoji: '/images/Emojis/HappyEmoji.svg',
    neutralEmoji: '/images/Emojis/NeutralEmoji.svg',
    sadEmoji: '/images/Emojis/SadEmoji.svg',
    instrumentEmoji: '/images/Emojis/InstrumentEmoji.svg',
    singerEmoji: '/images/Emojis/SingerEmoji.svg',
    dancingEmoji: '/images/Emojis/DancingEmoji.svg',
    sheepEmoji: '/images/Emojis/SheepEmoji.svg',
    wolfEmoji: '/images/Emojis/WolfEmoji.svg',
    gridView: '/images/grid-view-icon.png',
    listView: '/images/list-view-icon.png',
    chevronLeft: '/images/chevron-left.png',
    chevronRight: '/images/chevron-right.png',
    playIcon: '/images/play-30px.png',
    pauseIcon: '/images/pause-30px.png',
    playBlackIcon: '/images/play-black-30px.png',
    pauseBlackIcon: '/images/pause-black-30px.png',
    playNext: '/images/next-30px.png',
    playPrev: '/images/previous-30px.png',
    profileUser: '/images/profile-user.png',
    shuffleIcon: '/images/shuffle-icon.png',
    shuffleIconGreen: '/images/shuffle-icon-green.png'
  }
}

export function millisToMinutesAndSeconds (millis: number) {
  const minutes: number = Math.floor(millis / 60000)
  const seconds: number = parseInt(((millis % 60000) / 1000).toFixed(0))
  return seconds === 60
    ? minutes + 1 + ':00'
    : minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}
export function htmlToEl (html: string) {
  const temp = document.createElement('template')
  html = html.trim() // Never return a space text node as a result
  temp.innerHTML = html
  return temp.content.firstChild
}

export async function promiseHandler<T> (
  promise: Promise<T>,
  onSuccesful = (res: T) => { },
  onFailure = (err: unknown) => {
    if (err) {
      console.error(err)
    }
  }
) {
  try {
    const res = await promise
    onSuccesful(res as T)
    return { res: res, err: null } as IPromiseHandlerReturn<T>
  } catch (err: unknown) {
    onFailure(err)
    return { res: null, err: err } as IPromiseHandlerReturn<T>
  }
}

/** Filters 'li' elements to either be hidden or not depending on if
 * they contain some given input text.
 *
 * @param {HTML} ul - unordered list element that contains the 'li' to be filtered
 * @param {HTML} input - input element whose value will be used to filter
 * @param {String} stdDisplay - the standard display the 'li' should have when not 'none'
 */
export function searchUl (ul: HTMLUListElement, input: HTMLInputElement, stdDisplay: string = 'flex'): void {
  const liEls = ul.getElementsByTagName('li')
  const filter = input.value.toUpperCase()

  for (let i = 0; i < liEls.length; i++) {
    // get the name child el in the li el
    const name = liEls[i].getElementsByClassName(config.CSS.CLASSES.name)[0]
    const nameTxt = name.textContent || name.innerHTML

    if (nameTxt && nameTxt.toUpperCase().indexOf(filter) > -1) {
      // show li's whose name contains the the entered string
      liEls[i].style.display = stdDisplay
    } else {
      // otherwise hide it
      liEls[i].style.display = 'none'
    }
  }
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export function getTextWidth (text: string, font: string) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  let metrics: TextMetrics
  if (context) {
    context.font = font
    metrics = context.measureText(text)
    return metrics.width
  }

  throw new Error('No context on created canvas was found')
}

export function isEllipsisActive (el: HTMLElement) {
  return el.offsetWidth < el.scrollWidth
}

export function capitalizeFirstLetter (string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function getValidImage (images: Array<SpotifyImg>, idx = 0) {
  // obtain the correct image
  if (images.length > idx) {
    const img = images[idx]
    return img.url
  } else {
    return ''
  }
}

export function removeAllChildNodes (parent: Node) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

export const animationControl = (function () {
  /** Adds a class to each element causing a transition to the changed css values.
   * This is done on set intervals.
   *
   *
   * @param {String} elementsToAnimate - comma separated string containing the classes or ids of elements to animate including prefix char.
   * @param {String} classToTransitionToo - The class that all the transitioning elements will add
   * @param {Number} animationInterval - The interval to wait between animation of elements
   */
  function intervalElementsTransitions (
    elementsToAnimate: string,
    classToTransitionToo: string,
    animationInterval: number
  ) {
    // arr of html selectors that point to elements to animate
    const attributes = elementsToAnimate.split(',')

    attributes.forEach((attr) => {
      const elements = document.querySelectorAll(attr)
      let idx = 0
      // in intervals play their initial animations
      const interval = setInterval(() => {
        if (idx === elements.length) {
          clearInterval(interval)
          return
        }
        const element = elements[idx]
        // add the class to the elements classes in order to run the transition
        element.classList.add(classToTransitionToo)
        idx += 1
      }, animationInterval)
    })
  }
  /** Animates all elements that contain a certain class or id
   *
   * @param {string} elementsToAnimate - comma separated string containing the classes or ids of elements to animate INCLUDING prefix char.
   * @param {string} classToAdd - class to add EXCLUDING the prefix char.
   * @param {string} animationInterval - the interval to animate the given elements in milliseconds.
   */
  function animateAttributes (elementsToAnimate: string, classToAdd: string, animationInterval: number) {
    intervalElementsTransitions(
      elementsToAnimate,
      classToAdd,
      animationInterval
    )
  }
  return {
    animateAttributes
  }
})()

export function getPixelPosInElOnClick (mouseEvt: MouseEvent): { x: number; y: number } {
  const rect = (mouseEvt.target as HTMLElement).getBoundingClientRect()
  const x = mouseEvt.clientX - rect.left // x position within the element.
  const y = mouseEvt.clientY - rect.top // y position within the element.
  return { x, y }
}

export function throwExpression (errorMessage: string): never {
  throw new Error(errorMessage)
}

export async function addItemsToPlaylist (playlistId: string, uris: Array<string>) {
  await promiseHandler(
    axios({
      method: 'post',
      url: config.URLs.postItemsToPlaylist(playlistId),
      data: {
        uris: uris
      }
    }),
    () => {}, () => {
      throw new Error('Issue adding items to playlist')
    })
}

export function shuffle<T> (array: Array<T>) {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]]
  }

  return array
}

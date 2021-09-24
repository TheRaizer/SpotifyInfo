
import interact from 'interactjs'
import Interact from '@interactjs/types'
import { IPromiseHandlerReturn, SpotifyImg } from './types'

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
      webPlayerProgress: 'web-player-progress-bar'
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
      slider: 'slider'
    },
    ATTRIBUTES: {
      dataSelection: 'data-selection'
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
    putPlaylistResizeData: (val: string) => `/spotify/put-playlist-resize-data?val=${val}`,
    getPlaylistResizeData: '/spotify/get-playlist-resize-data',
    putPlaylistIsInTextFormData: (val: string) => `/spotify/put-playlist-text-form-data?val=${val}`,
    getPlaylistIsInTextFormData: '/spotify/get-playlist-text-form-data',
    getArtistTopTracks: (id: string) => `/spotify/get-artist-top-tracks?id=${id}`,
    getCurrentUserProfile: '/spotify/get-current-user-profile',
    putClearSession: '/clear-session',
    getCurrentUserSavedTracks: '/spotify/get-current-user-saved-tracks',
    getFollowedArtists: '/spotify/get-followed-artists',
    putPlayTrack: (device_id: string, track_uri: string) =>
      `/spotify/play-track?device_id=${device_id}&track_uri=${track_uri}`,
    putPlayerVolumeData: (val: string) => `/spotify/put-player-volume?val=${val}`,
    getPlayerVolumeData: '/spotify/get-player-volume'
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
    playPrev: '/images/previous-30px.png'
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
      throw new Error()
    }
  }
) {
  try {
    const res = await promise
    onSuccesful(res as T)
    return { res: res, err: null } as IPromiseHandlerReturn<T>
  } catch (err: unknown) {
    console.error(err)
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
export const interactJsConfig = { restrict: false }

function dragMoveListener (evt: Interact.InteractEvent) {
  if (interactJsConfig.restrict) {
    return
  }
  const target = evt.target
  // keep the dragged position in the data-x/data-y attributes
  if (target === null) {
    throw new Error('Interactjs Event does not contain target')
  }
  let x = 0
  let y = 0

  const dataX = target.getAttribute('data-x')
  const dataY = target.getAttribute('data-y')

  if (typeof dataX === 'string' && typeof dataY === 'string') {
    x = parseFloat(dataX) + evt.dx
    y = parseFloat(dataY) + evt.dy
  } else {
    x += evt.dx
    y += evt.dy
  }

  // translate the element
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

  // update the posiion attributes
  target.setAttribute('data-x', x.toString())
  target.setAttribute('data-y', y.toString())
}
export function addResizeDrag (identifier: string, minWidth: number, minHeight: number) {
  // create an element that exists as the size of the viewport in order to set the restriction of the draggable/resizable to exist only within this element.
  const viewportElementHTML = `<div id="view-port-element" style="
  pointer-events: none; 
  position: fixed; 
  visibility: hidden;
  width: 100vw; 
  height:100vh; 
  min-width: 100%; 
  max-width: 100%; 
  min-height:100%; 
  max-height:100%;
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%);
  "></div>`
  const viewportElement = htmlToEl(viewportElementHTML) as Node
  document.body.appendChild(viewportElement)

  interact(identifier)
    .resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move (evt) {
          if (interactJsConfig.restrict) {
            return
          }
          const target = evt.target
          let x = parseFloat(target.getAttribute('data-x')) || 0
          let y = parseFloat(target.getAttribute('data-y')) || 0

          // update the element's style
          target.style.width = evt.rect.width + 'px'
          target.style.height = evt.rect.height + 'px'

          // translate when resizing from top or left edges
          x += evt.deltaRect.left
          y += evt.deltaRect.top

          target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

          target.setAttribute('data-x', x)
          target.setAttribute('data-y', y)
        }
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: viewportElement as HTMLElement
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: minWidth, height: minHeight }
        })
      ],

      inertia: false
    })
    .draggable({
      listeners: { move: dragMoveListener },
      inertia: false,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: viewportElement as HTMLElement,
          endOnly: false
        })
      ]
    })
}

export function throwExpression (errorMessage: string): never {
  throw new Error(errorMessage)
}

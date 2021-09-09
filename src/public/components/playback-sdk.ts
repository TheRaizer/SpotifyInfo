import {
  config,
  promiseHandler,
  htmlToEl,
  addResizeDrag,
  millisToMinutesAndSeconds,
  throwExpression
} from '../config'
import { DoublyLinkedListNode } from './doubly-linked-list'
import PlayableEventArg from './pubsub/event-args/track-play-args'
import axios, { AxiosResponse } from 'axios'
import EventAggregator from './pubsub/aggregator'
import { IPlayable } from '../types'

class SpotifyPlayback {
  player: any;
  isExecutingAction: boolean;
  device_id: string;
  selPlaying: {
      element: null | Element
      track_uri: string
      trackDataNode: null | DoublyLinkedListNode<IPlayable>
  }

  getStateInterval: NodeJS.Timeout | null;

  webPlayerEls: {
    title: Element | null
    progress: Element | null
    currTime: Element | null
    duration: Element | null
  };

  playerIsReady: boolean;

  constructor () {
    this.isExecutingAction = false
    this.player = null
    this.device_id = ''
    this.getStateInterval = null

    this.webPlayerEls = {
      title: null,
      progress: null,
      currTime: null,
      duration: null
    }
    this.selPlaying = {
      element: null,
      track_uri: '',
      trackDataNode: null
    }
    this.playerIsReady = false
    this._loadWebPlayer()
  }

  private async _loadWebPlayer () {
    promiseHandler<AxiosResponse<string | null>>(axios.request<string | null>({ method: 'GET', url: config.URLs.getAccessToken }), (res) => {
      // this takes too long and spotify sdk needs window.onSpotifyWebPlaybackSDKReady to be defined quicker.
      console.log('request player')
      const NO_CONTENT = 204
      if (res.status === NO_CONTENT || res.data === null) {
        throw new Error('access token has no content')
      } else if (window.Spotify) {
        console.log('is defined so create')
        // if the spotify sdk is already defined set player without setting onSpotifyWebPlaybackSDKReady meaning the window: Window is in a different scope
        // use window.Spotify.Player as spotify namespace is declared in the Window interface as per DefinitelyTyped -> spotify-web-playback-sdk -> index.d.ts https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/spotify-web-playback-sdk
        this.player = new window.Spotify.Player({
          name: 'Spotify Info Web Player',
          getOAuthToken: (cb) => {
            // give the token to callback
            cb(res.data)
          },
          volume: 0.4
        })
        this._addListeners()
        // Connect to the player!
        this.player.connect()
      } else {
        // of spotify sdk is undefined
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('create when undefined')
          // if getting token was succesful create spotify player using the window in this scope
          this.player = new window.Spotify.Player({
            name: 'Spotify Info Web Player',
            getOAuthToken: (cb) => {
              // give the token to callback
              cb(res.data)
            },
            volume: 0.1
          })
          this._addListeners()
          // Connect to the player!
          this.player.connect()
        }
      }
    })
  }

  private _addListeners () {
    // Error handling
    this.player.addListener('initialization_error', ({ message }: { message: unknown }) => {
      console.error(message)
    })
    this.player.addListener('authentication_error', ({ message }: { message: unknown }) => {
      console.error(message)
      console.log('playback couldnt start')
    })
    this.player.addListener('account_error', ({ message }: { message: unknown }) => {
      console.error(message)
    })
    this.player.addListener('playback_error', ({ message }: { message: unknown }) => {
      console.error(message)
    })

    // Playback status updates
    this.player.addListener('player_state_changed', (state: Spotify.PlaybackState | null) => {})

    // Ready
    this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id)
      this.device_id = device_id
      this.appendWebPlayerHtml()
      this.playerIsReady = true
    })

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id)
    })
  }

  getWebPlayerEls () {
    const webPlayerEl = document.getElementById(config.CSS.IDs.webPlayer) ?? throwExpression('web player element does not exist')
    const playTimeBar = document.getElementById(config.CSS.IDs.playTimeBar) ?? throwExpression('play time bar element does not exist')

    this.webPlayerEls.progress = webPlayerEl.getElementsByClassName(
      config.CSS.CLASSES.progress
    )[0] as Element ?? throwExpression('web player progress bar does not exist')
    this.webPlayerEls.title = webPlayerEl.getElementsByTagName('h4')[0] as Element ?? throwExpression('web player title element does not exist')

    // get playtime bar elements
    this.webPlayerEls.currTime = playTimeBar.getElementsByTagName('p')[0] as Element ?? throwExpression('web player current time element does not exist')
    this.webPlayerEls.duration = playTimeBar.getElementsByTagName('p')[1] as Element ?? throwExpression('web player duration time element does not exist')
  }

  appendWebPlayerHtml () {
    const html = `
    <article id="${config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config.CSS.CLASSES.ellipsisWrap}">Title</h4>
      <div>
        <button id="${config.CSS.IDs.playPrev}"><img src="${config.PATHS.playPrev}" alt="previous"/></button>
        <button id="${config.CSS.CLASSES.playPause}"><img src="${config.PATHS.pauseIcon}" alt="play/pause"/></button>
        <button id="${config.CSS.IDs.playNext}"><img src="${config.PATHS.playNext}" alt="next"/></button>
      </div>
      <div id="${config.CSS.IDs.playTimeBar}">
        <p>0:00</p>
        <div class="${config.CSS.CLASSES.progressBar}">
          <div class="${config.CSS.CLASSES.progress}"></div>
        </div>
        <p>0:00</p>
      </div>
    </article>
    `

    const webPlayerEl = htmlToEl(html)
    document.body.append(webPlayerEl as Node)
    this.assignEventListeners()
    this.getWebPlayerEls()
  }

  private assignEventListeners () {
    const webPlayer = document.getElementById(config.CSS.IDs.webPlayer)
    if (webPlayer === null) {
      throw new Error('Web player element does not exist')
    }
    const playPrev = document.getElementById(config.CSS.IDs.playPrev)
    const playPause = webPlayer.getElementsByClassName(config.CSS.CLASSES.playPause)[0]
    const playNext = document.getElementById(config.CSS.IDs.playNext)

    playPrev?.addEventListener('click', () => this.tryPlayPrev(this.selPlaying.trackDataNode))
    playNext?.addEventListener('click', () => this.tryPlayNext(this.selPlaying.trackDataNode))
  }

  updateWebPlayer (percentDone: number, position: number) {
    if (position !== 0) {
      (this.webPlayerEls.progress as HTMLElement).style.width = `${percentDone}%`
      if (this.webPlayerEls.currTime == null) {
        throw new Error('Current time element is null')
      }
      this.webPlayerEls.currTime.textContent =
        millisToMinutesAndSeconds(position)
    }
  }

  /** Tries to play the previous IPlayable given the current playing IPlayable node.
   *
   * @param currNode - the current IPlayable node that was/is playing
   */
  tryPlayPrev (currNode: DoublyLinkedListNode<IPlayable> | null) {
    if (currNode === null) {
      return
    }
    // check to see if this is the first node or if an action is processing
    if (!this.isExecutingAction && currNode.previous !== null) {
      console.log('play prev')
      const prevTrack = currNode.previous.data
      this.setSelPlayingEl(new PlayableEventArg(prevTrack, currNode.previous))
    }
  }

  /** Tries to play the next IPlayable given the current playing IPlayable node.
   *
   * @param currNode - the current IPlayable node that was/is playing
   */
  tryPlayNext (currNode: DoublyLinkedListNode<IPlayable> | null) {
    if (currNode === null) {
      return
    }
    // check to see if this is the last node or if an action is processing
    if (!this.isExecutingAction && currNode.next !== null) {
      console.log('play next')
      const nextTrack = currNode.next.data
      this.setSelPlayingEl(new PlayableEventArg(nextTrack, currNode.next))
    }
  }

  onTrackFinish () {
    if (this.selPlaying.element === null) {
      throw new Error('Selected playing element was null before deselection on song finish')
    }
    this.selPlaying.element.classList.remove(config.CSS.CLASSES.selected)
    this.selPlaying.element = null
    this.selPlaying.track_uri = '';

    (this.webPlayerEls.progress as HTMLElement).style.width = '100%'
    clearInterval(this.getStateInterval as NodeJS.Timeout)
    console.log(this.selPlaying!.trackDataNode)
    this.tryPlayNext(this.selPlaying.trackDataNode)
  }

  /** Sets an interval that obtains the state of the player every second.
   * Should only be called when a song is playing.
   */
  setGetStateInterval () {
    let durationMinSec = ''
    if (this.getStateInterval) {
      clearInterval(this.getStateInterval)
    }
    // set the interval to run every second and obtain the state
    this.getStateInterval = setInterval(() => {
      this.player.getCurrentState().then((state: { position: any; duration: any }) => {
        if (!state) {
          console.error(
            'User is not playing music through the Web Playback SDK'
          )
          return
        }
        const { position, duration } = state

        // if there isnt a duration set for this song set it.
        if (durationMinSec === '') {
          durationMinSec = millisToMinutesAndSeconds(duration)
          this.webPlayerEls!.duration!.textContent = durationMinSec
        }

        const percentDone = (position / duration) * 100

        // the position gets set to 0 when the song is finished
        if (position === 0) {
          this.onTrackFinish()
        } else {
          // if the position isnt 0 update the web player elements
          this.updateWebPlayer(percentDone, position)
        }
      })
    }, 1000)
  }

  /** Select a certain play/pause element and play the given track uri
   * and unselect the previous one then pause the previous track_uri.
   *
   * @param {PlayableEventArg} eventArg - a class that contains the current, next and previous tracks to play
   */
  async setSelPlayingEl (eventArg: PlayableEventArg) {
    console.log(eventArg.playableNode)
    // if the player isn't ready we cannot continue.
    if (!this.playerIsReady) {
      console.log('player is not ready')
      return
    }
    if (this.isExecutingAction) {
      console.log('is currently executing action')
      return
    }
    this.isExecutingAction = true
    console.log('Start Action')
    if (this.selPlaying.element != null) {
      // if there already is a selected element unselect it
      this.selPlaying.element.classList.remove(config.CSS.CLASSES.selected)

      await this.pause()
      clearInterval(this.getStateInterval as NodeJS.Timeout)
      // if the selected el is the same as the prev then null it and return so we do not end up reselecting it right after deselecting.
      if (this.selPlaying.element === eventArg.currPlayable.selEl) {
        this.selPlaying.element = null
        this.isExecutingAction = false
        console.log('Action Ended')
        return
      }
    }

    // prev track uri is the same then resume the song instead of replaying it.
    if (this.selPlaying.track_uri === eventArg.currPlayable.uri) {
      await this.startTrack(
        eventArg.currPlayable.selEl,
        eventArg.currPlayable.uri,
        async () => this.resume(),
        eventArg.currPlayable.title,
        eventArg.playableNode
      )
      console.log('Action Ended')
      this.isExecutingAction = false
      return
    }

    await this.startTrack(
      eventArg.currPlayable.selEl,
      eventArg.currPlayable.uri,
      async () => this.play(eventArg.currPlayable.uri),
      eventArg.currPlayable.title,
      eventArg.playableNode
    )
    console.log('Action Ended')
    this.isExecutingAction = false
  }

  async startTrack (selEl: Element, track_uri: string, playingAsyncFunc: Function, title: string, trackNode: DoublyLinkedListNode<IPlayable>) {
    console.log('Start')
    this.selPlaying.trackDataNode = trackNode
    this.selPlaying.element = selEl
    this.selPlaying.element.classList.add(config.CSS.CLASSES.selected)
    this.selPlaying.track_uri = track_uri

    this.webPlayerEls!.title!.textContent = title

    await playingAsyncFunc()

    // set playing state once song starts playing
    this.setGetStateInterval()
  }

  /** Plays a track through this device.
   *
   * @param {string} track_uri - the track uri to play
   * @returns whether or not the track has been played succesfully.
   */
  async play (track_uri: string) {
    await promiseHandler(
      axios.put(config.URLs.putPlayTrack(this.device_id, track_uri))
    )
    console.log('play')
  }

  async resume () {
    await this.player.resume()
    console.log('resume')
  }

  async pause () {
    await this.player.pause()
    console.log('paused')
  }
}

const spotifyPlayback = new SpotifyPlayback()

if ((window as any).eventAggregator === undefined) {
  // create a global variable to be used
  (window as any).eventAggregator = new EventAggregator()
}
const eventAggregator = (window as any).eventAggregator as EventAggregator

// subscribe the setPlaying element event
eventAggregator.subscribe(PlayableEventArg.name, (eventArg: PlayableEventArg) =>
  spotifyPlayback.setSelPlayingEl(eventArg)
)
addResizeDrag()

export function isSamePlayingURI (uri: string) {
  return (
    uri === spotifyPlayback.selPlaying.track_uri &&
      spotifyPlayback.selPlaying.element != null
  )
}

export function checkIfIsPlayingElAfterRerender (uri: string, selEl: Element, trackDataNode: DoublyLinkedListNode<IPlayable>) {
  if (isSamePlayingURI(uri)) {
    // This element was playing before rerendering so set it to be the currently playing one again
    spotifyPlayback.selPlaying.element = selEl
    spotifyPlayback.selPlaying.trackDataNode = trackDataNode
  }
}

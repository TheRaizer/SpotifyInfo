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
  private player: any;
  private isExecutingAction: boolean;
  private device_id: string;
  selPlaying: {
      element: null | Element
      track_uri: string
      trackDataNode: null | DoublyLinkedListNode<IPlayable>
  }

  private getStateInterval: NodeJS.Timeout | null;

  private webPlayerEls: {
    title: Element | null
    progress: Element | null
    currTime: Element | null
    duration: Element | null
    playPause: Element | null
  };

  private playerIsReady: boolean;

  constructor () {
    this.isExecutingAction = false
    this.player = null
    this.device_id = ''
    this.getStateInterval = null

    this.webPlayerEls = {
      title: null,
      progress: null,
      currTime: null,
      duration: null,
      playPause: null
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
      const NO_CONTENT = 204
      if (res.status === NO_CONTENT || res.data === null) {
        throw new Error('access token has no content')
      } else if (window.Spotify) {
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

  private getWebPlayerEls () {
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

  private appendWebPlayerHtml () {
    const html = `
    <article id="${config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config.CSS.CLASSES.ellipsisWrap}">Title</h4>
      <div>
        <button id="${config.CSS.IDs.playPrev}"><img src="${config.PATHS.playPrev}" alt="previous"/></button>
        <button id="${config.CSS.IDs.webPlayerPlayPause}"><img src="${config.PATHS.playBlackIcon}" alt="play/pause"/></button>
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
    const playPrev = document.getElementById(config.CSS.IDs.playPrev)
    const playPause = document.getElementById(config.CSS.IDs.webPlayerPlayPause)
    const playNext = document.getElementById(config.CSS.IDs.playNext)

    this.webPlayerEls.playPause = playPause

    playPrev?.addEventListener('click', () => this.tryPlayPrev(this.selPlaying.trackDataNode))
    playPause?.addEventListener('click', () => this.tryWebPlayerPause(this.selPlaying.trackDataNode))
    playNext?.addEventListener('click', () => this.tryPlayNext(this.selPlaying.trackDataNode))
  }

  private updateWebPlayer (percentDone: number, position: number) {
    if (position !== 0) {
      (this.webPlayerEls.progress as HTMLElement).style.width = `${percentDone}%`
      if (this.webPlayerEls.currTime == null) {
        throw new Error('Current time element is null')
      }
      this.webPlayerEls.currTime.textContent =
        millisToMinutesAndSeconds(position)
    }
  }

  /** Tries to pause the current playing IPlayable node from the web player.
   *
   * @param currNode - the current IPlayable node that was/is playing
   */
  private tryWebPlayerPause (currNode: DoublyLinkedListNode<IPlayable> | null) {
    // check to see if this is the first node or if an action is processing
    if (!this.isExecutingAction && currNode !== null) {
      const prevTrack = currNode.data
      this.setSelPlayingEl(new PlayableEventArg(prevTrack, currNode))
    }
  }

  /** Tries to play the previous IPlayable given the current playing IPlayable node.
   *
   * @param currNode - the current IPlayable node that was/is playing
   */
  private tryPlayPrev (currNode: DoublyLinkedListNode<IPlayable> | null) {
    if (currNode === null) {
      return
    }
    // check to see if this is the first node or if an action is processing
    if (!this.isExecutingAction && currNode.previous !== null) {
      const prevTrack = currNode.previous.data
      this.setSelPlayingEl(new PlayableEventArg(prevTrack, currNode.previous))
    }
  }

  /** Tries to play the next IPlayable given the current playing IPlayable node.
   *
   * @param currNode - the current IPlayable node that was/is playing
   */
  private tryPlayNext (currNode: DoublyLinkedListNode<IPlayable> | null) {
    if (currNode === null) {
      return
    }
    // check to see if this is the last node or if an action is processing
    if (!this.isExecutingAction && currNode.next !== null) {
      const nextTrack = currNode.next.data
      this.setSelPlayingEl(new PlayableEventArg(nextTrack, currNode.next))
    }
  }

  private completelyDeselectTrack () {
    if (this.selPlaying.element === null) {
      throw new Error('Selected playing element was null before deselection on song finish')
    }
    this.pauseDeselectTrack()
    this.selPlaying.track_uri = ''
  }

  private pauseDeselectTrack () {
    if (this.selPlaying.element === null) {
      throw new Error('Selected playing element was null before deselection on song finish')
    }

    this.selPlaying.trackDataNode?.data.onStopped()
    this.selPlaying.element.classList.remove(config.CSS.CLASSES.selected)
    this.webPlayerEls.playPause?.classList.remove(config.CSS.CLASSES.selected)
    this.selPlaying.element = null
  }

  private selectTrack (eventArg: PlayableEventArg) {
    this.selPlaying.trackDataNode = eventArg.playableNode
    this.selPlaying.element = eventArg.currPlayable.selEl
    this.selPlaying.element.classList.add(config.CSS.CLASSES.selected)
    this.selPlaying.track_uri = eventArg.currPlayable.uri

    this.webPlayerEls.playPause?.classList.add(config.CSS.CLASSES.selected)
    this.webPlayerEls!.title!.textContent = eventArg.currPlayable.title

    this.selPlaying.trackDataNode?.data.onPlaying()
  }

  private onTrackFinish () {
    this.completelyDeselectTrack();

    (this.webPlayerEls.progress as HTMLElement).style.width = '100%'
    clearInterval(this.getStateInterval as NodeJS.Timeout)
    this.tryPlayNext(this.selPlaying.trackDataNode)
  }

  /** Sets an interval that obtains the state of the player every second.
   * Should only be called when a song is playing.
   */
  private setGetStateInterval () {
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
  public async setSelPlayingEl (eventArg: PlayableEventArg) {
    // if the player isn't ready we cannot continue.
    if (!this.playerIsReady) {
      console.log('player is not ready')
      return
    }
    if (this.isExecutingAction) {
      return
    }
    this.isExecutingAction = true
    if (this.selPlaying.element != null) {
      // stop the previous track that was playing
      this.selPlaying.trackDataNode?.data.onStopped()
      clearInterval(this.getStateInterval as NodeJS.Timeout)

      // if its the same element then pause
      if (this.selPlaying.element === eventArg.currPlayable.selEl) {
        this.pauseDeselectTrack()
        await this.pause()
        this.isExecutingAction = false
        return
      } else {
        // otherwise completely deselect the current track before selecting another one to play
        this.completelyDeselectTrack()
      }
    }

    // prev track uri is the same then resume the song instead of replaying it.
    if (this.selPlaying.track_uri === eventArg.currPlayable.uri) {
      await this.startTrack(async () => this.resume(), eventArg)
      this.isExecutingAction = false
      return
    }

    await this.startTrack(async () => this.play(eventArg.currPlayable.uri), eventArg)
    this.isExecutingAction = false
  }

  private async startTrack (playingAsyncFunc: Function, eventArg: PlayableEventArg) {
    this.selectTrack(eventArg)

    await playingAsyncFunc()

    // set playing state once song starts playing
    this.setGetStateInterval()
  }

  /** Plays a track through this device.
   *
   * @param {string} track_uri - the track uri to play
   * @returns whether or not the track has been played succesfully.
   */
  private async play (track_uri: string) {
    await promiseHandler(
      axios.put(config.URLs.putPlayTrack(this.device_id, track_uri))
    )
  }

  private async resume () {
    await this.player.resume()
  }

  private async pause () {
    await this.player.pause()
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
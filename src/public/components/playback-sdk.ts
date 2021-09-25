import {
  config,
  promiseHandler,
  addResizeDrag,
  millisToMinutesAndSeconds,
  htmlToEl
} from '../config'
import { DoublyLinkedListNode } from './doubly-linked-list'
import PlayableEventArg from './pubsub/event-args/track-play-args'
import axios, { AxiosResponse } from 'axios'
import EventAggregator from './pubsub/aggregator'
import { IPlayable } from '../../types'
import SpotifyPlaybackElement from './spotify-playback-element'

async function loadVolume () {
  const response = await promiseHandler(axios.get(config.URLs.getPlayerVolumeData))
  console.log(response)
  const volume = response.res!.data
  return volume
}
async function saveVolume (volume: string) {
  promiseHandler(axios.put(config.URLs.putPlayerVolumeData(volume)))
}

class SpotifyPlayback {
  private player: any;
  // controls timing of async actions when working with webplayer sdk
  private isExecutingAction: boolean;
  private device_id: string;
  selPlaying: {
      element: null | Element
      track_uri: string
      trackDataNode: null | DoublyLinkedListNode<IPlayable>
  }

  private getStateInterval: NodeJS.Timeout | null;
  private webPlayerEl: SpotifyPlaybackElement;
  private playerIsReady: boolean;

  constructor () {
    this.isExecutingAction = false
    this.player = null
    this.device_id = ''
    this.getStateInterval = null

    this.selPlaying = {
      element: null,
      track_uri: '',
      trackDataNode: null
    }
    this.playerIsReady = false
    this._loadWebPlayer()

    // pass it the "this." attributes in this scope because when a function is called from a different class the "this." attributes are undefined.
    this.webPlayerEl = new SpotifyPlaybackElement()
  }

  private setVolume (percentage: number, player: any, save: boolean = false) {
    const newVolume = percentage / 100
    player.setVolume(newVolume)

    if (save) {
      saveVolume(newVolume.toString())
    }
  }

  /**
   * Update the time shown when seeking.
   * @param percentage The percent that the bar has filled with respect to the entire bar
   * @param webPlayerEl The webplayer element that gives us access to the song progress bar
   */
  private onSeeking (percentage: number, webPlayerEl: SpotifyPlaybackElement) {
    // get the position by using the percent the progress bar.
    const seekPosition = webPlayerEl.songProgress!.max * (percentage / 100)
    if (webPlayerEl.currTime == null) {
      throw new Error('Current time element is null')
    }
    // update the text content to show the time the user will be seeking too onmouseup.
    webPlayerEl.currTime.textContent = millisToMinutesAndSeconds(seekPosition)
  }

  /**
   * Function to run when the seeking action begins
   * @param player The spotify sdk player whose state we will use to change the song's progress bar's max value to the duration of the song.
   * @param webPlayerEl The web player element that will allow us to modify the progress bars max attribute.
   */
  private onSeekStart (player: any, webPlayerEl: SpotifyPlaybackElement) {
    player.getCurrentState().then((state: { duration: any }) => {
      if (!state) {
        console.error(
          'User is not playing music through the Web Playback SDK'
        )
        return
      }
      // when first seeking, update the max attribute with the duration of the song for use when seeking.
      webPlayerEl.songProgress!.max = state.duration
    })
  }

  /**
   * Function to run when you wish to seek to a certain position in a song.
   * @param percentage The percent that the bar has filled with respect to the entire bar
   * @param player the spotify sdk player that will seek the song to a given position
   * @param webPlayerEl the web player element that gives us access to the song progress bar.
   */
  private seekSong (percentage: number, player: any, webPlayerEl: SpotifyPlaybackElement) {
    if (!this.isExecutingAction) {
      this.isExecutingAction = true
      // obtain the final position the user wishes to seek once mouse is up.
      const position = (percentage / 100) * webPlayerEl.songProgress!.max

      // seek to the chosen position.
      player.seek(position).then(() => {
        this.isExecutingAction = false
      })
    }
  }

  private async _loadWebPlayer () {
    // load the users saved volume if there isnt then load 0.4 as default.
    const volume = await loadVolume()
    console.log(volume + ' loaded.')

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
          volume: volume
        })
        this._addListeners(volume)
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
            volume: volume
          })
          this._addListeners(volume)
          // Connect to the player!
          this.player.connect()
        }
      }
    })
  }

  private _addListeners (loadedVolume: string) {
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

      // append web player element to DOM
      this.webPlayerEl.appendWebPlayerHtml(
        () => this.tryPlayPrev(this.selPlaying.trackDataNode),
        () => this.tryWebPlayerPause(this.selPlaying.trackDataNode),
        () => this.tryPlayNext(this.selPlaying.trackDataNode),
        () => this.onSeekStart(this.player, this.webPlayerEl),
        (percentage) => this.seekSong(percentage, this.player, this.webPlayerEl),
        (percentage) => this.onSeeking(percentage, this.webPlayerEl),
        (percentage, save) => this.setVolume(percentage, this.player, save),
        parseFloat(loadedVolume)
      )
      this.playerIsReady = true
    })

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id)
    })
  }

  private resetDuration () {
    if (!this.isExecutingAction) {
      this.isExecutingAction = true
      this.player.seek(0).then(() => { this.isExecutingAction = false })
    }
  }

  /**
   * Tries to pause the current playing IPlayable node from the web player.
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

  /**
   * Tries to play the previous IPlayable given the current playing IPlayable node.
   *
   * @param currNode - the current IPlayable node that was/is playing
   */
  private tryPlayPrev (currNode: DoublyLinkedListNode<IPlayable> | null) {
    if (currNode === null) {
      return
    }
    // if an action is processing we cannot do anything
    if (!this.isExecutingAction) {
      this.player.getCurrentState().then((state: { position: any }) => {
        if (state.position > 1000) {
          this.resetDuration()
        } else {
          if (currNode.previous === null) {
            return
          }
          const prevTrack = currNode.previous.data
          this.setSelPlayingEl(new PlayableEventArg(prevTrack, currNode.previous))
        }
      })
    }
  }

  /**
   * Tries to play the next IPlayable given the current playing IPlayable node.
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
    this.webPlayerEl.playPause?.classList.remove(config.CSS.CLASSES.selected)
    this.selPlaying.element = null
  }

  private selectTrack (eventArg: PlayableEventArg) {
    this.selPlaying.trackDataNode = eventArg.playableNode
    this.selPlaying.element = eventArg.currPlayable.selEl
    this.selPlaying.element.classList.add(config.CSS.CLASSES.selected)
    this.selPlaying.track_uri = eventArg.currPlayable.uri

    this.webPlayerEl.playPause?.classList.add(config.CSS.CLASSES.selected)
    this.webPlayerEl.setTitle(eventArg.currPlayable.title)

    this.selPlaying.trackDataNode?.data.onPlaying()
  }

  private onTrackFinish () {
    this.completelyDeselectTrack()

    this.webPlayerEl.songProgress!.sliderProgress!.style.width = '100%'
    clearInterval(this.getStateInterval as NodeJS.Timeout)
    this.tryPlayNext(this.selPlaying.trackDataNode)
  }

  /**
   * Sets an interval that obtains the state of the player every second.
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
          this.webPlayerEl!.duration!.textContent = durationMinSec
        }

        const percentDone = (position / duration) * 100

        // the position gets set to 0 when the song is finished
        if (position === 0) {
          this.onTrackFinish()
        } else {
          // if the position isnt 0 update the web player elements
          this.webPlayerEl.updateElement(percentDone, position)
        }
      })
    }, 500)
  }

  /**
   * Select a certain play/pause element and play the given track uri
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

  /**
   * Plays a track through this device.
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

// append an invisible element then destroy it as a way to load the play and pause images from express.
const preloadPlayPauseImgsHtml = `<div style="display: none"><img src="${config.PATHS.playIcon}"/><img src="${config.PATHS.pauseIcon}"/></div>`
const preloadPlayPauseImgsEl = htmlToEl(preloadPlayPauseImgsHtml) as Node
document.body.appendChild(preloadPlayPauseImgsEl)
document.body.removeChild(preloadPlayPauseImgsEl)

addResizeDrag('.resize-drag', 200, 120)

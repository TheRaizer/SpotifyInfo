import {
  config,
  promiseHandler,
  millisToMinutesAndSeconds,
  htmlToEl,
  shuffle
} from '../config'
import { arrayToDoublyLinkedList, DoublyLinkedListNode } from './doubly-linked-list'
import PlayableEventArg from './pubsub/event-args/track-play-args'
import axios, { AxiosResponse } from 'axios'
import EventAggregator from './pubsub/aggregator'
import { IPlayable } from '../../types'
import SpotifyPlaybackElement from './spotify-playback-element'

async function loadVolume () {
  const { res, err } = await promiseHandler(axios.get(config.URLs.getPlayerVolumeData))

  if (err) {
    return 0
  } else {
    return res!.data
  }
}
async function saveVolume (volume: string) {
  promiseHandler(axios.put(config.URLs.putPlayerVolumeData(volume)))
}
export const playerPublicVars = {
  isShuffle: false
}
class SpotifyPlayback {
  private player: any;
  // controls timing of async actions when working with webplayer sdk
  private isExecutingAction: boolean;
  private device_id: string;
  public selPlaying: {
    element: null | Element
    track_uri: string
    // this node may be a shuffled or unshuffled node
    playableNode: null | DoublyLinkedListNode<IPlayable>
    // this array is always in standard order and never shuffled.
    playableArr: null | Array<IPlayable>
  }

  private getStateInterval: NodeJS.Timeout | null;
  private webPlayerEl: SpotifyPlaybackElement;
  private playerIsReady: boolean;
  private wasInShuffle = false;

  constructor () {
    this.isExecutingAction = false
    this.player = null
    this.device_id = ''
    this.getStateInterval = null

    this.selPlaying = {
      element: null,
      track_uri: '',
      playableNode: null,
      playableArr: null
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

    promiseHandler<AxiosResponse<string | null>>(axios.request<string | null>({ method: 'GET', url: config.URLs.getAccessToken }), (res) => {
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
    this.player.addListener('player_state_changed', (state: Spotify.PlaybackState | null) => { })

    // Ready
    this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id)
      this.device_id = device_id

      // append web player element to DOM
      this.webPlayerEl.appendWebPlayerHtml(
        () => this.tryPlayPrev(this.selPlaying.playableNode),
        () => this.tryWebPlayerPause(this.selPlaying.playableNode),
        () => this.tryPlayNext(this.selPlaying.playableNode),
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
      console.log('Try player pause')
      this.setSelPlayingEl(new PlayableEventArg(prevTrack, currNode, this.selPlaying.playableArr))
    }
  }

  /**
   * Tries to play the previous IPlayable given the current playing IPlayable node.
   *
   * @param currNode - the current IPlayable node that was/is playing
   */
  private tryPlayPrev (currNode: DoublyLinkedListNode<IPlayable> | null) {
    // there is no current node or the player is in shuffle mode
    if (currNode === null || (playerPublicVars.isShuffle && !this.wasInShuffle)) {
      // (if the player has just been put into shuffle mode then there should be no previous playables to go back too)
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

          let prevTrackNode = currNode.previous

          if (!playerPublicVars.isShuffle && this.wasInShuffle) {
            prevTrackNode = this.unShuffle(-1)
          }
          const prevTrack = currNode.previous.data
          this.setSelPlayingEl(new PlayableEventArg(prevTrack, prevTrackNode, this.selPlaying.playableArr))
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
      let nextTrackNode = currNode.next

      if (!this.wasInShuffle && playerPublicVars.isShuffle) {
        // by calling this before assigning the next node, this.shufflePlayables() must return back the next node
        nextTrackNode = this.shufflePlayables()

        // call after to ensure that this.shufflePlayables() runs the if statement that returns the next node
        this.wasInShuffle = true
      } else if (!playerPublicVars.isShuffle && this.wasInShuffle) {
        nextTrackNode = this.unShuffle(1)
      }

      this.setSelPlayingEl(new PlayableEventArg(nextTrackNode.data, nextTrackNode, this.selPlaying.playableArr))
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

    this.selPlaying.playableNode?.data.onStopped()
    this.selPlaying.element.classList.remove(config.CSS.CLASSES.selected)
    this.webPlayerEl.playPause?.classList.remove(config.CSS.CLASSES.selected)
    this.selPlaying.element = null
  }

  private selectTrack (eventArg: PlayableEventArg, playThruWebPlayer: boolean) {
    this.selPlaying.playableNode = eventArg.playableNode
    this.selPlaying.playableArr = eventArg.playableArr
    this.selPlaying.element = eventArg.currPlayable.selEl
    this.selPlaying.element.classList.add(config.CSS.CLASSES.selected)
    this.selPlaying.track_uri = eventArg.currPlayable.uri

    this.webPlayerEl.playPause?.classList.add(config.CSS.CLASSES.selected)
    this.webPlayerEl.setTitle(eventArg.currPlayable.title)
    this.webPlayerEl.setImgSrc(eventArg.currPlayable.imageUrl)
    this.webPlayerEl.setArtists(eventArg.currPlayable.artistsHtml)

    this.selPlaying.playableNode?.data.onPlaying()

    // we can call after assigning playable node as it does not change which node is played
    if (!playThruWebPlayer && playerPublicVars.isShuffle) {
      this.shufflePlayables()
    } else if (!playerPublicVars.isShuffle && this.wasInShuffle) {
      this.selPlaying.playableNode = this.unShuffle(0)
    }
  }

  private onTrackFinish () {
    this.completelyDeselectTrack()

    this.webPlayerEl.songProgress!.sliderProgress!.style.width = '100%'
    clearInterval(this.getStateInterval as NodeJS.Timeout)
    this.tryPlayNext(this.selPlaying.playableNode)
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
   * The reassigning of elements is in the case that this function is called through the web player element,
   * as there is a chance that the selected playing element is either non-existent, or is different then then
   * the previous i.e. rerendered, or has an equivalent element when on for example a different term tab.
   *
   * Reassigning is done so that the potentially different equivalent element can act as the initially
   * selected element, in showing pause/play symbols in accordance to whether the
   * song was paused/played through the web player.
   *
   * @param {PlayableEventArg} eventArg - a class that contains the current, next and previous tracks to play
   */
  public async setSelPlayingEl (eventArg: PlayableEventArg, playThruWebPlayer = true) {
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
      this.selPlaying.playableNode?.data.onStopped()
      clearInterval(this.getStateInterval as NodeJS.Timeout)

      // reassign the element if it exists as it may have been rerendered and therefore the previous value is pointing to nothing
      this.selPlaying.element = document.getElementById(this.selPlaying.element.id) ?? this.selPlaying.element

      // if its the same element then pause
      if (this.selPlaying.element.id === eventArg.currPlayable.selEl.id) {
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
      // this selEl could corrospond to the same song but is an element that is non-existent, so reassign it to a equivalent existing element if this is the case.
      eventArg.currPlayable.selEl = document.getElementById(eventArg.currPlayable.selEl.id) ?? eventArg.currPlayable.selEl

      await this.startTrack(async () => this.resume(), eventArg, playThruWebPlayer)
      this.isExecutingAction = false
      return
    }

    console.log('start track')
    await this.startTrack(async () => this.play(eventArg.currPlayable.uri), eventArg, playThruWebPlayer)
    this.isExecutingAction = false
  }

  private async startTrack (playingAsyncFunc: Function, eventArg: PlayableEventArg, playThruWebPlayer: boolean) {
    this.selectTrack(eventArg, playThruWebPlayer)

    await playingAsyncFunc()

    // set playing state once song starts playing
    this.setGetStateInterval()
  }

  /**
   * Shuffles the playables and either returns the current node or the next node that both point to a shuffled version of the list.
   * @returns {DoublyLinkedListNode<IPlayable>} either the next or current node in the shuffled list.
   */
  private shufflePlayables (): DoublyLinkedListNode<IPlayable> {
    if (this.selPlaying.playableArr == null || this.selPlaying.playableNode == null) throw new Error('no sel playing')
    console.log('shuffle')
    const selPlayable = this.selPlaying.playableNode.data

    // shuffle array
    const trackArr = shuffle(this.selPlaying.playableArr)

    // remove this track from the array
    const index = trackArr.indexOf(selPlayable)
    trackArr.splice(index, 1)

    // generate a doubly linked list
    const shuffledList = arrayToDoublyLinkedList(trackArr)

    // place this track at the front of the list
    shuffledList.insertBefore(selPlayable, 0)

    let newNode: DoublyLinkedListNode<IPlayable>
    if (!this.wasInShuffle) {
      // get the next node as this should run before the next node is chosen.
      newNode = shuffledList.get(1, true) as DoublyLinkedListNode<IPlayable>
    } else {
      // get the new node which has identical data as the old one, but is now part of the shuffled doubly linked list
      newNode = shuffledList.get(0, true) as DoublyLinkedListNode<IPlayable>
      this.selPlaying.playableNode = newNode
    }
    return newNode
  }

  /**
   * Unshuffles the playables.
   * @param {number} dir value representing the index to add or remove from the index of the current playing node. (1: getsNext, -1: getsPrev, 0: getsCurrent)
   * @returns {DoublyLinkedListNode<IPlayable>} the node that points to the unshuffled version of the list. Either the previous, current, or next node from the current playable.
   */
  private unShuffle (dir: number): DoublyLinkedListNode<IPlayable> {
    if (this.selPlaying.playableArr == null || this.selPlaying.playableNode == null) throw new Error('no sel playing')
    const selPlayable = this.selPlaying.playableNode.data

    console.log('unshuffle')
    this.wasInShuffle = false
    // obtain an unshuffled linked list
    const playableList = arrayToDoublyLinkedList(this.selPlaying.playableArr)

    const newNodeIdx = playableList.findIndex((playable) => playable.selEl.id === selPlayable.selEl.id)
    const newNode = playableList.get(newNodeIdx + dir, true) as DoublyLinkedListNode<IPlayable>
    return newNode
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
  spotifyPlayback.setSelPlayingEl(eventArg, false)
)

export function isSamePlayingURIWithEl (uri: string) {
  return (
    uri === spotifyPlayback.selPlaying.track_uri &&
    spotifyPlayback.selPlaying.element != null
  )
}

export function isSamePlayingURI (uri: string) {
  return uri === spotifyPlayback.selPlaying.track_uri
}

export function checkIfIsPlayingElAfterRerender (uri: string, selEl: Element, trackDataNode: DoublyLinkedListNode<IPlayable>) {
  if (isSamePlayingURIWithEl(uri)) {
    // This element was playing before rerendering so set it to be the currently playing one again
    spotifyPlayback.selPlaying.element = selEl
    spotifyPlayback.selPlaying.playableNode = trackDataNode
  }
}

// append an invisible element then destroy it as a way to load the play and pause images from express.
const preloadPlayPauseImgsHtml = `<div style="display: none"><img src="${config.PATHS.playIcon}"/><img src="${config.PATHS.pauseIcon}"/></div>`
const preloadPlayPauseImgsEl = htmlToEl(preloadPlayPauseImgsHtml) as Node
document.body.appendChild(preloadPlayPauseImgsEl)
document.body.removeChild(preloadPlayPauseImgsEl)

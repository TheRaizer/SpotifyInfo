import {
  config,
  htmlToEl,
  millisToMinutesAndSeconds,
  throwExpression
} from '../config'

export default class SpotifyPlaybackElement {
  public title: Element | null
  public currTime: Element | null
  public duration: Element | null
  public playPause: Element | null
  public songProgress: HTMLInputElement | null
  public volume: HTMLInputElement | null

  constructor () {
    this.title = null
    this.currTime = null
    this.duration = null
    this.playPause = null
    this.volume = null
    this.songProgress = null
  }

  /**
   * Append the web player element to the DOM along with the event listeners for the buttons.
   *
   * @param playPrevFunc the function to run when the play previous button is pressed on the web player.
   * @param pauseFunc the function to run when the pause/play button is pressed on the web player.
   * @param playNextFunc the function to run when the play next button is pressed on the web player.
   */
  public appendWebPlayerHtml (
    playPrevFunc: () => void,
    pauseFunc: () => void,
    playNextFunc: () => void,
    volumeChangeFunc: (percent: number) => void) {
    const html = `
    <article id="${config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config.CSS.CLASSES.ellipsisWrap}">Title</h4>
      <div>
        <article>
          <button id="${config.CSS.IDs.playPrev}"><img src="${config.PATHS.playPrev}" alt="previous"/></button>
          <button id="${config.CSS.IDs.webPlayerPlayPause}"><img src="${config.PATHS.playBlackIcon}" alt="play/pause"/></button>
          <button id="${config.CSS.IDs.playNext}"><img src="${config.PATHS.playNext}" alt="next"/></button>
        </article>
        <input id="${config.CSS.IDs.webPlayerVolume}" type="range" min="0" max="100" value="0" step="1"></input>
      </div>
      <div id="${config.CSS.IDs.playTimeBar}">
        <p>0:00</p>
        <input id="${config.CSS.IDs.webPlayerProgress}" type="range" value="0" step="1"></input>
        <p>0:00</p>
      </div>
    </article>
    `

    const webPlayerEl = htmlToEl(html)
    document.body.append(webPlayerEl as Node)
    this.getWebPlayerEls()
    this.assignEventListeners(playPrevFunc, pauseFunc, playNextFunc, volumeChangeFunc)
  }

  /**
   * Updates the web player element.
   *
   * @param percentDone the percent of the song that has been completed
   * @param position the current position in ms that has been completed
   */
  public updateElement (position: number, duration: number) {
    if (position !== 0) {
      // round each interval to the nearest second so that the movement of progress bar is by second.
      (this.songProgress as HTMLInputElement).max = `${duration / 1000}`;
      (this.songProgress as HTMLInputElement).value = `${Math.round(position / 1000)}`
      if (this.currTime == null) {
        throw new Error('Current time element is null')
      }
      this.currTime.textContent =
        millisToMinutesAndSeconds(position)
    }
  }

  /**
   * Retrieve the web player elements once the web player element has been appeneded to the DOM.
   */
  private getWebPlayerEls () {
    const webPlayerEl = document.getElementById(config.CSS.IDs.webPlayer) ?? throwExpression('web player element does not exist')
    const playTimeBar = document.getElementById(config.CSS.IDs.playTimeBar) ?? throwExpression('play time bar element does not exist')

    this.songProgress = document.getElementById(config.CSS.IDs.webPlayerProgress) as HTMLInputElement ?? throwExpression('web player progress bar does not exist')
    this.title = webPlayerEl.getElementsByTagName('h4')[0] as Element ?? throwExpression('web player title element does not exist')

    // get playtime bar elements
    this.currTime = playTimeBar.getElementsByTagName('p')[0] as Element ?? throwExpression('web player current time element does not exist')
    this.duration = playTimeBar.getElementsByTagName('p')[1] as Element ?? throwExpression('web player duration time element does not exist')

    this.playPause = document.getElementById(config.CSS.IDs.webPlayerPlayPause)
  }

  /**
   * Assigns the events to run on each button press that exists on the web player element.
   *
   * @param playPrevFunc function to run when play previous button is pressed
   * @param pauseFunc function to run when play/pause button is pressed
   * @param playNextFunc function to run when play next button is pressed
   */
  private assignEventListeners (
    playPrevFunc: () => void,
    pauseFunc: () => void,
    playNextFunc: () => void,
    volumeChangeFunc: (percent: number) => void) {
    const playPrev = document.getElementById(config.CSS.IDs.playPrev)
    const playNext = document.getElementById(config.CSS.IDs.playNext)

    playPrev?.addEventListener('click', playPrevFunc)
    playNext?.addEventListener('click', playNextFunc)

    this.playPause?.addEventListener('click', pauseFunc)
  }
}

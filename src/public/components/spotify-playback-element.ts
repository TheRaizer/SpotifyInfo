import {
  config,
  htmlToEl,
  millisToMinutesAndSeconds,
  throwExpression
} from '../config'

class Slider {
  public drag: boolean = false;
  private _sliderEl: HTMLElement | null = null
  public sliderProgress: HTMLElement | null = null;

  public set sliderEl (el: HTMLElement | null) {
    this._sliderEl = el
    this.sliderProgress = el?.getElementsByClassName(config.CSS.CLASSES.progress)[0] as HTMLElement
  }

  public get sliderEl (): HTMLElement | null {
    return this._sliderEl
  }
}

export default class SpotifyPlaybackElement {
  public title: Element | null
  public currTime: Element | null
  public duration: Element | null
  public playPause: Element | null
  public songProgress: Slider
  public volume: Slider

  constructor () {
    this.title = null
    this.currTime = null
    this.duration = null
    this.playPause = null
    this.volume = new Slider()
    this.songProgress = new Slider()
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
        <div id="${config.CSS.IDs.webPlayerVolume}>
          <div class="${config.CSS.CLASSES.progress}"></div>
        </div>
      </div>
      <div id="${config.CSS.IDs.playTimeBar}">
        <p>0:00</p>
        <div id="${config.CSS.IDs.webPlayerProgress}">
          <div class="${config.CSS.CLASSES.progress}"></div>
        </div>
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
  public updateElement (percentDone: number, position: number) {
    if (position !== 0) {
      // round each interval to the nearest second so that the movement of progress bar is by second.
      this.songProgress!.sliderProgress!.style.width = `${percentDone}%`
      if (this.currTime == null) {
        throw new Error('Current time element is null')
      }
      this.currTime.textContent =
        millisToMinutesAndSeconds(position)
    }
  }

  private updateBar (x: number, outerBar: HTMLElement, innerBar: HTMLElement, callback: (percent: number) => void) {
    let percentage
    // take the position we clicked get it in relation to the outer bar and subtract the position of the outerbar element to the client as it may not be at the very left.
    const position = x - outerBar.offsetLeft - outerBar.getBoundingClientRect().x
    percentage = 100 * (position / outerBar.clientWidth)
    console.log(percentage)

    if (percentage > 100) {
      percentage = 100
    }
    if (percentage < 0) {
      percentage = 0
    }

    // update volume bar and video volume
    innerBar.style.width = percentage + '%'

    callback(percentage)
  };

  /**
   * Retrieve the web player elements once the web player element has been appeneded to the DOM.
   */
  private getWebPlayerEls () {
    const webPlayerEl = document.getElementById(config.CSS.IDs.webPlayer) ?? throwExpression('web player element does not exist')
    const playTimeBar = document.getElementById(config.CSS.IDs.playTimeBar) ?? throwExpression('play time bar element does not exist')

    this.songProgress.sliderEl = document.getElementById(config.CSS.IDs.webPlayerProgress) as HTMLElement ?? throwExpression('web player progress bar does not exist')
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

    this.songProgress.sliderEl?.addEventListener('mousedown', (ev) => {
      this.songProgress.drag = true
      this.updateBar(ev.clientX, this.songProgress.sliderEl as HTMLElement, this.songProgress.sliderProgress as HTMLElement, () => { console.log('Update bar') })
    })
    document.addEventListener('mousemove', (ev) => {
      if (this.songProgress.drag) {
        this.updateBar(ev.clientX, this.songProgress.sliderEl as HTMLElement, this.songProgress.sliderProgress as HTMLElement, () => { console.log('Update bar') })
      }
    })
    document.addEventListener('mouseup', () => {
      this.songProgress.drag = false
      this.volume.drag = false
    })
  }
}

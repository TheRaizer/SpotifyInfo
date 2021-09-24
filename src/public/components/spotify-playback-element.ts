import {
  config,
  htmlToEl,
  millisToMinutesAndSeconds,
  throwExpression,
  interactJsConfig
} from '../config'

class Slider {
  public drag: boolean = false;
  public sliderEl: HTMLElement | null = null;
  public sliderProgress: HTMLElement | null = null;
  private percentage: number = 0;
  public max: number = 0;
  private topToBottom: boolean;
  private onDragStart: () => void;
  private onDragStop: (percentage: number) => void;
  private onDragging: (percentage: number) => void;

  constructor (startPercentage: number, onDragStop: (percentage: number) => void, topToBottom: boolean, onDragStart = () => {}, onDragging = (percentage: number) => {}, sliderEl: HTMLElement) {
    this.onDragStop = onDragStop
    this.onDragStart = onDragStart
    this.onDragging = onDragging
    this.topToBottom = topToBottom
    this.percentage = startPercentage

    this.sliderEl = sliderEl
    this.sliderProgress = sliderEl?.getElementsByClassName(config.CSS.CLASSES.progress)[0] as HTMLElement ?? throwExpression('No progress bar found')

    if (this.topToBottom) {
      // if its top to bottom we must rotate the element due reversed height changing
      this.sliderEl!.style.transform = 'rotatex(180deg)'
      this.sliderEl!.style.transformOrigin = 'transform-origin: top'
    }

    this.changeBarLength()
    this.sliderProgress!.style.removeProperty('background-color')
  }

  private updateBar (mosPosVal: number) {
    let position
    if (this.topToBottom) {
      position = mosPosVal - this.sliderEl!.getBoundingClientRect().y
    } else {
      position = mosPosVal - this.sliderEl!.getBoundingClientRect().x
    }

    if (this.topToBottom) {
      // minus 100 because modifying height is reversed
      this.percentage = 100 - (100 * (position / this.sliderEl!.clientHeight))
    } else {
      this.percentage = 100 * (position / this.sliderEl!.clientWidth)
    }

    if (this.percentage > 100) {
      this.percentage = 100
    }
    if (this.percentage < 0) {
      this.percentage = 0
    }
    this.changeBarLength()
  };

  private changeBarLength () {
    // set background color of all moving sliders progress as the spotify green
    this.sliderProgress!.style.backgroundColor = '#1db954'
    if (this.topToBottom) {
      this.sliderProgress!.style.height = this.percentage + '%'
    } else {
    this.sliderProgress!.style.width = this.percentage + '%'
    }
  }

  public addEventListeners () {
    this.addMouseEvents()
    this.addTouchEvents()
  }

  private addTouchEvents () {
    this.sliderEl?.addEventListener('touchstart', (evt) => {
      this.drag = true
      interactJsConfig.restrict = true
      if (this.onDragStart !== null) {
        this.onDragStart()
      }
      this.updateBar(evt.changedTouches[0].clientX)
    })
    document.addEventListener('touchmove', (evt) => {
      if (this.drag) {
        this.onDragging(this.percentage)
        this.updateBar(evt.changedTouches[0].clientX)
      }
    })
    document.addEventListener('touchend', () => {
      interactJsConfig.restrict = false
      if (this.drag) {
        this.onDragStop(this.percentage)
        // remove the inline css so that its original background color returns
        this.sliderProgress!.style.removeProperty('background-color')
        this.drag = false
      }
    })
  }

  private addMouseEvents () {
    this.sliderEl?.addEventListener('mousedown', (evt) => {
      this.drag = true
      interactJsConfig.restrict = true
      if (this.onDragStart !== null) {
        this.onDragStart()
      }
      if (this.topToBottom) {
        this.updateBar(evt.clientY)
      } else {
        this.updateBar(evt.clientX)
      }
    })
    document.addEventListener('mousemove', (evt) => {
      if (this.drag) {
        this.onDragging(this.percentage)
        if (this.topToBottom) {
          this.updateBar(evt.clientY)
        } else {
          this.updateBar(evt.clientX)
        }
      }
    })
    document.addEventListener('mouseup', () => {
      interactJsConfig.restrict = false
      if (this.drag) {
        this.onDragStop(this.percentage)
        // remove the inline css so that its original background color returns
        this.sliderProgress!.style.removeProperty('background-color')
        this.drag = false
      }
    })
  }
}

export default class SpotifyPlaybackElement {
  public title: Element | null;
  public currTime: Element | null;
  public duration: Element | null;
  public playPause: Element | null;
  public songProgress: Slider | null = null;
  private volumeBar: Slider | null = null;

  constructor () {
    this.title = null
    this.currTime = null
    this.duration = null
    this.playPause = null
  }

  /**
   * Append the web player element to the DOM along with the event listeners for the buttons.
   *
   * @param playPrevFunc the function to run when the play previous button is pressed on the web player.
   * @param pauseFunc the function to run when the pause/play button is pressed on the web player.
   * @param playNextFunc the function to run when the play next button is pressed on the web player.
   * @param onSeekStart - on drag start event for song progress slider
   * @param seekSong - on drag end event to seek song for song progress slider
   * @param onSeeking - on dragging event for song progress slider
   * @param setVolume - on dragging and on drag end event for volume slider
   * @param initialVolume - the initial volume to set the slider at
   */
  public appendWebPlayerHtml (
    playPrevFunc: () => void,
    pauseFunc: () => void,
    playNextFunc: () => void,
    onSeekStart: () => void,
    seekSong: (percentage: number) => void,
    onSeeking: (percentage: number) => void,
    setVolume: (percentage: number) => void,
    initialVolume: number) {
    const html = `
    <article id="${config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config.CSS.CLASSES.ellipsisWrap}">Title</h4>
      <div>
        <article>
          <button id="${config.CSS.IDs.playPrev}"><img src="${config.PATHS.playPrev}" alt="previous"/></button>
          <button id="${config.CSS.IDs.webPlayerPlayPause}"><img src="${config.PATHS.playBlackIcon}" alt="play/pause"/></button>
          <button id="${config.CSS.IDs.playNext}"><img src="${config.PATHS.playNext}" alt="next"/></button>
        </article>
        <div id="${config.CSS.IDs.webPlayerVolume}" class="${config.CSS.CLASSES.slider}">
          <div class="${config.CSS.CLASSES.progress}"></div>
        </div>
      </div>
      <div id="${config.CSS.IDs.playTimeBar}">
        <p>0:00</p>
        <div id="${config.CSS.IDs.webPlayerProgress}" class="${config.CSS.CLASSES.slider}">
          <div class="${config.CSS.CLASSES.progress}"></div>
        </div>
        <p>0:00</p>
      </div>
    </article>
    `

    const webPlayerEl = htmlToEl(html)
    document.body.append(webPlayerEl as Node)
    this.getWebPlayerEls(
      onSeekStart,
      seekSong,
      onSeeking,
      setVolume,
      initialVolume)
    this.assignEventListeners(
      playPrevFunc,
      pauseFunc,
      playNextFunc
    )
  }

  /**
   * Updates the web player element.
   *
   * @param percentDone the percent of the song that has been completed
   * @param position the current position in ms that has been completed
   */
  public updateElement (percentDone: number, position: number) {
    // if the user is dragging the song progress bar don't auto update
    if (position !== 0 && !this.songProgress!.drag) {
      // round each interval to the nearest second so that the movement of progress bar is by second.
      this.songProgress!.sliderProgress!.style.width = `${percentDone}%`
      if (this.currTime == null) {
        throw new Error('Current time element is null')
      }
      this.currTime.textContent = millisToMinutesAndSeconds(position)
    }
  }

  /**
   * Retrieve the web player elements once the web player element has been appeneded to the DOM. Initializes Sliders.
   * @param onSeekStart - on drag start event for song progress slider
   * @param seekSong - on drag end event to seek song for song progress slider
   * @param onSeeking - on dragging event for song progress slider
   * @param setVolume - on dragging and on drag end event for volume slider
   * @param initialVolume - the initial volume to set the slider at
   */
  private getWebPlayerEls (
    onSeekStart: () => void,
    seekSong: (percentage: number) => void,
    onSeeking: (percentage: number) => void,
    setVolume: (percentage: number) => void,
    initialVolume: number) {
    const webPlayerEl = document.getElementById(config.CSS.IDs.webPlayer) ?? throwExpression('web player element does not exist')
    const playTimeBar = document.getElementById(config.CSS.IDs.playTimeBar) ?? throwExpression('play time bar element does not exist')

    const songSliderEl = document.getElementById(config.CSS.IDs.webPlayerProgress) as HTMLElement ?? throwExpression('web player progress bar does not exist')
    const volumeSliderEl = document.getElementById(config.CSS.IDs.webPlayerVolume) as HTMLElement ?? throwExpression('web player volume bar does not exist')

    this.songProgress = new Slider(0, seekSong, false, onSeekStart, onSeeking, songSliderEl)
    this.volumeBar = new Slider(initialVolume * 100, setVolume, true, () => {}, setVolume, volumeSliderEl)

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
    playNextFunc: () => void) {
    const playPrev = document.getElementById(config.CSS.IDs.playPrev)
    const playNext = document.getElementById(config.CSS.IDs.playNext)

    playPrev?.addEventListener('click', playPrevFunc)
    playNext?.addEventListener('click', playNextFunc)

    this.playPause?.addEventListener('click', pauseFunc)
    this.songProgress?.addEventListeners()
    this.volumeBar?.addEventListeners()
  }
}

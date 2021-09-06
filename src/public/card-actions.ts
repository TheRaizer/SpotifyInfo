import { config, isEllipsisActive, getTextWidth } from './config'
import Card from './components/card'

export default class CardActionsHandler {
  storedSelEls: Array<Element>;
  currScrollingAnim: Animation | null;

  constructor (maxLength: number) {
    this.storedSelEls = new Array(maxLength)
    this.currScrollingAnim = null
  }

  /** Manages selecting a card and deselecting the previous selected one
   * when a cards on click event listener is triggered.
   *
   * @param {Element} selCardEl - the card that executed this function when clicked
   * @param {Array<Card>} corrObjList - the list of objects that contains one that corrosponds to the selected card,
   * each ***object must have the cardId attribute.
   * @param {Function} callback - function to run when selected object has changed
   * @param {Boolean} allowUnselSelected - whether to allow unselecting of the selected card by clicking on it again
   * @param {Boolean} unselectPrevious - whether to unselect the previously selected card
   */
  onCardClick (
    selCardEl: Element,
    corrObjList: Array<Card>,
    callback: Function | null,
    allowUnselSelected: boolean = false,
    unselectPrevious: boolean = true
  ) {
    if (this.storedSelEls.includes(selCardEl)) {
      if (allowUnselSelected) {
        const selCard = this.storedSelEls[this.storedSelEls.indexOf(selCardEl)]
        selCard.classList.remove(config.CSS.CLASSES.selected)
        this.storedSelEls.splice(this.storedSelEls.indexOf(selCardEl), 1)
      }
      return
    }
    // get corrosponding object using the cardEl id
    const selObj = corrObjList.find((x) => {
      const xCard = x as Card
      return xCard.getCardId() === selCardEl.id
    })

    // error if there is no corrosponding object
    if (!selObj) {
      throw new Error(
        `There is no corrosponding object to the selected card, meaning the id of the card element \
      does not match any of the corrosponding 'cardId' attribtues. Ensure that the cardId attribute \
      is assigned as the card elements HTML 'id' when the card is created.`
      )
    }

    // unselect the previously selected card if it exists
    if (Object.keys(this.storedSelEls).length > 0 && unselectPrevious) {
      const storedEl = this.storedSelEls.pop()
      if (storedEl !== undefined) { storedEl.classList.remove(config.CSS.CLASSES.selected) }
    }

    // on click add the 'selected' class onto the element which runs a transition
    selCardEl.classList.add(config.CSS.CLASSES.selected)
    this.storedSelEls.push(selCardEl)
    if (callback != null) {
      callback(selObj)
    }
  }

  /** Manages adding certain properties realting to scrolling text when entering
   * a card element. We assume there is only one scrolling text on the card.
   *
   * @param {Element} enteringCardEl - element you are entering, that contains the scrolling text
   */
  scrollTextOnCardEnter (enteringCardEl: Element) {
    const scrollingText = enteringCardEl.getElementsByClassName(
      config.CSS.CLASSES.scrollingText
    )[0] as HTMLElement
    const parent = scrollingText.parentElement

    if (isEllipsisActive(scrollingText)) {
      parent?.classList.add(config.CSS.CLASSES.scrollLeft)
      scrollingText.classList.remove(config.CSS.CLASSES.ellipsisWrap)
      this.runScrollingTextAnim(scrollingText, enteringCardEl)
    }
  }

  /** Starts to scroll text from left to right.
   *
   * @param {Element} scrollingText - element containing the text that will scroll
   * @param {Element} cardEl - card element that contains the scrolling text
   */
  runScrollingTextAnim (scrollingText: Element, cardEl: Element) {
    const LINGER_AMT = 20
    const font = window
      .getComputedStyle(scrollingText, null)
      .getPropertyValue('font')

    if (scrollingText.textContent === null) {
      throw new Error('Scrolling text element does not contain any text content')
    }
    this.currScrollingAnim = scrollingText.animate(
      [
        // keyframes
        { transform: 'translateX(0px)' },
        {
          transform: `translateX(${
            -getTextWidth(scrollingText.textContent, font) - LINGER_AMT
          }px)`
        }
      ],
      {
        // timing options
        duration: 5000,
        iterations: 1
      }
    )

    this.currScrollingAnim.onfinish = () => this.scrollTextOnCardLeave(cardEl)
  }

  /** Manages removing certain properties relating to scrolling text once leaving
   * a card element. We assume there is only one scrolling text on the card.
   *
   * @param {HTML} leavingCardEl - element you are leaving, that contains the scrolling text
   */
  scrollTextOnCardLeave (leavingCardEl: Element) {
    const scrollingText = leavingCardEl.getElementsByClassName(
      config.CSS.CLASSES.scrollingText
    )[0]
    const parent = scrollingText.parentElement

    parent?.classList.remove(config.CSS.CLASSES.scrollLeft)
    scrollingText.classList.add(config.CSS.CLASSES.ellipsisWrap)
    this.currScrollingAnim?.cancel()
  }

  clearSelectedEls () {
    this.storedSelEls.splice(0, this.storedSelEls.length)
  }

  addAllEventListeners (
    cards: Array<Element>,
    objArr: Array<Card>,
    clickCallBack: null | ((selObj: unknown) => void),
    allowUnselected: boolean,
    unselectPrevious: boolean
  ) {
    this.clearSelectedEls()

    cards.forEach((trackCard) => {
      trackCard.addEventListener('click', () =>
        this.onCardClick(
          trackCard,
          objArr,
          clickCallBack,
          allowUnselected,
          unselectPrevious
        )
      )
      trackCard.addEventListener('mouseenter', () => {
        this.scrollTextOnCardEnter(trackCard)
      })
      trackCard.addEventListener('mouseleave', () => {
        this.scrollTextOnCardLeave(trackCard)
      })
    })
  }
}

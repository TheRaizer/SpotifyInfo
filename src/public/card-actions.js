import { config, isEllipsisActive, getTextWidth } from "./config.js";

export default class CardActionsHandler {
  constructor(maxLength) {
    this.storedSelEls = new Array(maxLength);
    this.currScrollingAnim = null;
  }

  /** Manages selecting a card and deselecting the previous selected one
   * when a cards on click event listener is triggered.
   *
   * @param {HTML} selCardEl - the card that executed this function when clicked
   * @param {List} corrObjList - the list of objects that contains one that corrosponds to the selected card,
   * each ***object must have the cardId attribute.
   * @param {Function} callback - function to run when selected object has changed
   * @param {Boolean} allowUnselSelected - whether to allow unselecting of the selected card by clicking on it again
   * @param {Boolean} unselectPrevious - whether to unselect the previously selected card
   */
  onCardClick(
    selCardEl,
    corrObjList,
    callback = null,
    allowUnselSelected = false,
    unselectPrevious = true
  ) {
    if (this.storedSelEls.includes(selCardEl)) {
      if (allowUnselSelected) {
        let selCard = this.storedSelEls[this.storedSelEls.indexOf(selCardEl)];
        selCard.classList.remove(config.CSS.CLASSES.selected);
        this.storedSelEls.splice(this.storedSelEls.indexOf(selCardEl), 1);
      }
      return;
    }
    // get corrosponding object using the cardEl id
    let selObj = corrObjList.find((x) => x.getCardId() == selCardEl.id);

    // error if there is no corrosponding object
    if (!selObj) {
      throw new Error(
        "There is no corrosponding object to the selected card, meaning the id of the card element \
      does not match any of the corrosponding 'cardId' attribtues. Ensure that the cardId attribute \
      is assigned as the card elements HTML 'id' when the card is created."
      );
    }

    // unselect the previously selected card if it exists
    if (Object.keys(this.storedSelEls).length > 0 && unselectPrevious) {
      this.storedSelEls.pop().classList.remove(config.CSS.CLASSES.selected);
    }

    // on click add the 'selected' class onto the element which runs a transition
    selCardEl.classList.add(config.CSS.CLASSES.selected);
    this.storedSelEls.push(selCardEl);
    if (callback != null) {
      callback(selObj);
    }
  }

  /** Manages adding certain properties realting to scrolling text when entering
   * a card element. We assume there is only one scrolling text on the card.
   *
   * @param {HTML} enteringCardEl - element you are entering, that contains the scrolling text
   */
  scrollTextOnCardEnter(enteringCardEl) {
    let scrollingText = enteringCardEl.getElementsByClassName(
      config.CSS.CLASSES.scrollingText
    )[0];
    let parent = scrollingText.parentElement;

    if (isEllipsisActive(scrollingText)) {
      parent.classList.add(config.CSS.CLASSES.scrollLeft);
      scrollingText.classList.remove(config.CSS.CLASSES.ellipsisWrap);
      this.runScrollingTextAnim(scrollingText, enteringCardEl);
    }
  }

  /** Starts to scroll text from left to right.
   *
   * @param {HTML} scrollingText - element containing the text that will scroll
   * @param {HTML} cardEl - card element that contains the scrolling text
   */
  runScrollingTextAnim(scrollingText, cardEl) {
    const LINGER_AMT = 20;
    let font = window
      .getComputedStyle(scrollingText, null)
      .getPropertyValue("font");

    this.currScrollingAnim = scrollingText.animate(
      [
        // keyframes
        { transform: "translateX(0px)" },
        {
          transform: `translateX(${
            -getTextWidth(scrollingText.textContent, font) - LINGER_AMT
          }px)`,
        },
      ],
      {
        // timing options
        duration: 5000,
        iterations: 1,
      }
    );

    this.currScrollingAnim.onfinish = () => this.scrollTextOnCardLeave(cardEl);
  }

  /** Manages removing certain properties relating to scrolling text once leaving
   * a card element. We assume there is only one scrolling text on the card.
   *
   * @param {HTML} leavingCardEl - element you are leaving, that contains the scrolling text
   */
  scrollTextOnCardLeave(leavingCardEl) {
    let scrollingText = leavingCardEl.getElementsByClassName(
      config.CSS.CLASSES.scrollingText
    )[0];
    let parent = scrollingText.parentElement;

    parent.classList.remove(config.CSS.CLASSES.scrollLeft);
    scrollingText.classList.add(config.CSS.CLASSES.ellipsisWrap);
    this.currScrollingAnim?.cancel();
  }

  clearSelectedEls() {
    this.storedSelEls.splice(0, this.storedSelEls.length);
  }

  addAllEventListeners(
    cards,
    objArr,
    clickCallBack,
    allowUnselected,
    unselectPrevious
  ) {
    this.clearSelectedEls();

    cards.forEach((trackCard) => {
      trackCard.addEventListener("click", () =>
        this.onCardClick(
          trackCard,
          objArr,
          clickCallBack,
          allowUnselected,
          unselectPrevious
        )
      );
      trackCard.addEventListener("mouseenter", () => {
        this.scrollTextOnCardEnter(trackCard);
      });
      trackCard.addEventListener("mouseleave", () => {
        this.scrollTextOnCardLeave(trackCard);
      });
    });
  }
}

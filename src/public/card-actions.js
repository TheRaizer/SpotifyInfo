import { config } from "../../config.js";

export function scrollTextOnCardHover(cardEl) {}

export class CardActionsHandler {
  constructor(maxLength) {
    this.storedSelEls = new Array(maxLength);
  }

  /** Manages selecting a card and deselecting the previous selected one
   * when a cards on click event listener is triggered.
   *
   * @param {HTML} selCardEl - the card that executed this function when clicked
   * @param {List} corrObjList - the list of objects that contains one that corrosponds to the selected card,
   * each object should have the cardId attribute.
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
    let selObj = corrObjList.find((x) => {
      if (x.cardId == undefined) {
        throw new Error(
          "corrosponding card object does not contain the 'cardId' attribute"
        );
      }
      return x.cardId == selCardEl.id;
    });

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
  clearSelectedEls() {
    this.storedSelEls.splice(0, this.storedSelEls.length);
  }
}

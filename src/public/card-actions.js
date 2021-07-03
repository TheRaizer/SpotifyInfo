import { config } from "../../config.js";

/* Manages selecting a card and deselecting the previous selected one
when a cards on click event listener is triggered.

@param {HTML} prevSelCardEl - the card that was previously selected
@param {HTML} selCardEl - the card that executed this function when clicked
@param {List} corrObjList - the list of objects that contains one that corrosponds to the selected card,
each object should have the cardId attribute.
@param {boolean} allowUnselSelected - whether to allow unselecting of the selected card by clicking on it again

@returns {HTML} selCardEl - the card that is currently selected
@returns {Object} corrObj - the object that corrosponds to the currently selected card
@returns {boolean} ok - whether the action of selecting the card succesfully occured
*/
export function onCardClick(
  prevSelCardEl,
  selCardEl,
  corrObjList,
  allowUnselSelected = false
) {
  if (prevSelCardEl === selCardEl) {
    if (allowUnselSelected) {
      prevSelCardEl.classList.remove(config.CSS.CLASSES.selected);
    }
    return {
      cardEl: null,
      corrObj: null,
      ok: allowUnselSelected ? true : false,
    };
  }
  // get corrosponding object using the cardEl id
  let corrObj = corrObjList.find((x) => {
    if (x.cardId == undefined) {
      throw new Error(
        "corrosponding card object does not contain the 'cardId' attribute"
      );
    }
    return x.cardId == selCardEl.id;
  });

  // error if there is no corrosponding object
  if (!corrObj) {
    throw new Error(
      "There is no corrosponding object to the selected card, meaning the id of the card element \
      does not match any of the corrosponding 'cardId' attribtues. Ensure that the cardId attribute \
      is assigned as the card elements HTML 'id' when the card is created."
    );
  }

  // unselect the previously selected card if it exists
  if (prevSelCardEl) {
    prevSelCardEl.classList.remove(config.CSS.CLASSES.selected);
  }

  // on click add the 'selected' class onto the element which runs a transition
  selCardEl.classList.add(config.CSS.CLASSES.selected);
  return {
    selCardEl,
    corrObj: corrObj,
    ok: true,
  };
}

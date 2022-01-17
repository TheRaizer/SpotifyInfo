"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class CardActionsHandler {
    constructor(maxLength) {
        this.storedSelEls = new Array(maxLength);
        this.currScrollingAnim = null;
    }
    /**
     * Manages selecting a card and deselecting the previous selected one
     * when a cards on click event listener is triggered.
     *
     * @param {Element} selCardEl - the card that executed this function when clicked
     * @param {Array<Card>} corrObjList - the list of objects that contains one that corrosponds to the selected card,
     * each ***object must have the cardId attribute.
     * @param {Function} callback - function to run when selected object has changed
     * @param {boolean} allowUnselSelected - whether to allow unselecting of the selected card by clicking on it again
     * @param {boolean} unselectPrevious - whether to unselect the previously selected card
     */
    onCardClick(selCardEl, corrObjList, callback, allowUnselSelected = false, unselectPrevious = true) {
        // if the selected card is selected, and we can unselect it, do so.
        if (this.storedSelEls.includes(selCardEl)) {
            if (allowUnselSelected) {
                const selCard = this.storedSelEls[this.storedSelEls.indexOf(selCardEl)];
                selCard.classList.remove(config_1.config.CSS.CLASSES.selected);
                this.storedSelEls.splice(this.storedSelEls.indexOf(selCardEl), 1);
            }
            return;
        }
        // get corrosponding object using the cardEl id
        const selObj = corrObjList.find((x) => {
            const xCard = x;
            return xCard.getCardId() === selCardEl.id;
        });
        // error if there is no corrosponding object
        if (!selObj) {
            throw new Error(`There is no corrosponding object to the selected card, meaning the id of the card element \
      does not match any of the corrosponding 'cardId' attribtues. Ensure that the cardId attribute \
      is assigned as the card elements HTML 'id' when the card is created.`);
        }
        // unselect the previously selected card if it exists and if we are allowed too
        if (Object.keys(this.storedSelEls).length > 0 && unselectPrevious) {
            const storedEl = this.storedSelEls.pop();
            if (storedEl !== undefined) {
                storedEl.classList.remove(config_1.config.CSS.CLASSES.selected);
            }
        }
        // on click add the 'selected' class onto the element which runs a transition
        selCardEl.classList.add(config_1.config.CSS.CLASSES.selected);
        this.storedSelEls.push(selCardEl);
        if (callback != null) {
            callback(selObj);
        }
    }
    /**
     * Manages adding certain properties realting to scrolling text when entering
     * a card element. We assume there is only one scrolling text on the card.
     *
     * @param {Element} enteringCardEl - element you are entering, that contains the scrolling text
     */
    scrollTextOnCardEnter(enteringCardEl) {
        const scrollingText = enteringCardEl.getElementsByClassName(config_1.config.CSS.CLASSES.scrollingText)[0];
        const parent = scrollingText.parentElement;
        if ((0, config_1.isEllipsisActive)(scrollingText)) {
            parent === null || parent === void 0 ? void 0 : parent.classList.add(config_1.config.CSS.CLASSES.scrollLeft);
            scrollingText.classList.remove(config_1.config.CSS.CLASSES.ellipsisWrap);
            this.runScrollingTextAnim(scrollingText, enteringCardEl);
        }
    }
    /**
     * Starts to scroll text from left to right.
     *
     * @param {Element} scrollingText - element containing the text that will scroll
     * @param {Element} cardEl - card element that contains the scrolling text
     */
    runScrollingTextAnim(scrollingText, cardEl) {
        const LINGER_AMT = 20;
        const font = window
            .getComputedStyle(scrollingText, null)
            .getPropertyValue('font');
        if (scrollingText.textContent === null) {
            throw new Error('Scrolling text element does not contain any text content');
        }
        this.currScrollingAnim = scrollingText.animate([
            // keyframes
            { transform: 'translateX(0px)' },
            {
                transform: `translateX(${-(0, config_1.getTextWidth)(scrollingText.textContent, font) - LINGER_AMT}px)`
            }
        ], {
            // timing options
            duration: 5000,
            iterations: 1
        });
        this.currScrollingAnim.onfinish = () => this.scrollTextOnCardLeave(cardEl);
    }
    /**
     * Manages removing certain properties relating to scrolling text once leaving
     * a card element. We assume there is only one scrolling text on the card.
     *
     * @param {Element} leavingCardEl - element you are leaving, that contains the scrolling text
     */
    scrollTextOnCardLeave(leavingCardEl) {
        var _a;
        const scrollingText = leavingCardEl.getElementsByClassName(config_1.config.CSS.CLASSES.scrollingText)[0];
        const parent = scrollingText.parentElement;
        parent === null || parent === void 0 ? void 0 : parent.classList.remove(config_1.config.CSS.CLASSES.scrollLeft);
        scrollingText.classList.add(config_1.config.CSS.CLASSES.ellipsisWrap);
        (_a = this.currScrollingAnim) === null || _a === void 0 ? void 0 : _a.cancel();
    }
    clearSelectedEls() {
        this.storedSelEls.splice(0, this.storedSelEls.length);
    }
    /**
     * For every card in the given array we add an onClick, mouseenter, and mouseleave event listener to it.
     * @param {Array<Element>} cards the card elements to add the event listeners too.
     * @param {Array<Card>} objArr the array of Card instances corrosponding to the given card elements.
     * @param {null | ((selObj: unknown) => void)} clickCallBack a function to execute when the card is clicked.
     * @param {boolean} unselectPrevious whether to unselect the previous card when a new card is clicked.
     */
    addAllEventListeners(cards, objArr, clickCallBack, unselectPrevious) {
        this.clearSelectedEls();
        cards.forEach((trackCard) => {
            trackCard.addEventListener('click', (evt) => {
                var _a;
                // if the element restricts flip on click then dont flip the card
                if ((_a = evt.target) === null || _a === void 0 ? void 0 : _a.getAttribute(config_1.config.CSS.ATTRIBUTES.restrictFlipOnClick)) {
                    return;
                }
                this.onCardClick(trackCard, objArr, clickCallBack, true, unselectPrevious);
            });
            trackCard.addEventListener('mouseenter', () => {
                this.scrollTextOnCardEnter(trackCard);
            });
            trackCard.addEventListener('mouseleave', () => {
                this.scrollTextOnCardLeave(trackCard);
            });
        });
    }
}
exports.default = CardActionsHandler;
//# sourceMappingURL=card-actions.js.map
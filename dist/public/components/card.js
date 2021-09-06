"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Card {
    constructor() {
        this.cardId = null;
    }
    getCardId() {
        if (this.cardId == null) {
            throw new Error("Card id was asking to be retrieved but is null");
        }
        else {
            return this.cardId;
        }
    }
}
exports.default = Card;

class Card {
  cardId: string

  constructor () {
    this.cardId = ''
  }

  /**
   * Get the id that corrosponds to an element id for the corrosponding card element.
   * @returns {string} the card element id.
   */
  getCardId () {
    if (this.cardId === 'null') {
      throw new Error('Card id was asking to be retrieved but is null')
    } else {
      return this.cardId
    }
  }
}

export default Card

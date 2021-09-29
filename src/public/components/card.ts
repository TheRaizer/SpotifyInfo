class Card {
  cardId: string;

  constructor () {
    this.cardId = ''
  }

  getCardId () {
    if (this.cardId === 'null') {
      throw new Error('Card id was asking to be retrieved but is null')
    } else {
      return this.cardId
    }
  }
}

export default Card

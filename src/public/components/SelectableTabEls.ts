import { config } from '../config'

class SelectableTabEls {
  btn: Element;
  borderCover: Element;
  constructor (btn: Element, borderCover: Element) {
    this.btn = btn
    this.borderCover = borderCover
  }

  unselectEls () {
    this.btn.classList.remove(config.CSS.CLASSES.selected)
    this.borderCover.classList.remove(config.CSS.CLASSES.selected)
  }

  selectEls () {
    this.btn.classList.add(config.CSS.CLASSES.selected)
    this.borderCover.classList.add(config.CSS.CLASSES.selected)
  }

  selectNewTab (btn: Element, borderCover: Element) {
    // unselect the previous tab
    this.unselectEls()

    // reassign the new tab elements
    this.btn = btn
    this.borderCover = borderCover

    // select the new tab
    this.selectEls()
  }
}

export default SelectableTabEls

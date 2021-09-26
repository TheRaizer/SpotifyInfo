import { config } from '../config'

class SelectableTabEls {
  btn: Element | undefined;
  borderCover: Element | undefined;

  private unselectEls () {
    if (this.btn && this.borderCover) {
      this.btn.classList.remove(config.CSS.CLASSES.selected)
      this.borderCover.classList.remove(config.CSS.CLASSES.selected)
    }
  }

  private selectEls () {
    if (this.btn && this.borderCover) {
      this.btn.classList.add(config.CSS.CLASSES.selected)
      this.borderCover.classList.add(config.CSS.CLASSES.selected)
    }
  }

  public selectNewTab (btn: Element, borderCover: Element) {
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

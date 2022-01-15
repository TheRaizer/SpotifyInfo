import { config } from '../config'

class SelectableTabEls {
  btn: Element | undefined // currently selected tab button
  borderCover: Element | undefined // currently selected tab border cover

  /**
   * Removes the required CSS classes to the current elements.
   */
  private unselectEls () {
    if (this.btn && this.borderCover) {
      this.btn.classList.remove(config.CSS.CLASSES.selected)
      this.borderCover.classList.remove(config.CSS.CLASSES.selected)
    }
  }

  /**
   * Adds the required CSS classes to the current elements.
   */
  private selectEls () {
    if (this.btn && this.borderCover) {
      this.btn.classList.add(config.CSS.CLASSES.selected)
      this.borderCover.classList.add(config.CSS.CLASSES.selected)
    }
  }

  /**
   * Select new tab and unselect previous tab.
   * @param {Element} btn the button for the tab that will be selected.
   * @param {Element} borderCover the border cover for the tab that will be selected.
   */
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

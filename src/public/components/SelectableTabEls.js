import { config } from "../../config.js";

class SelectableTabEls {
  constructor(btn, borderCover) {
    this.btn = btn;
    this.borderCover = borderCover;
  }
  unselectEls() {
    this.btn.classList.remove(config.CSS.CLASSES.selected);
    this.borderCover.classList.remove(config.CSS.CLASSES.selected);
  }
  selectEls() {
    this.btn.classList.add(config.CSS.CLASSES.selected);
    this.borderCover.classList.add(config.CSS.CLASSES.selected);
  }

  selectNewTab(btn, borderCover) {
    // unselect the previous tab
    this.unselectEls();

    // reassign the new tab elements
    this.btn = btn;
    this.borderCover = borderCover;

    // select the new tab
    this.selectEls();
  }
}

export default SelectableTabEls;

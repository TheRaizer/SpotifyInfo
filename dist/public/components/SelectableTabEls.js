"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class SelectableTabEls {
    /**
     * Removes the required CSS classes to the current elements.
     */
    unselectEls() {
        if (this.btn && this.borderCover) {
            this.btn.classList.remove(config_1.config.CSS.CLASSES.selected);
            this.borderCover.classList.remove(config_1.config.CSS.CLASSES.selected);
        }
    }
    /**
     * Adds the required CSS classes to the current elements.
     */
    selectEls() {
        if (this.btn && this.borderCover) {
            this.btn.classList.add(config_1.config.CSS.CLASSES.selected);
            this.borderCover.classList.add(config_1.config.CSS.CLASSES.selected);
        }
    }
    /**
     * Select new tab and unselect previous tab.
     * @param {Element} btn the button for the tab that will be selected.
     * @param {Element} borderCover the border cover for the tab that will be selected.
     */
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
exports.default = SelectableTabEls;
//# sourceMappingURL=SelectableTabEls.js.map
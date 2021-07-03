class AsyncSelectionVerif {
  constructor() {
    this.currSelectedVal = null;
    this.hasLoadedCurrSelected = false;
  }

  /* Change the value of the currently selected and reset the has loaded boolean.
   *
   * @param {Any} - data that has been selected
   */
  selectionChanged(currSelectedVal) {
    this.currSelectedVal = currSelectedVal;
    this.hasLoadedCurrSelected = false;
  }

  /** Checks to see if a selected value post load is valid by
   * comparing it to the currently selected value and verifying that
   * the currently selected has not already been loaded.
   *
   * @param {Any} - data that has been loaded
   * @returns {Boolean} - whether the loaded selection is valid
   */
  isValid(postLoadVal) {
    if (this.currSelectedVal !== postLoadVal || this.hasLoaded) {
      return false;
    } else {
      return true;
    }
  }
}

export default AsyncSelectionVerif;

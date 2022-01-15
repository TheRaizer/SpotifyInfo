class AsyncSelectionVerif<T> {
  private _currSelectedVal: T | null
  hasLoadedCurrSelected: boolean

  constructor () {
    this._currSelectedVal = null

    // used to ensure that an object that has loaded will not be loaded again
    this.hasLoadedCurrSelected = false
  }

  get currSelectedValNoNull (): T {
    if (!this._currSelectedVal) {
      throw new Error('Currently selected value is accessed without being assigned')
    } else {
      return this._currSelectedVal
    }
  }

  get currSelectedVal (): T | null {
    return this._currSelectedVal
  }

  /**
   * Change the value of the currently selected and reset the has loaded boolean.
   *
   * @param {T} currSelectedVal the value to change the currently selected value too.
   */
  selectionChanged (currSelectedVal: T) {
    this._currSelectedVal = currSelectedVal
    this.hasLoadedCurrSelected = false
  }

  /**
   * Checks to see if a selected value post load is valid by
   * comparing it to the currently selected value and verifying that
   * the currently selected has not already been loaded.
   *
   * @param {T} postLoadVal data that has been loaded
   * @returns {Boolean} whether the loaded selection is valid
   */
  isValid (postLoadVal: T): boolean {
    if (this._currSelectedVal !== postLoadVal || this.hasLoadedCurrSelected) {
      return false
    } else {
      // if is valid then we assume that this value will be loaded
      this.hasLoadedCurrSelected = true
      return true
    }
  }
}

export default AsyncSelectionVerif

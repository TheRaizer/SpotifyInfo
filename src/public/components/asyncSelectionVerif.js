class AsyncSelectionVerif {
  constructor() {
    // used to compare to a loaded value
    this.currSelectedVal = null;
    this.hasLoadedCurrSelected = false;
  }

  // change the value in the lock when another value is selected
  selectionChanged(currSelectedVal) {
    this.currSelectedVal = currSelectedVal;
    this.hasLoadedCurrSelected = false;
  }

  isValid(currLoadedVal) {
    // if the currently selected object is not the same as the one just loaded it is not valid
    // if it is the same object, but the object has already been loaded it is also not valid.
    if (this.currSelectedVal !== currLoadedVal || this.hasLoaded) {
      return false;
    } else {
      return true;
    }
  }
}

export default AsyncSelectionVerif;

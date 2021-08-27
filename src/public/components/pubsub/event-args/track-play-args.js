export default class TrackPlayEventArg {
  /** Takes in the current track to play as well as the prev tracks and next tracks from it.
   * Note that it does not take Track instances.
   *
   * @param {{selEl, track_uri, trackTitle}} currTrack - object containing element to select, track_uri, and track title.
   * @param {Array<Object>} prevTracks - array of objects identical to the currTrack object that are songs previous.
   * @param {Array<Object>} nextTracks - array of objects identical to the currTrack object that are songs to play next.
   */
  constructor(currTrack, prevTracks, nextTracks) {
    this.currTrack = currTrack;
    this.prevTracks = prevTracks;
    this.nextTracks = nextTracks;
  }
}

export default class TrackPlayEventArg {
  /** Takes in the current track to play as well as the prev tracks and next tracks from it.
   * Note that it does not take Track instances.
   *
   * @param {{selEl, track_uri, trackTitle}} currTrack - object containing element to select, track_uri, and track title.
   * @param {DoublyLinkedListNode} trackDataNode - node that allows us to traverse to next and previous track datas.
   */
  constructor(currTrack, trackDataNode) {
    this.currTrack = currTrack;
    this.trackDataNode = trackDataNode;
  }
}

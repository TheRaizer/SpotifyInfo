"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TrackPlayEventArg {
    /** Takes in the current track to play as well as the prev tracks and next tracks from it.
     * Note that it does not take Track instances.
     *
     * @param {Track} currTrack - object containing element to select, track_uri, and track title.
     * @param {DoublyLinkedListNode} trackNode - node that allows us to traverse to next and previous track datas.
     */
    constructor(currTrack, trackNode) {
        this.currTrack = currTrack;
        this.trackNode = trackNode;
    }
}
exports.default = TrackPlayEventArg;

import { IPlayable } from '../../../../types'
import { DoublyLinkedListNode } from '../../doubly-linked-list'

export default class PlayableEventArg {
  currPlayable: IPlayable;
  playableNode: DoublyLinkedListNode<IPlayable>

  /** Takes in the current track to play as well as the prev tracks and next tracks from it.
   * Note that it does not take Track instances.
   *
   * @param {IPlayable} currTrack - object containing element to select, track_uri, and track title.
   * @param {DoublyLinkedListNode<IPlayable>} trackNode - node that allows us to traverse to next and previous track datas.
   */
  constructor (currTrack: IPlayable, trackNode: DoublyLinkedListNode<IPlayable>) {
    this.currPlayable = currTrack
    this.playableNode = trackNode
  }
}

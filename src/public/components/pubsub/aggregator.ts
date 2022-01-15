import Subscription from './subscription'

/** Lets say you have two doors that will open through the pub sub system. What will happen is that we will subscribe one
 * on door open event. We will then have two publishers that will each propagate a different door through the aggregator at different points.
 * The aggregator will then execute the on door open subscriber and pass in the door given by either publisher.
 */

/** Manages subscribing and publishing of events.
 * ----------------------------------------------------------------
 * An argType is obtained by taking the 'ClassInstance'.contructor.name or 'Class'.name.
 * Subscriptions are grouped together by argType and their evt takes an argument that is a
 * class with the constructor.name of argType.
 *
 */
class EventAggregator {
  subscribers: { [key: string]: Array<Subscription> }
  constructor () {
    // key - type, value - [] of functions that take a certain value depending on the type
    this.subscribers = {}
  }

  /** Subscribes a type of event.
   *
   * @param {String} argType - the type that this subscriber belongs too.
   * @param {Function} event - the event that takes the same args as all other events of the given type.
   */
  subscribe (argType: string, evt: Function) {
    const subscriber = new Subscription(this, evt, argType)

    if (argType in this.subscribers) {
      this.subscribers[argType].push(subscriber)
    } else {
      this.subscribers[argType] = [subscriber]
    }
  }

  /** Unsubscribes a given subscription.
   *
   * @param {Subscription} subscription
   */
  unsubscribe (subscription: Subscription) {
    if (subscription.argType in this.subscribers) {
      // filter out the subscription given from the subscribers dictionary
      const filtered = this.subscribers[subscription.argType].filter(function (sub) {
        return sub.id !== subscription.id
      })

      this.subscribers[subscription.argType] = filtered
    }
  }

  /** Publishes all subscribers that take arguments of a given type.
   *
   * @param {Object} args - a class that contains arguments for the event. Must be a class as subscribers are grouped by type.
   */
  publish (args: Object) {
    const argType = args.constructor.name

    if (argType in this.subscribers) {
      this.subscribers[argType].forEach((subscription) => {
        subscription.evt(args)
      })
    } else {
      console.error('no type found for publishing')
    }
  }

  clearSubscriptions () {
    this.subscribers = {}
  }
}

export default EventAggregator

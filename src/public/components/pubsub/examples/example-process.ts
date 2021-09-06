import EventAggregator from '../aggregator'
import ExampleEventArg from '../event-args/example-event-arg'

// because event aggregator is a global variable create script tag before any other script that uses it.

/** An example event.
 *
 * @param {ExampleEventArg} exampleEventArg
 */
function exampleEvent (exampleEventArg) {
  console.log(exampleEventArg)
}

const eventAggregator = (window as any).__INITIAL_DATA__ as EventAggregator
// subscribe event that will take in ExampleEventArg as an argument.
eventAggregator.subscribe(ExampleEventArg.name, exampleEvent)

// publish all events that take ExampleEventArg as an argument.
eventAggregator.publish(new ExampleEventArg(1, 2, 3))
eventAggregator.publish(new ExampleEventArg(66, 233, 122))

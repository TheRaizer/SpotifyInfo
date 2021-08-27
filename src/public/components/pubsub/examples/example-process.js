import EventAggregator from "../aggregator.js";
import ExampleEventArg from "../event-args/example-event-arg.js";

const eventAggregator = new EventAggregator();

/** An example event.
 *
 * @param {ExampleEventArg} exampleEventArg
 */
function exampleEvent(exampleEventArg) {
  console.log(exampleEventArg);
}

// subscribe event that will take in ExampleEventArg as an argument.
eventAggregator.subscribe(ExampleEventArg.name, exampleEvent);

// publish all events that take ExampleEventArg as an argument.
eventAggregator.publish(new ExampleEventArg(1, 2, 3));
eventAggregator.publish(new ExampleEventArg(66, 233, 122));

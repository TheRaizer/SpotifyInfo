import ExampleEventArg from "../event-args/example-event-arg.js";

// because event aggregator is a global variable create script tag before any other script that uses it.

/** An example event.
 *
 * @param {ExampleEventArg} exampleEventArg
 */
function exampleEvent(exampleEventArg) {
  console.log(exampleEventArg);
}

// subscribe event that will take in ExampleEventArg as an argument.
window.eventAggregator.subscribe(ExampleEventArg.name, exampleEvent);

// publish all events that take ExampleEventArg as an argument.
window.eventAggregator.publish(new ExampleEventArg(1, 2, 3));
window.eventAggregator.publish(new ExampleEventArg(66, 233, 122));

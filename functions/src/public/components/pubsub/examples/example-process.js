"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const example_event_arg_1 = __importDefault(require("../event-args/example-event-arg"));
// because event aggregator is a global variable create script tag before any other script that uses it.
/** An example event.
 *
 * @param {ExampleEventArg} exampleEventArg
 */
function exampleEvent(exampleEventArg) {
    console.log(exampleEventArg);
}
const eventAggregator = window.__INITIAL_DATA__;
// subscribe event that will take in ExampleEventArg as an argument.
eventAggregator.subscribe(example_event_arg_1.default.name, exampleEvent);
// publish all events that take ExampleEventArg as an argument.
eventAggregator.publish(new example_event_arg_1.default(1, 2, 3));
eventAggregator.publish(new example_event_arg_1.default(66, 233, 122));
//# sourceMappingURL=example-process.js.map
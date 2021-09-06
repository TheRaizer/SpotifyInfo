"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const example_event_arg_js_1 = __importDefault(require("../event-args/example-event-arg.js"));
// because event aggregator is a global variable create script tag before any other script that uses it.
/** An example event.
 *
 * @param {ExampleEventArg} exampleEventArg
 */
function exampleEvent(exampleEventArg) {
    console.log(exampleEventArg);
}
// subscribe event that will take in ExampleEventArg as an argument.
window.eventAggregator.subscribe(example_event_arg_js_1.default.name, exampleEvent);
// publish all events that take ExampleEventArg as an argument.
window.eventAggregator.publish(new example_event_arg_js_1.default(1, 2, 3));
window.eventAggregator.publish(new example_event_arg_js_1.default(66, 233, 122));

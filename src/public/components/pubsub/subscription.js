export default class Subscription {
  constructor(eventAggregator, evt, argType) {
    this.eventAggregator = eventAggregator;
    this.evt = evt;
    this.argType = argType;
    this.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

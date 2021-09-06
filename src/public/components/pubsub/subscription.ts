import EventAggregator from './aggregator'

export default class Subscription {
  eventAggregator: EventAggregator;
  evt: Function;
  argType: string;
  id: string;

  constructor (eventAggregator: EventAggregator, evt: Function, argType: string) {
    this.eventAggregator = eventAggregator
    this.evt = evt
    this.argType = argType
    this.id = Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

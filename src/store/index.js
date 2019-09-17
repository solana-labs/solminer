import { configure } from 'mobx';

configure({
  enforceActions: 'observed',
});

export { default as AppStore } from './app';
export { default as StatsStore } from './stats';

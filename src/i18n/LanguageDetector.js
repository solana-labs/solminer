import { app, remote } from 'electron';

export default {
  init: Function.prototype,
  type: 'languageDetector',
  detect: () => (app || remote.app).getLocale().split('-')[0],
  cacheUserLanguage: Function.prototype,
};

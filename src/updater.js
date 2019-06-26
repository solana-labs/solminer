import {autoUpdater} from 'electron';
import updateElectronApp from 'update-electron-app';
import log from 'electron-log';

try {
  updateElectronApp({
    logger: log,
    nagUser: false,
  });
} catch (err) {
  log.error(`Unable to enable updates: ${err}`);
}

// Replace the updateElectronApp handler with our own that updates immediately.
autoUpdater.on('update-downloaded', (...args) => {
  log('update-downloaded:', args);
  autoUpdater.quitAndInstall();
});

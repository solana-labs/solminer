import {app, ipcMain, BrowserWindow, Menu} from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import path from 'path';
import os from 'os';
import log from 'electron-log';
import './updater';
import {Replicator} from './replicator';
import {sleep} from './sleep';

// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) app.quit();

// Adjust app name when in dev mode (don't want 'Electron' as the app name)
app.setName('solminer');
app.setPath('userData', path.join(app.getPath('appData'), app.getName()));
log.info('userData:', app.getPath('userData'));

const isDevMode = process.execPath.match(/[\\/]electron/);
if (isDevMode) enableLiveReload({strategy: 'react-hmr'});

let mainWindow = null;
let shutdownInProgress = false;
let shutdownComplete = false;

function shutdown() {
  if (shutdownComplete) {
    console.log('shutdown: shutdownComplete');
    return true;
  }

  if (mainWindow) {
    if (shutdownInProgress) {
      console.log('shutdown: shutdownInProgress in progress');
      return false;
    }
    shutdownInProgress = true;

    ipcMain.on('replicator-stopped', () => {
      console.log('shutdown: renderer process signaled replicator-stopped');
      shutdownComplete = true;
      app.quit();
    });
    sleep(5000).then(async () => {
      console.log('shutdown: timeout waiting for replicator to stop');
      await Replicator.fkill(); // Fail-safe to ensure child processes are killed
      shutdownComplete = true;
      app.quit();
    });

    console.log('shutdown: signaling renderer process to stop-replicator');
    mainWindow.webContents.send('stop-replicator');
    return false;
  }

  console.log('shutdown: no mainWindow, quitting now');
  shutdownComplete = true;
  app.quit();
  return true;
}

app.on('ready', async () => {
  const devModeExtra = isDevMode ? 200 : 0;
  mainWindow = new BrowserWindow({
    width: 1000 + devModeExtra,
    height: 820,
    resizable: isDevMode,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  if (os.type() === 'Darwin') {
    // macOS Cut/Copy/Paste doesn't work with an Edit menu...
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'Solminer',
          submenu: [
            {
              label: 'Quit',
              accelerator: 'Command+Q',
              click: () => app.quit(),
            },
          ],
        },
        {
          label: 'Edit',
          submenu: [
            {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
            {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
            {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
          ],
        },
      ]),
    );
  }

  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', event => {
    console.log('mainWindow close');
    if (!shutdown()) {
      mainWindow.hide();
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    console.log('mainWindow closed');
    mainWindow = null;
  });
});

app.on('window-all-closed', event => {
  console.log('window-all-closed');
  if (!shutdown()) {
    event.preventDefault();
  }
});
app.on('before-quit', event => {
  console.log('before-quit');
  if (!shutdown()) {
    event.preventDefault();
  }
});
app.on('will-quit', () => {
  console.log('will-quit');
});
app.on('quit', () => {
  console.log('quit');
});

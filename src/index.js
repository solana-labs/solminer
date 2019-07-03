import {app, ipcMain, BrowserWindow, Menu} from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import path from 'path';
import log from 'electron-log';
import './updater';
import {sleep} from './sleep';

// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) app.quit();

// Adjust app name when in dev mode (don't want 'Electron' as the app name)
app.setName('solminer');
app.setPath('userData', path.join(app.getPath('appData'), app.getName()));
log.info('userData:', app.getPath('userData'));

const isDevMode = process.execPath.match(/[\\/]electron/);
if (isDevMode) enableLiveReload({strategy: 'react-hmr'});

let mainWindow;

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

  // Create the Application's main menu
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

  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  let closing = false;
  let closed = false;
  mainWindow.on('close', (event) => {
    if (closed || closing) {
      return;
    }
    closing = true;

    console.log('closing mainWindow...');
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
    ipcMain.on('replicator-stopped', () => {
      console.log('renderer process signaled replicator-stopped');
      closed = true;
      app.quit();
    });
    sleep(2000).then(() => {
      console.log('Timeout waiting for replicator to stop');
      closed = true;
      app.quit();
    });

    console.log('Signaling renderer process to stop-replicator');
    mainWindow.webContents.send('stop-replicator');
    event.preventDefault();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

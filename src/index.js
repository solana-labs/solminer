import {app, BrowserWindow} from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import path from 'path';
import log from 'electron-log';
import './updater';

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
  const devModeExtra = isDevMode ? 500 : 0;
  mainWindow = new BrowserWindow({
    width: 500 + devModeExtra,
    height: 500 + devModeExtra,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

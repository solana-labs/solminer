import {app, BrowserWindow} from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import updateElectronApp from 'update-electron-app';
import path from 'path';

// Adjust app name when in dev mode (don't want 'Electron' as the app name)
app.setName('solminer');
app.setPath('userData', path.join(app.getPath('appData'), app.getName()));

try {
  updateElectronApp();
} catch (err) {
  console.error(`Unable to enable updates: ${err}`);
}

const isDevMode = process.execPath.match(/[\\/]electron/);
if (isDevMode) enableLiveReload({strategy: 'react-hmr'});

let mainWindow;

app.on('ready', async () => {
  const devModeExtra = isDevMode ? 500 : 0;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500 + devModeExtra,
    height: 500 + devModeExtra,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

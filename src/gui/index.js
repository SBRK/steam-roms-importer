import { app, BrowserWindow, ipcMain } from 'electron';
import 'babel-polyfill';
import path from 'path';

import loadConsoles from '../service/console-loader';
//import findGridImages from '../service/grid-provider';
import { getUserConfigDirectory } from '../user-config';

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  global.USER_CONFIG_DIR = await getUserConfigDirectory();

  mainWindow = new BrowserWindow({
    //fullscreen: true,
    backgroundColor: '#ffffff',
  });
  mainWindow.loadURL(`file://${path.join(__dirname, 'interface', 'index.html')}`);
  //mainWindow.setFullScreen(true);
  //mainWindow.setMenu(null);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('getConsoles', async (event, requestId) => {
    try {
      const consoles = await loadConsoles();
      event.sender.send('getConsoles-callback', requestId, null, consoles);
    } catch (error) {
      event.sender.send('getConsoles-callback', requestId, error.toString());
    }
  });
});

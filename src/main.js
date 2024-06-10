const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
/**
 * @param options: { title:  String, defaultPath: String, buttonLabel: String, filters: area}
 * @param content: String
 * @returns Promise
 */
ipcMain.handle('saveFile', async (event, content, options) => {
  let path;
  try {
    const { filePath } =  await dialog.showSaveDialog(null, options);
    path = filePath;
  } catch(e) {
    return Promise.reject({error: e, success: false});
  }
  if(path) {
    try {
      fs.writeFileSync(path, content, 'utf-8');
      return Promise.resolve({error: null, success: true});
    } catch(e) {
      return Promise.reject({error: e, success: false});
    }
  } else {
    return Promise.reject({error: "Path wrong: " + path, success: false, canceled: true});
  }
});

ipcMain.handle('readFile', async (event, options) => {
  let path;
  try {
    const { filePaths } =  await dialog.showOpenDialog(null, options);
    path = filePaths[0];
  } catch(e) {
    return Promise.reject({error: e, success: false});
  }
  if(path) {
    try {
      return Promise.resolve({error: null, success: true, data: fs.readFileSync(path, 'utf-8')});
    } catch(e) {
      return Promise.reject({error: e, success: false});
    }
  } else {
    return Promise.reject({error: "Path wrong: " + path, success: false, canceled: true});
  }
});
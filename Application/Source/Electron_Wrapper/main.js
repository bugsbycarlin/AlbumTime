//
// This file contains the main entry point electron uses to run the program.
// It follows this format: https://www.electronjs.org/docs/tutorial/quick-start
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


// Modules to control application life and create native browser window
const { app, ipcMain, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const settings = require('electron-settings');

function createWindow () {
  // Create the browser window.
  settings.get('fullscreen.data').then(value => {

    let fullscreen = false;
    if (value != null) fullscreen = value;

    const mainWindow = new BrowserWindow({
      width: 1024,
      height: 798,
      fullscreen: false,
      backgroundColor: '#000000',
      resizable: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        enableRemoteModule: true,
        contextIsolation: false,
      }
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  // if (process.platform !=== 'darwin') app.quit()
  app.quit();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
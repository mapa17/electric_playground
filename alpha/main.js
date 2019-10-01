const electron = require('electron');
const url = require('url');
const path = require('path');
const axios = require("axios");
const fs = require('fs');
const FormData = require('form-data');

// ASIG API Running model inference
const MODEL_API_URL = "http://localhost:8000/upload";

// Some helper functions
const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production'

// Import stuff from electron?
const {app, BrowserWindow, Menu, ipcMain} = electron;

let MainWindow;
let AddItemWindow;

global.sharedObject = {
    //image_prediction: {'classes': [], 'scores': []}
    image_prediction: null
  }

app.on('ready', function(){
    MainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load HTML for mainWindow
    //MainWindow.loadURL(path.join('file://', __dirname, 'windows', 'mainWindow.html'));
    MainWindow.loadURL(path.join('file://', __dirname, 'windows', 'DancestyleClassifier.html'));
    MainWindow.on('closed', function(){
        app.quit();
      });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
});


function runModel(filename){

    var form = new FormData();
    const stream = fs.createReadStream(filename);
    form.append('file', stream);

    const formHeaders = form.getHeaders();

    axios.post(MODEL_API_URL, form, {headers: { ...formHeaders,},}).then(function (response) {
        //handle success
        //console.log(response);
        console.log('Send file to classifier!');

        // Make sure that the rendering process can access the results
        global.sharedObject.image_prediction = {'classes': response.data['classes'], 'scores': response.data['scores']};

        console.log('Classes: ' + response.data['classes'] + '\nPrediction: ' + response.data['scores']);
    })
    .catch(function (response) {
        //handle error
        console.log(response);
    });
}
  
ipcMain.on('image_classification', (event, filename) => {
    //event.sender.send('asynchronous-reply', 'pong')
    console.log(filename)
    runModel(filename);
  })

// Receive event + item from anywhere? and forward it to MainWindow
ipcMain.on('item:add', function(e, item){
    console.log(e);
    console.log(item);
    MainWindow.webContents.send('item:add', item);
    AddItemWindow.close();
});

function createAddItemWindow(){
    AddItemWindow = new BrowserWindow({
        title: 'Add new Item',
        width: 300,
        height: 200,
        webPreferences: {
            nodeIntegration: true
        }
    });
    AddItemWindow.loadURL(path.join('file://', __dirname, 'windows', 'AddItemWindow.html'));
}

const mainMenuTemplate = [
    //...(isMac ? [{label: 'Alpha', submenu:[{role: 'about'}]}] : []),
    ...(isMac ? [{role: 'appMenu'}] : []),
    {
        label: 'Filter',
        submenu: [
        {
          label: 'Add Item',
          accelerator: 'Shift+CmdOrCtrl+A',
          click() {
              createAddItemWindow();
          }
        },
        {
          //label: 'Quit', accelerator: 'CmdOrCtrl+Q', click(){app.quit()}
          role: 'quit'
        }
      ]
    },
    ...(isDev ? [
            {
                label: 'Developer Tools',
                submenu:[
                {role: 'reload'},
                {
                    label: 'Toggle DevTools',
                    accelerator: 'Shift+CmdOrCtrl+I',
                    click(item, focusedWindow){focusedWindow.toggleDevTools();}
                }
                ]
            }] : []),
];
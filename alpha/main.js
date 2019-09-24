const electron = require('electron');
const url = require('url');
const path = require('path');

// Some helper functions
const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production'

// Import stuff from electron?
const {app, BrowserWindow, Menu, ipcMain} = electron;

let MainWindow;
let AddItemWindow;

app.on('ready', function(){
    MainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load HTML for mainWindow
    MainWindow.loadURL(path.join('file://', __dirname, 'windows', 'mainWindow.html'));
    MainWindow.on('closed', function(){
        app.quit();
      });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);

});

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
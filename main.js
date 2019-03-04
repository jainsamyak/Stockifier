const { app, BrowserWindow } = require('electron')

let win

function createWindow() {

    win = new BrowserWindow({ width: 1200, height: 700 })
    let srcDir = "src/"
    win.loadFile(srcDir + 'index.html')


    win.webContents.openDevTools()


    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})


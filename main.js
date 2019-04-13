const { app, Tray, Menu, dialog, BrowserWindow } = require('electron')
const path = require('path')

let win

function createWindow() {

    win = new BrowserWindow({
        width: 1200, height: 700,
        icon: path.join(__dirname, 'res', 'Stockifier.png')
    })
    win.setMinimizable(false);
    let srcDir = "src/"
    win.loadFile(srcDir + 'index.html')

    /* App Tray */
    tray = new Tray(path.join(__dirname, 'res', 'TrayIcon.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Stockifier v1.0.0',
            enabled: false
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Show Window',
                    click() {
                        win.show()
                    }
                },
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'separator',
            type: 'separator'
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'quit',
            click() {
                app.quit()
            }
        }
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)

    win.on('close', (event) => {
        let choice = dialog.showMessageBox(win,
            {
                type: 'question',
                buttons: ['Yes', 'No'],
                title: 'Confirm',
                message: 'Do you really want to close the application?'
            }
        )
        if (choice === 1) {
            event.preventDefault()
            //win.hide()
            win.hide()
        } else {
            win.on('closed', () => {
                win = null;
                app.quit();
            })
        }

    })
}

app.on('ready', () => {
    createWindow()
    app.setAppUserModelId('com.samyak.Stockifier')
})
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


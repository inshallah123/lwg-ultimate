const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');

class AppUpdater {
  constructor() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    autoUpdater.on('checking-for-update', () => {
      console.log('正在检查更新...');
    });

    autoUpdater.on('update-available', (info) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}，是否立即下载？`,
        detail: info.releaseNotes ? info.releaseNotes.replace(/<[^>]*>/g, '') : '暂无更新说明',
        buttons: ['立即下载', '稍后提醒'],
        defaultId: 0,
        cancelId: 1
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    autoUpdater.on('update-not-available', () => {
      console.log('当前版本已是最新版本');
    });

    autoUpdater.on('error', (err) => {
      console.error('更新出错:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('download-progress', {
          bytesPerSecond: progressObj.bytesPerSecond,
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }
    });

    autoUpdater.on('update-downloaded', () => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '更新已下载',
        message: '更新已下载完成，是否立即重启应用？',
        buttons: ['立即重启', '稍后重启'],
        defaultId: 0,
        cancelId: 1
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }

  checkForUpdates() {
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }

  setFeedURL(url) {
    autoUpdater.setFeedURL(url);
  }
}

module.exports = AppUpdater;
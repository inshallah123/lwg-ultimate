const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

class AppUpdater {
  constructor() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    this.isManualCheck = false;
    
    // 配置代理（如果有）
    this.configureProxy();
    this.setupEventListeners();
  }
  
  configureProxy() {
    try {
      const configPath = path.join(process.cwd(), 'mirror.config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        
        // 如果配置了 GitHub 代理
        if (config.githubProxy) {
          process.env.https_proxy = config.githubProxy;
          process.env.http_proxy = config.githubProxy;
          console.log(`已配置更新代理: ${config.githubProxy}`);
        }
      }
    } catch (error) {
      console.log('未配置代理，使用直连');
    }
  }
  
  setProxy(proxyUrl) {
    if (proxyUrl) {
      process.env.https_proxy = proxyUrl;
      process.env.http_proxy = proxyUrl;
      console.log(`已设置更新代理: ${proxyUrl}`);
    } else {
      delete process.env.https_proxy;
      delete process.env.http_proxy;
      console.log('已清除更新代理设置');
    }
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
      
      // 如果是手动检查，显示提示
      if (this.isManualCheck) {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '检查更新',
            message: '当前已是最新版本',
            buttons: ['确定']
          });
        }
        this.isManualCheck = false;
      }
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
      
      // 通知渲染进程下载完成
      if (mainWindow) {
        mainWindow.webContents.send('update-downloaded');
      }
      
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
  
  async checkForUpdatesManually() {
    this.isManualCheck = true;
    try {
      const result = await autoUpdater.checkForUpdates();
      return result;
    } catch (error) {
      this.isManualCheck = false;
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        dialog.showMessageBox(mainWindow, {
          type: 'error',
          title: '检查更新失败',
          message: '无法连接到更新服务器',
          detail: error.message || '请检查网络连接或代理设置',
          buttons: ['确定']
        });
      }
      throw error;
    }
  }

  setFeedURL(url) {
    autoUpdater.setFeedURL(url);
  }
}

module.exports = AppUpdater;
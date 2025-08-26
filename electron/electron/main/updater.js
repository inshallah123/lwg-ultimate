const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

class AppUpdater {
  constructor(getMainWindow) {
    // 重要：在任何检查之前设置这些属性
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // 启用日志
    autoUpdater.logger = require('electron-log');
    autoUpdater.logger.transports.file.level = 'info';
    console.log('AutoUpdater initialized with autoInstallOnAppQuit:', autoUpdater.autoInstallOnAppQuit);
    
    this.isManualCheck = false;
    this.getMainWindow = getMainWindow || (() => BrowserWindow.getAllWindows()[0]);
    this.updateDownloaded = false;
    
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
      const mainWindow = this.getMainWindow();
      
      if (!mainWindow) {
        console.error('无法获取主窗口，无法显示更新提示');
        return;
      }
      
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
        const mainWindow = this.getMainWindow();
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
      const mainWindow = this.getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('download-progress', {
          bytesPerSecond: progressObj.bytesPerSecond,
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('更新已下载:', info);
      this.updateDownloaded = true;
      
      const mainWindow = this.getMainWindow();
      
      // 通知渲染进程下载完成
      if (mainWindow) {
        mainWindow.webContents.send('update-downloaded');
        
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: '更新已下载',
          message: '更新已下载完成，是否立即重启应用？',
          detail: `新版本 ${info.version} 已下载完成。选择"立即重启"将安装更新，选择"稍后重启"将在下次启动时自动安装。`,
          buttons: ['立即重启', '稍后重启'],
          defaultId: 0,
          cancelId: 1
        }).then(result => {
          if (result.response === 0) {
            console.log('用户选择立即安装更新');
            autoUpdater.quitAndInstall(false, true);
          } else {
            console.log('用户选择稍后安装，将在退出时自动安装');
            // 确保 autoInstallOnAppQuit 为 true
            autoUpdater.autoInstallOnAppQuit = true;
          }
        });
      } else {
        console.error('无法获取主窗口，无法显示更新安装提示');
        // 即使没有窗口，也确保退出时会安装
        autoUpdater.autoInstallOnAppQuit = true;
      }
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
      const mainWindow = this.getMainWindow();
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
  
  isUpdateDownloaded() {
    return this.updateDownloaded;
  }
  
  forceInstallUpdate() {
    if (this.updateDownloaded) {
      console.log('强制安装已下载的更新');
      autoUpdater.quitAndInstall(false, true);
    }
  }
}

module.exports = AppUpdater;
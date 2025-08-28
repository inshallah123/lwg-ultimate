const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

class AppUpdater {
  private autoUpdater: any;
  private isManualCheck: boolean;
  private getMainWindow: () => any;
  private updateDownloaded: boolean;

  constructor(getMainWindow?: () => any) {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
    
    if (process.platform === 'win32') {
      process.env.ELECTRON_UPDATER_ALLOW_DIFFERENTIAL = 'false';
    }
    
    autoUpdater.forceDevUpdateConfig = false;
    autoUpdater.allowUnverifiedSignatures = true;
    
    const log = require('electron-log');
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    
    this.autoUpdater = autoUpdater;
    this.isManualCheck = false;
    this.getMainWindow = getMainWindow || (() => BrowserWindow.getAllWindows()[0]);
    this.updateDownloaded = false;
    
    this.configureProxy();
    this.setupEventListeners();
  }
  
  configureProxy() {
    try {
      const configPath = path.join(process.cwd(), 'mirror.config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        
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
  
  setProxy(proxyUrl: string) {
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

    autoUpdater.on('update-available', (info: any) => {
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
      }).then((result: any) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    autoUpdater.on('update-not-available', () => {
      console.log('当前版本已是最新版本');
      
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

    autoUpdater.on('error', (err: Error) => {
      console.error('更新出错:', err);
      
      if (this.isManualCheck) {
        const mainWindow = this.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: '更新错误',
            message: '检查更新时出现错误',
            detail: err.message || '请检查网络连接后重试',
            buttons: ['确定']
          });
        }
        this.isManualCheck = false;
      }
    });

    autoUpdater.on('download-progress', (progressObj: any) => {
      const mainWindow = this.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('download-progress', {
          bytesPerSecond: progressObj.bytesPerSecond,
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }
    });

    autoUpdater.on('update-downloaded', (info: any) => {
      this.updateDownloaded = true;
      
      const mainWindow = this.getMainWindow();
      console.log('主窗口状态:', mainWindow ? '存在' : '不存在');
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-downloaded');
        
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: '更新已下载',
          message: '更新已下载完成，是否立即重启应用？',
          detail: `新版本 ${info.version} 已下载完成。选择"立即重启"将安装更新，选择"稍后重启"将在下次启动时自动安装。`,
          buttons: ['立即重启', '稍后重启'],
          defaultId: 0,
          cancelId: 1
        }).then((result: any) => {
          if (result.response === 0) {
            console.log('用户选择立即安装更新');
            try {
              autoUpdater.quitAndInstall(false, true);
            } catch (error) {
              console.error('安装更新时出错:', error);
              dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: '安装失败',
                message: '无法安装更新',
                detail: '请手动重启应用以完成更新安装',
                buttons: ['确定']
              });
            }
          } else {
            console.log('用户选择稍后安装，将在退出时自动安装');
            autoUpdater.autoInstallOnAppQuit = true;
          }
        });
      } else {
        console.error('无法获取主窗口，无法显示更新安装提示');
        autoUpdater.autoInstallOnAppQuit = true;
      }
    });
  }

  checkForUpdates() {
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdates().catch((err: Error) => {
        console.error('自动检查更新失败:', err);
      });
    }
  }
  
  async checkForUpdatesManually() {
    this.isManualCheck = true;
    try {
      const result = await autoUpdater.checkForUpdates();
      return result;
    } catch (error: any) {
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

  setFeedURL(url: string) {
    autoUpdater.setFeedURL(url);
  }
  
  isUpdateDownloaded() {
    return this.updateDownloaded;
  }
  
  forceInstallUpdate() {
    if (this.updateDownloaded) {
      autoUpdater.quitAndInstall(false, true);
    }
  }
}

module.exports = AppUpdater;
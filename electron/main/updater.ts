import { autoUpdater, UpdateInfo, ProgressInfo, UpdateCheckResult } from 'electron-updater';
import { dialog, BrowserWindow, MessageBoxReturnValue } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as log from 'electron-log';

interface ProxyConfig {
  githubProxy?: string;
}

// 扩展 autoUpdater 类型以包含可能存在的属性
interface ExtendedAutoUpdater {
  allowUnverifiedSignatures?: boolean;
}

class AppUpdater {
  private isManualCheck = false;
  private readonly getMainWindow: () => BrowserWindow | null;
  private updateDownloaded = false;

  constructor(getMainWindow?: () => BrowserWindow | null) {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
    
    if (process.platform === 'win32') {
      process.env.ELECTRON_UPDATER_ALLOW_DIFFERENTIAL = 'false';
    }
    
    // allowUnverifiedSignatures 可能在某些版本中不存在
    if ('allowUnverifiedSignatures' in autoUpdater) {
      (autoUpdater as unknown as ExtendedAutoUpdater).allowUnverifiedSignatures = true;
    }
    
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    
    this.getMainWindow = getMainWindow || (() => BrowserWindow.getAllWindows()[0]);
    
    this.configureProxy();
    this.setupEventListeners();
  }
  
  private getValidMainWindow(): BrowserWindow | null {
    const mainWindow = this.getMainWindow();
    return mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
  }
  
  private async showDialog(
    type: 'info' | 'error',
    title: string,
    message: string,
    detail?: string,
    buttons: string[] = ['确定']
  ): Promise<MessageBoxReturnValue | null> {
    const mainWindow = this.getValidMainWindow();
    if (!mainWindow) return null;
    
    return dialog.showMessageBox(mainWindow, {
      type,
      title,
      message,
      detail,
      buttons
    });
  }
  
  private applyProxy(proxyUrl?: string): void {
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
  
  configureProxy(): void {
    try {
      const configPath = path.join(process.cwd(), 'mirror.config.json');
      if (fs.existsSync(configPath)) {
        const config: ProxyConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.githubProxy) {
          this.applyProxy(config.githubProxy);
        }
      }
    } catch {
      console.log('未配置代理，使用直连');
    }
  }
  
  setProxy(proxyUrl: string | null): void {
    this.applyProxy(proxyUrl || undefined);
  }

  private setupEventListeners(): void {
    autoUpdater.on('checking-for-update', () => {
      console.log('正在检查更新...');
    });

    autoUpdater.on('update-available', async (info: UpdateInfo) => {
      const result = await this.showDialog(
        'info',
        '发现新版本',
        `发现新版本 ${info.version}，是否立即下载？`,
        info.releaseNotes ? String(info.releaseNotes).replace(/<[^>]*>/g, '') : '暂无更新说明',
        ['立即下载', '稍后提醒']
      );
      
      if (result?.response === 0) {
        await autoUpdater.downloadUpdate();
      }
    });

    autoUpdater.on('update-not-available', async () => {
      console.log('当前版本已是最新版本');
      
      if (this.isManualCheck) {
        await this.showDialog('info', '检查更新', '当前已是最新版本');
        this.isManualCheck = false;
      }
    });

    autoUpdater.on('error', async (err: Error) => {
      console.error('更新出错:', err);
      
      if (this.isManualCheck) {
        await this.showDialog(
          'error',
          '更新错误',
          '检查更新时出现错误',
          err.message || '请检查网络连接后重试'
        );
        this.isManualCheck = false;
      }
    });

    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
      const mainWindow = this.getValidMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('download-progress', {
          bytesPerSecond: progressObj.bytesPerSecond,
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }
    });

    autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
      this.updateDownloaded = true;
      
      const mainWindow = this.getValidMainWindow();
      if (!mainWindow) {
        console.error('无法获取主窗口，无法显示更新安装提示');
        return;
      }
      
      mainWindow.webContents.send('update-downloaded');
      
      const result = await this.showDialog(
        'info',
        '更新已下载',
        '更新已下载完成，是否立即重启应用？',
        `新版本 ${info.version} 已下载完成。选择"立即重启"将安装更新，选择"稍后重启"将在下次启动时自动安装。`,
        ['立即重启', '稍后重启']
      );
      
      if (result?.response === 0) {
        console.log('用户选择立即安装更新');
        try {
          autoUpdater.quitAndInstall(false, true);
        } catch (error) {
          console.error('安装更新时出错:', error);
          await this.showDialog(
            'error',
            '安装失败',
            '无法安装更新',
            '请手动重启应用以完成更新安装'
          );
        }
      } else {
        console.log('用户选择稍后安装，将在退出时自动安装');
      }
    });
  }

  checkForUpdates(): void {
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdates().catch((err: Error) => {
        console.error('自动检查更新失败:', err);
      });
    }
  }
  
  async checkForUpdatesManually(): Promise<UpdateCheckResult | null> {
    this.isManualCheck = true;
    try {
      const result = await autoUpdater.checkForUpdates();
      this.isManualCheck = false;
      return result;
    } catch (error) {
      this.isManualCheck = false;
      
      await this.showDialog(
        'error',
        '检查更新失败',
        '无法连接到更新服务器',
        error instanceof Error ? error.message : '请检查网络连接或代理设置'
      );
      
      throw error;
    }
  }
  setFeedURL(config: Parameters<typeof autoUpdater.setFeedURL>[0]): void {
    autoUpdater.setFeedURL(config);
  }
  
  isUpdateDownloaded(): boolean {
    return this.updateDownloaded;
  }
}

export default AppUpdater;
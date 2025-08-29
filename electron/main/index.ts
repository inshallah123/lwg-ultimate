import {app, BrowserWindow, dialog, ipcMain, Menu} from 'electron';
import {join} from 'path';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {checkLunarLibraryUpdate, updateLunarLibrary} from '../utils/checkUpdates';
import EventDatabase from './eventDatabase';
import ThemeDatabase from './themeDatabase';
import {Event} from '../../src/types/event';
import updateConfig from '../utils/updateConfig';
import AppUpdater from './updater';

let mainWindow: BrowserWindow | null = null;
let eventDb: EventDatabase | null = null;
let dbInitPromise: Promise<EventDatabase | null> | null = null;
let themeDb: ThemeDatabase | null = null;
let themeDbInitPromise: Promise<ThemeDatabase | null> | null = null;
interface AppUpdaterInterface {
  isUpdateDownloaded: () => boolean;
  checkForUpdates: () => void;
// eslint-disable-next-line
  checkForUpdatesManually: () => Promise<any>;
  setProxy: (proxy: string | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFeedURL: (config: any) => void;
  autoUpdater?: {
    autoInstallOnAppQuit: boolean;
  };
}

let appUpdater: AppUpdaterInterface | null = null; // 更新管理器实例

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 当尝试运行第二个实例时，聚焦到第一个实例的窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function getWindowState() {
  const stateFile = join(app.getPath('userData'), 'windowState.json');
  if (existsSync(stateFile)) {
    try {
      return JSON.parse(readFileSync(stateFile, 'utf8'));
    } catch {
      return { width: 1000, height: 800 };
    }
  }
  return { width: 1000, height: 800 };
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const bounds = mainWindow.getBounds();
    const stateFile = join(app.getPath('userData'), 'windowState.json');
    writeFileSync(stateFile, JSON.stringify(bounds));
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}

function createCustomMenu() {
  const poem = `Time's White Goose

Through morning mist and twilight's glow,
A white goose glides where rivers flow.
Each ripple marks a moment passed,
While feathers hold what cannot last.

She watches seasons come and go,
Spring blossoms fall to winter snow.
Her wings have carried countless days,
Through golden dawns and purple haze.

Time whispers secrets in her flight,
Between the darkness and the light.
Each honk a bell that softly chimes,
To mark the passage of our times.

Yet graceful still, she swims along,
Her presence like an ancient song.
For time and geese both understand:
Life flows like water through our hands.`;

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'What about...?',
      submenu: [
        {
          label: 'Time\'s White Goose',
          click: () => {
            if (mainWindow) {
              void dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'What about...?',
                message: 'Time\'s White Goose',
                detail: poem,
                buttons: ['Close'],
                noLink: true
              });
            }
          }
        }
      ]
    },
    {
      label: '更新',
      submenu: [
        {
          label: '检查更新',
          click: async () => {
            if (!appUpdater) {
              await dialog.showMessageBox(mainWindow!, {
                  type: 'info',
                  title: '检查更新',
                  message: '开发模式下无法检查更新',
                  buttons: ['确定']
              });
              return;
            }
            
            // 手动检查更新
            const result = await appUpdater.checkForUpdatesManually();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!result || !(result as any).updateInfo) {
              await dialog.showMessageBox(mainWindow!, {
                  type: 'info',
                  title: '检查更新',
                  message: '当前已是最新版本',
                  buttons: ['确定']
              });
            }
          }
        },
        {
          label: '配置代理',
          click: async () => {
            if (!mainWindow) return;
            
            const config = updateConfig.getConfig();
            const proxyEnabled = config.proxy?.enabled || false;
            const proxyHost = config.proxy?.host || '127.0.0.1';
            const proxyPort = config.proxy?.port || 7890;
            
            const result = await dialog.showMessageBox(mainWindow, {
              type: 'question',
              title: '配置更新代理',
              message: '配置GitHub更新代理',
              detail: `当前设置:\n代理状态: ${proxyEnabled ? '已启用' : '已禁用'}\n代理地址: ${proxyHost}:${proxyPort}\n\n是否要修改代理设置？`,
              buttons: ['取消', '禁用代理', '启用代理', '自定义设置'],
              defaultId: 0,
              cancelId: 0
            });
            
            if (result.response === 0) {
              return; // 用户取消
            } else if (result.response === 1) {
              // 禁用代理
              updateConfig.setProxy(false);
              await dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: '配置成功',
                  message: '代理已禁用',
                  buttons: ['确定']
              });
              
              // 更新 updater 配置
              if (appUpdater) {
                appUpdater.setProxy(null);
              }
            } else if (result.response === 2) {
              // 启用代理（使用当前设置）
              updateConfig.setProxy(true);
              await dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: '配置成功',
                  message: `代理已启用: ${proxyHost}:${proxyPort}`,
                  buttons: ['确定']
              });
              
              // 更新 updater 配置
              if (appUpdater) {
                appUpdater.setProxy(updateConfig.getProxyUrl() || null);
              }
            } else if (result.response === 3) {
              // 自定义设置
              mainWindow.webContents.send('show-proxy-config', {
                enabled: proxyEnabled,
                host: proxyHost,
                port: proxyPort
              });
            }
          }
        },
        { type: 'separator' },
        {
          label: '关于更新',
          click: () => {
            if (mainWindow) {
              const version = app.getVersion();
              void dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '关于更新',
                message: `当前版本: v${version}`,
                detail: '本应用使用GitHub Release进行版本更新。\n\n如果您在中国大陆，可能需要配置代理以访问GitHub。\n\n更新源: github.com/inshallah123/lwg-ultimate',
                buttons: ['确定'],
                noLink: true
              });
            }
          }
        }
      ]
    },
    {
      label: '调色',
      submenu: [
        {
          label: '打开调色板',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-theme-palette');
            }
          }
        },
        { type: 'separator' },
        {
          label: '主题选择',
          click: async () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-theme-selector');
            }
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  try {
    const state = getWindowState();
    mainWindow = new BrowserWindow({
      width: state.width,
      height: state.height,
      x: state.x,
      y: state.y,
      icon: join(__dirname, '../../../build/icons/icon.ico'), // 设置窗口图标
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/index.js')
      }
    });

    mainWindow.on('close', () => {
      saveWindowState();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // 注册 F12 快捷键来打开开发者工具
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12') {
        mainWindow?.webContents.toggleDevTools();
        event.preventDefault();
      }
    });

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const devPort = process.env.DEV_PORT || '5173'; // 开发端口
    
    if (isDev) {
      mainWindow.loadURL(`http://localhost:${devPort}`).catch(console.error); // 加载开发服务器(如Vite)，服务器会渲染包含App.tsx的页面
    } else {
      // 生产环境下，从app.asar包的根目录加载dist/index.html
      mainWindow.loadFile(join(__dirname, '../../../dist/index.html')).catch(console.error);
    }
    
    // 页面加载完成后，发送主题配置
    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        const configPath = join(app.getPath('userData'), 'themeConfig.json');
        if (existsSync(configPath)) {
          const config = JSON.parse(readFileSync(configPath, 'utf8'));
          mainWindow?.webContents.send('apply-saved-theme', config);
        }
      } catch (error) {
        console.error('Failed to send theme config:', error);
      }
    });
  } catch (error) {
    console.error('Failed to create window:', error);
  }
}

// 初始化数据库的异步函数
async function initDatabase(): Promise<EventDatabase | null> {
  if (eventDb) return eventDb;
  if (dbInitPromise) return dbInitPromise;
  
  dbInitPromise = new Promise((resolve) => {
    (async () => {
      try {
        // 等待app准备好
        if (!app.isReady()) {
          await app.whenReady();
        }
        eventDb = new EventDatabase();
        await eventDb.initialize();
        resolve(eventDb);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // 即使失败也要resolve，避免promise永远pending
        resolve(null);
      }
    })();
  });
  
  return dbInitPromise;
}

// 初始化主题数据库的异步函数
async function initThemeDatabase(): Promise<ThemeDatabase | null> {
  if (themeDb) return themeDb;
  if (themeDbInitPromise) return themeDbInitPromise;
  
  themeDbInitPromise = new Promise((resolve) => {
    (async () => {
      try {
        // 等待app准备好
        if (!app.isReady()) {
          await app.whenReady();
        }
        themeDb = new ThemeDatabase();
        await themeDb.initialize();
        resolve(themeDb);
      } catch (error) {
        console.error('Failed to initialize theme database:', error);
        // 即使失败也要resolve，避免promise永远pending
        resolve(null);
      }
    })();
  });
  
  return themeDbInitPromise;
}

app.whenReady().then(async () => {
  // 应用准备好后初始化数据库
  await initDatabase();
  await initThemeDatabase();
  createCustomMenu();
  createWindow();
  
  // 初始化应用自动更新
  if (!app.isPackaged) {
    console.log('开发模式，跳过自动更新');
    console.log('版本:', app.getVersion());
  } else {
    appUpdater = new AppUpdater(() => mainWindow);
    // 配置GitHub更新地址
    appUpdater!.setFeedURL({
      provider: 'github',
      owner: 'inshallah123',
      repo: 'lwg-ultimate'
    });
    
    // 设置代理（如果已配置）
    const proxyUrl = updateConfig.getProxyUrl();
    if (proxyUrl && appUpdater) {
      appUpdater.setProxy(proxyUrl);
    }
    
    // 延迟检查应用更新
    const config = updateConfig.getConfig();
    if (config.autoCheck !== false) {
      setTimeout(() => {
        appUpdater!.checkForUpdates();
      }, 3000);
    }
  }
  
  // 延迟5秒后检查更新，避免影响启动速度
  setTimeout(async () => {
    const updateInfo = await checkLunarLibraryUpdate();
    
    if (updateInfo?.hasUpdate && mainWindow) {
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '节假日数据更新',
        message: `发现 lunar-javascript 新版本`,
        detail: `当前版本: ${updateInfo.currentVersion}\n最新版本: ${updateInfo.latestVersion}\n\n更新后将获得最新的节假日和调休数据。是否现在更新？`,
        buttons: ['稍后提醒', '立即更新'],
        defaultId: 1,
        cancelId: 0
      });
      
      if (result.response === 1) {
        // 用户选择更新
          await dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '正在更新',
              message: '正在更新节假日数据库...',
              buttons: []
          });

          const success = await updateLunarLibrary();

          if (success) {
              const restartResult = await dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: '更新完成',
                  message: '节假日数据已更新到最新版本',
                  detail: '需要重启应用以加载新的数据。是否现在重启？',
                  buttons: ['稍后', '立即重启'],
                  defaultId: 1
              });

              if (restartResult.response === 1) {
                  app.relaunch();
                  app.exit();
              }
          } else {
              await dialog.showMessageBox(mainWindow, {
                  type: 'error',
                  title: '更新失败',
                  message: '节假日数据更新失败',
                  detail: '请检查网络连接或稍后重试'
              });
          }
      }

    }
  }, 5000);
});

app.on('window-all-closed', () => {
  app.quit();
});


app.on('before-quit', (_event) => {
  // 检查是否有已下载的更新需要安装
  if (appUpdater && appUpdater.isUpdateDownloaded()) {
    console.log('应用退出时检测到已下载的更新，准备安装...');
    // 确保autoInstallOnAppQuit为true
    if (appUpdater.autoUpdater) {
      appUpdater.autoUpdater.autoInstallOnAppQuit = true;
    }
  }
  
  if (mainWindow) {
    mainWindow.removeAllListeners();
  }
  if (eventDb) {
    eventDb.close();
  }
  if (themeDb) {
    themeDb.close();
  }
});

// IPC通信处理
ipcMain.handle('db:getAllEvents', async () => {
  // 确保数据库已初始化
  const db = await initDatabase();
  if (!db) {
    console.error('Database not available');
    return [];
  }
  
  try {
    return db.getAllEvents();
  } catch (error) {
    console.error('Error getting events from database:', error);
    return [];
  }
});

ipcMain.handle('db:addEvent', async (_, event: Event) => {
  const db = await initDatabase();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.addEvent(event);
});

ipcMain.handle('db:updateEvent', async (_, event: Event) => {
  const db = await initDatabase();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.updateEvent(event);
});

ipcMain.handle('db:deleteEvent', async (_, id: string) => {
  const db = await initDatabase();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.deleteEvent(id);
});

ipcMain.handle('db:syncEvents', async (_, events: Event[]) => {
  const db = await initDatabase();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.syncEvents(events);
});

// 更新配置相关的IPC处理
ipcMain.handle('update:getConfig', () => {
  return updateConfig.getConfig();
});

ipcMain.handle('update:setProxy', (_, enabled: boolean, host?: string, port?: number) => {
  updateConfig.setProxy(enabled, host, port);
  
  // 更新 updater 配置
  if (appUpdater) {
    const proxyUrl = enabled ? (updateConfig.getProxyUrl() || null) : null;
    appUpdater.setProxy(proxyUrl);
  }
  
  return { success: true };
});

ipcMain.handle('update:checkNow', async () => {
  if (!appUpdater) {
    return { error: '开发模式下无法检查更新' };
  }
  
  try {
      return await appUpdater.checkForUpdatesManually();
  } catch (error) {
    return { error: (error as Error).message };
  }
});

// 主题相关的IPC处理
ipcMain.handle('theme:save', async (_, theme) => {
  const db = await initThemeDatabase();
  if (!db) {
    return { success: false, error: 'Theme database not available' };
  }
  const success = db.saveTheme(theme);
  return { success };
});

ipcMain.handle('theme:load', async (_, name: string) => {
  const db = await initThemeDatabase();
  if (!db) {
    return { success: false, error: 'Theme database not available' };
  }
  const theme = db.loadTheme(name);
  return theme ? { success: true, theme } : { success: false, error: '主题不存在' };
});

ipcMain.handle('theme:list', async () => {
  const db = await initThemeDatabase();
  if (!db) {
    return { success: false, error: 'Theme database not available' };
  }
  const themes = db.getThemeList();
  return { success: true, themes };
});

ipcMain.handle('theme:delete', async (_, name: string) => {
  const db = await initThemeDatabase();
  if (!db) {
    return { success: false, error: 'Theme database not available' };
  }
  const success = db.deleteTheme(name);
  return { success };
});

// 获取当前选中的默认主题
ipcMain.handle('theme:getCurrentTheme', async () => {
  try {
    const configPath = join(app.getPath('userData'), 'themeConfig.json');
    if (existsSync(configPath)) {
        return JSON.parse(readFileSync(configPath, 'utf8'));
    }
    return { themeName: '默认主题' };
  } catch (error) {
    console.error('Failed to load theme config:', error);
    return { themeName: '默认主题' };
  }
});

// 设置默认主题
ipcMain.handle('theme:setDefaultTheme', async (_, themeName: string) => {
  try {
    const configPath = join(app.getPath('userData'), 'themeConfig.json');
    const config = { themeName, updatedAt: new Date().toISOString() };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Failed to save theme config:', error);
    return { success: false, error: (error as Error).message };
  }
});
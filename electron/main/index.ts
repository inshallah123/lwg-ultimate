/**
 * Electron主进程入口文件
 * 作用: 管理桌面应用的生命周期、创建和控制窗口、处理系统级操作
 * 运行环境: Node.js环境(主进程)
 * 
 * 信息流:
 *   1. 应用启动 -> 读取窗口状态配置
 *   2. 创建BrowserWindow -> 加载React应用内容
 *   3. 开发环境: loadURL(http://localhost:5173) -> Vite开发服务器 -> src/main.tsx
 *   4. 生产环境: loadFile(dist/index.html) -> 打包后的React应用
 *   5. 窗口事件 -> 保存窗口状态、内存清理
 *   6. 应用退出 -> 清理资源
 * 
 * 与其他文件关系:
 *   - 加载 src/main.tsx (通过HTML)
 *   - 读写 windowState.json (窗口状态持久化)
 *   - 配合 vite.config.ts (开发服务器配置)
 *   - 使用 .env (环境变量配置)
 */
import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { platform } from 'os';
import { checkLunarLibraryUpdate, updateLunarLibrary } from '../utils/checkUpdates';
import EventDatabase from './database';
import { Event } from '../../src/types/event';
const AppUpdater = require('./updater');

let mainWindow: BrowserWindow | null = null;
let eventDb: EventDatabase | null = null;
let dbInitPromise: Promise<EventDatabase | null> | null = null;
let appUpdater: any = null;

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
              dialog.showMessageBox(mainWindow, {
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
  } catch (error) {
    console.error('Failed to create window:', error);
  }
}

// 初始化数据库的异步函数
async function initDatabase(): Promise<EventDatabase | null> {
  if (eventDb) return eventDb;
  if (dbInitPromise) return dbInitPromise;
  
  dbInitPromise = new Promise(async (resolve) => {
    try {
      // 等待app准备好
      if (!app.isReady()) {
        await app.whenReady();
      }
      eventDb = new EventDatabase();
      await eventDb.initialize();
      console.log('Database initialized successfully');
      resolve(eventDb);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // 即使失败也要resolve，避免promise永远pending
      resolve(null);
    }
  });
  
  return dbInitPromise;
}

app.whenReady().then(async () => {
  // 应用准备好后初始化数据库
  await initDatabase();
  createCustomMenu();
  createWindow();
  
  // 初始化应用自动更新
  if (!app.isPackaged) {
    console.log('开发模式，跳过自动更新');
  } else {
    appUpdater = new AppUpdater();
    // 配置GitHub更新地址
    appUpdater.setFeedURL({
      provider: 'github',
      owner: 'inshallah123',
      repo: 'lwg-ultimate'
    });
    // 延迟检查应用更新
    setTimeout(() => {
      appUpdater.checkForUpdates();
    }, 3000);
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
  if (platform() !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners();
  }
  if (eventDb) {
    eventDb.close();
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
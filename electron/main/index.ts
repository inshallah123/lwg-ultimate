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
import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { platform } from 'os';

let mainWindow: BrowserWindow | null = null;

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

function createWindow() {
  try {
    const state = getWindowState();
    mainWindow = new BrowserWindow({
      width: state.width,
      height: state.height,
      x: state.x,
      y: state.y,
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

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const devPort = process.env.DEV_PORT || '5173'; // 开发端口
    
    if (isDev) {
      mainWindow.loadURL(`http://localhost:${devPort}`).catch(console.error); // 加载开发服务器(如Vite)，服务器会渲染包含App.tsx的页面
    } else {
      mainWindow.loadFile(join(__dirname, '../../dist/index.html')).catch(console.error);
    }
  } catch (error) {
    console.error('Failed to create window:', error);
  }
}

app.whenReady().then(createWindow);

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
});
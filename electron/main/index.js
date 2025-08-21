"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
let mainWindow = null;
// 确保只有一个实例运行
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        // 当尝试运行第二个实例时，聚焦到第一个实例的窗口
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
}
function getWindowState() {
    const stateFile = (0, path_1.join)(electron_1.app.getPath('userData'), 'windowState.json');
    if ((0, fs_1.existsSync)(stateFile)) {
        try {
            return JSON.parse((0, fs_1.readFileSync)(stateFile, 'utf8'));
        }
        catch {
            return { width: 1000, height: 800 };
        }
    }
    return { width: 1000, height: 800 };
}
function saveWindowState() {
    if (!mainWindow || mainWindow.isDestroyed())
        return;
    try {
        const bounds = mainWindow.getBounds();
        const stateFile = (0, path_1.join)(electron_1.app.getPath('userData'), 'windowState.json');
        (0, fs_1.writeFileSync)(stateFile, JSON.stringify(bounds));
    }
    catch (error) {
        console.error('Failed to save window state:', error);
    }
}
function createWindow() {
    try {
        const state = getWindowState();
        mainWindow = new electron_1.BrowserWindow({
            width: state.width,
            height: state.height,
            x: state.x,
            y: state.y,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: (0, path_1.join)(__dirname, '../preload/index.js')
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
        const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
        const devPort = process.env.DEV_PORT || '5173'; // 开发端口
        if (isDev) {
            mainWindow.loadURL(`http://localhost:${devPort}`).catch(console.error); // 加载开发服务器(如Vite)，服务器会渲染包含App.tsx的页面
        }
        else {
            mainWindow.loadFile((0, path_1.join)(__dirname, '../../dist/index.html')).catch(console.error);
        }
    }
    catch (error) {
        console.error('Failed to create window:', error);
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if ((0, os_1.platform)() !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.app.on('before-quit', () => {
    if (mainWindow) {
        mainWindow.removeAllListeners();
    }
});
//# sourceMappingURL=index.js.map
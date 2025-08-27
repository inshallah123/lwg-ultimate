"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const checkUpdates_1 = require("../utils/checkUpdates");
const database_1 = __importDefault(require("./database"));
const themeDatabase_1 = __importDefault(require("./themeDatabase"));
const updateConfig_1 = __importDefault(require("../utils/updateConfig"));
const AppUpdater = require('./updater');
let mainWindow = null;
let eventDb = null;
let dbInitPromise = null;
let themeDb = null;
let themeDbInitPromise = null;
let appUpdater = null; // 包含 autoUpdater, isUpdateDownloaded 等方法
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
    const template = [
        {
            label: 'What about...?',
            submenu: [
                {
                    label: 'Time\'s White Goose',
                    click: () => {
                        if (mainWindow) {
                            electron_1.dialog.showMessageBox(mainWindow, {
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
                            electron_1.dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: '检查更新',
                                message: '开发模式下无法检查更新',
                                buttons: ['确定']
                            });
                            return;
                        }
                        // 手动检查更新
                        const result = await appUpdater.checkForUpdatesManually();
                        if (!result || !result.updateInfo) {
                            electron_1.dialog.showMessageBox(mainWindow, {
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
                        if (!mainWindow)
                            return;
                        const config = updateConfig_1.default.getConfig();
                        const proxyEnabled = config.proxy?.enabled || false;
                        const proxyHost = config.proxy?.host || '127.0.0.1';
                        const proxyPort = config.proxy?.port || 7890;
                        const result = await electron_1.dialog.showMessageBox(mainWindow, {
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
                        }
                        else if (result.response === 1) {
                            // 禁用代理
                            updateConfig_1.default.setProxy(false);
                            electron_1.dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: '配置成功',
                                message: '代理已禁用',
                                buttons: ['确定']
                            });
                            // 更新 updater 配置
                            if (appUpdater) {
                                appUpdater.setProxy(null);
                            }
                        }
                        else if (result.response === 2) {
                            // 启用代理（使用当前设置）
                            updateConfig_1.default.setProxy(true);
                            electron_1.dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: '配置成功',
                                message: `代理已启用: ${proxyHost}:${proxyPort}`,
                                buttons: ['确定']
                            });
                            // 更新 updater 配置
                            if (appUpdater) {
                                appUpdater.setProxy(updateConfig_1.default.getProxyUrl());
                            }
                        }
                        else if (result.response === 3) {
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
                            const version = electron_1.app.getVersion();
                            electron_1.dialog.showMessageBox(mainWindow, {
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
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
function createWindow() {
    try {
        const state = getWindowState();
        mainWindow = new electron_1.BrowserWindow({
            width: state.width,
            height: state.height,
            x: state.x,
            y: state.y,
            icon: (0, path_1.join)(__dirname, '../../../build/icons/icon.ico'), // 设置窗口图标
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
            // 生产环境下，从app.asar包的根目录加载dist/index.html
            mainWindow.loadFile((0, path_1.join)(__dirname, '../../../dist/index.html')).catch(console.error);
        }
        // 页面加载完成后，发送主题配置
        mainWindow.webContents.on('did-finish-load', async () => {
            try {
                const configPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'themeConfig.json');
                if ((0, fs_1.existsSync)(configPath)) {
                    const config = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf8'));
                    mainWindow?.webContents.send('apply-saved-theme', config);
                }
            }
            catch (error) {
                console.error('Failed to send theme config:', error);
            }
        });
    }
    catch (error) {
        console.error('Failed to create window:', error);
    }
}
// 初始化数据库的异步函数
async function initDatabase() {
    if (eventDb)
        return eventDb;
    if (dbInitPromise)
        return dbInitPromise;
    dbInitPromise = new Promise(async (resolve) => {
        try {
            // 等待app准备好
            if (!electron_1.app.isReady()) {
                await electron_1.app.whenReady();
            }
            eventDb = new database_1.default();
            await eventDb.initialize();
            console.log('Database initialized successfully');
            resolve(eventDb);
        }
        catch (error) {
            console.error('Failed to initialize database:', error);
            // 即使失败也要resolve，避免promise永远pending
            resolve(null);
        }
    });
    return dbInitPromise;
}
// 初始化主题数据库的异步函数
async function initThemeDatabase() {
    if (themeDb)
        return themeDb;
    if (themeDbInitPromise)
        return themeDbInitPromise;
    themeDbInitPromise = new Promise(async (resolve) => {
        try {
            // 等待app准备好
            if (!electron_1.app.isReady()) {
                await electron_1.app.whenReady();
            }
            themeDb = new themeDatabase_1.default();
            await themeDb.initialize();
            console.log('Theme database initialized successfully');
            resolve(themeDb);
        }
        catch (error) {
            console.error('Failed to initialize theme database:', error);
            // 即使失败也要resolve，避免promise永远pending
            resolve(null);
        }
    });
    return themeDbInitPromise;
}
electron_1.app.whenReady().then(async () => {
    // 应用准备好后初始化数据库
    await initDatabase();
    await initThemeDatabase();
    createCustomMenu();
    createWindow();
    // 初始化应用自动更新
    if (!electron_1.app.isPackaged) {
        console.log('开发模式，跳过自动更新');
        console.log('版本:', electron_1.app.getVersion());
    }
    else {
        appUpdater = new AppUpdater(() => mainWindow);
        // 配置GitHub更新地址
        appUpdater.setFeedURL({
            provider: 'github',
            owner: 'inshallah123',
            repo: 'lwg-ultimate'
        });
        // 设置代理（如果已配置）
        const proxyUrl = updateConfig_1.default.getProxyUrl();
        if (proxyUrl) {
            appUpdater.setProxy(proxyUrl);
        }
        // 延迟检查应用更新
        const config = updateConfig_1.default.getConfig();
        if (config.autoCheck !== false) {
            setTimeout(() => {
                appUpdater.checkForUpdates();
            }, 3000);
        }
    }
    // 延迟5秒后检查更新，避免影响启动速度
    setTimeout(async () => {
        const updateInfo = await (0, checkUpdates_1.checkLunarLibraryUpdate)();
        if (updateInfo?.hasUpdate && mainWindow) {
            const result = await electron_1.dialog.showMessageBox(mainWindow, {
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
                await electron_1.dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: '正在更新',
                    message: '正在更新节假日数据库...',
                    buttons: []
                });
                const success = await (0, checkUpdates_1.updateLunarLibrary)();
                if (success) {
                    const restartResult = await electron_1.dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: '更新完成',
                        message: '节假日数据已更新到最新版本',
                        detail: '需要重启应用以加载新的数据。是否现在重启？',
                        buttons: ['稍后', '立即重启'],
                        defaultId: 1
                    });
                    if (restartResult.response === 1) {
                        electron_1.app.relaunch();
                        electron_1.app.exit();
                    }
                }
                else {
                    await electron_1.dialog.showMessageBox(mainWindow, {
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
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
electron_1.app.on('before-quit', (event) => {
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
electron_1.ipcMain.handle('db:getAllEvents', async () => {
    // 确保数据库已初始化
    const db = await initDatabase();
    if (!db) {
        console.error('Database not available');
        return [];
    }
    try {
        return db.getAllEvents();
    }
    catch (error) {
        console.error('Error getting events from database:', error);
        return [];
    }
});
electron_1.ipcMain.handle('db:addEvent', async (_, event) => {
    const db = await initDatabase();
    if (!db) {
        throw new Error('Database not available');
    }
    return db.addEvent(event);
});
electron_1.ipcMain.handle('db:updateEvent', async (_, event) => {
    const db = await initDatabase();
    if (!db) {
        throw new Error('Database not available');
    }
    return db.updateEvent(event);
});
electron_1.ipcMain.handle('db:deleteEvent', async (_, id) => {
    const db = await initDatabase();
    if (!db) {
        throw new Error('Database not available');
    }
    return db.deleteEvent(id);
});
electron_1.ipcMain.handle('db:syncEvents', async (_, events) => {
    const db = await initDatabase();
    if (!db) {
        throw new Error('Database not available');
    }
    return db.syncEvents(events);
});
// 更新配置相关的IPC处理
electron_1.ipcMain.handle('update:getConfig', () => {
    return updateConfig_1.default.getConfig();
});
electron_1.ipcMain.handle('update:setProxy', (_, enabled, host, port) => {
    updateConfig_1.default.setProxy(enabled, host, port);
    // 更新 updater 配置
    if (appUpdater) {
        const proxyUrl = enabled ? updateConfig_1.default.getProxyUrl() : null;
        appUpdater.setProxy(proxyUrl);
    }
    return { success: true };
});
electron_1.ipcMain.handle('update:checkNow', async () => {
    if (!appUpdater) {
        return { error: '开发模式下无法检查更新' };
    }
    try {
        const result = await appUpdater.checkForUpdatesManually();
        return result;
    }
    catch (error) {
        return { error: error.message };
    }
});
// 主题相关的IPC处理
electron_1.ipcMain.handle('theme:save', async (_, theme) => {
    const db = await initThemeDatabase();
    if (!db) {
        return { success: false, error: 'Theme database not available' };
    }
    return db.saveTheme(theme);
});
electron_1.ipcMain.handle('theme:load', async (_, name) => {
    const db = await initThemeDatabase();
    if (!db) {
        return { success: false, error: 'Theme database not available' };
    }
    return db.loadTheme(name);
});
electron_1.ipcMain.handle('theme:list', async () => {
    const db = await initThemeDatabase();
    if (!db) {
        return { success: false, error: 'Theme database not available' };
    }
    return db.getThemeList();
});
electron_1.ipcMain.handle('theme:delete', async (_, name) => {
    const db = await initThemeDatabase();
    if (!db) {
        return { success: false, error: 'Theme database not available' };
    }
    return db.deleteTheme(name);
});
// 获取当前选中的默认主题
electron_1.ipcMain.handle('theme:getCurrentTheme', async () => {
    try {
        const configPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'themeConfig.json');
        if ((0, fs_1.existsSync)(configPath)) {
            const config = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf8'));
            return config;
        }
        return { themeName: '默认主题' };
    }
    catch (error) {
        console.error('Failed to load theme config:', error);
        return { themeName: '默认主题' };
    }
});
// 设置默认主题
electron_1.ipcMain.handle('theme:setDefaultTheme', async (_, themeName) => {
    try {
        const configPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'themeConfig.json');
        const config = { themeName, updatedAt: new Date().toISOString() };
        (0, fs_1.writeFileSync)(configPath, JSON.stringify(config, null, 2));
        return { success: true };
    }
    catch (error) {
        console.error('Failed to save theme config:', error);
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=index.js.map
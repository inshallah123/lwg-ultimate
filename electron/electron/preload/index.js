"use strict";
/**
 * Preload Script
 * 作用：在渲染进程和主进程之间建立安全的通信桥梁
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    database: {
        getAllEvents: () => electron_1.ipcRenderer.invoke('db:getAllEvents'),
        addEvent: (event) => electron_1.ipcRenderer.invoke('db:addEvent', event),
        updateEvent: (event) => electron_1.ipcRenderer.invoke('db:updateEvent', event),
        deleteEvent: (id) => electron_1.ipcRenderer.invoke('db:deleteEvent', id),
        syncEvents: (events) => electron_1.ipcRenderer.invoke('db:syncEvents', events)
    },
    // 更新相关
    onUpdateProgress: (callback) => {
        electron_1.ipcRenderer.on('download-progress', callback);
    },
    onUpdateComplete: (callback) => {
        electron_1.ipcRenderer.on('update-downloaded', callback);
    },
    removeUpdateListeners: () => {
        electron_1.ipcRenderer.removeAllListeners('download-progress');
        electron_1.ipcRenderer.removeAllListeners('update-downloaded');
    }
});
// 暴露额外的 electron API 用于更新配置
electron_1.contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (channel, ...args) => electron_1.ipcRenderer.invoke(channel, ...args),
        on: (channel, listener) => {
            electron_1.ipcRenderer.on(channel, listener);
        },
        removeAllListeners: (channel) => {
            electron_1.ipcRenderer.removeAllListeners(channel);
        },
        send: (channel, ...args) => {
            electron_1.ipcRenderer.send(channel, ...args);
        }
    }
});
//# sourceMappingURL=index.js.map
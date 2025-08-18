"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Preload script - Bridge between main and renderer process
const electron_1 = require("electron");
// Expose protected methods to renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Event operations
    events: {
        create: (event) => electron_1.ipcRenderer.invoke('event:create', event),
        read: (id) => electron_1.ipcRenderer.invoke('event:read', id),
        readAll: (startDate, endDate) => electron_1.ipcRenderer.invoke('event:readAll', startDate, endDate),
        update: (id, updates) => electron_1.ipcRenderer.invoke('event:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('event:delete', id),
    },
    // System operations
    system: {
        showNotification: (title, body) => electron_1.ipcRenderer.send('system:notification', { title, body }),
        getLocale: () => electron_1.ipcRenderer.invoke('system:locale'),
        openExternal: (url) => electron_1.ipcRenderer.send('system:openExternal', url),
    },
    // Window operations
    window: {
        minimize: () => electron_1.ipcRenderer.send('window:minimize'),
        maximize: () => electron_1.ipcRenderer.send('window:maximize'),
        close: () => electron_1.ipcRenderer.send('window:close'),
        toggleFullscreen: () => electron_1.ipcRenderer.send('window:toggleFullscreen'),
    },
    // Settings operations
    settings: {
        get: (key) => electron_1.ipcRenderer.invoke('settings:get', key),
        set: (key, value) => electron_1.ipcRenderer.invoke('settings:set', key, value),
        getAll: () => electron_1.ipcRenderer.invoke('settings:getAll'),
    },
    // Theme operations
    theme: {
        toggle: () => electron_1.ipcRenderer.send('theme:toggle'),
        set: (theme) => electron_1.ipcRenderer.send('theme:set', theme),
    }
});
//# sourceMappingURL=index.js.map
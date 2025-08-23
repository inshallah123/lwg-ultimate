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
    }
});
//# sourceMappingURL=index.js.map
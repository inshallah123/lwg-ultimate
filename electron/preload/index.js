"use strict";
/**
 * Preload Script
 * 作用：在渲染进程和主进程之间建立安全的通信桥梁
 *
 * 当前状态：待实现
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 暂时为空，等需要时再添加具体的 API
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
// 将在实际需要时添加具体功能
});
//# sourceMappingURL=index.js.map
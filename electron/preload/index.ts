/**
 * Preload Script
 * 作用：在渲染进程和主进程之间建立安全的通信桥梁
 * 
 * 当前状态：待实现
 */

import { contextBridge } from 'electron';

// 暂时为空，等需要时再添加具体的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 将在实际需要时添加具体功能
});
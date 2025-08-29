/**
 * Preload Script
 * 作用：在渲染进程和主进程之间建立安全的通信桥梁
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Event } from '../../src/types/event';

// 定义更新进度数据类型
interface UpdateProgressData {
  percent: number;
  bytesPerSecond?: number;
  total?: number;
  transferred?: number;
}

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getAllEvents: () => ipcRenderer.invoke('db:getAllEvents'),
    addEvent: (event: Event) => ipcRenderer.invoke('db:addEvent', event),
    updateEvent: (event: Event) => ipcRenderer.invoke('db:updateEvent', event),
    deleteEvent: (id: string) => ipcRenderer.invoke('db:deleteEvent', id),
    syncEvents: (events: Event[]) => ipcRenderer.invoke('db:syncEvents', events)
  },
  // 更新相关
  onUpdateProgress: (callback: (event: IpcRendererEvent, data: UpdateProgressData) => void) => {
    ipcRenderer.on('download-progress', callback);
  },
  onUpdateComplete: (callback: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
  }
});

// 暴露额外的 electron API 用于更新配置
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      ipcRenderer.on(channel, listener);
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args);
    }
  }
});
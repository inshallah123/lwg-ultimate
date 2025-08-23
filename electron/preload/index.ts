/**
 * Preload Script
 * 作用：在渲染进程和主进程之间建立安全的通信桥梁
 */

import { contextBridge, ipcRenderer } from 'electron';
import { Event } from '../../src/types/event';

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getAllEvents: () => ipcRenderer.invoke('db:getAllEvents'),
    addEvent: (event: Event) => ipcRenderer.invoke('db:addEvent', event),
    updateEvent: (event: Event) => ipcRenderer.invoke('db:updateEvent', event),
    deleteEvent: (id: string) => ipcRenderer.invoke('db:deleteEvent', id),
    syncEvents: (events: Event[]) => ipcRenderer.invoke('db:syncEvents', events)
  }
});
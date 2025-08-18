// Preload script - Bridge between main and renderer process
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Event operations
  events: {
    create: (event: any) => ipcRenderer.invoke('event:create', event),
    read: (id: string) => ipcRenderer.invoke('event:read', id),
    readAll: (startDate?: Date, endDate?: Date) => 
      ipcRenderer.invoke('event:readAll', startDate, endDate),
    update: (id: string, updates: any) => 
      ipcRenderer.invoke('event:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('event:delete', id),
  },
  
  // System operations
  system: {
    showNotification: (title: string, body: string) => 
      ipcRenderer.send('system:notification', { title, body }),
    getLocale: () => ipcRenderer.invoke('system:locale'),
    openExternal: (url: string) => ipcRenderer.send('system:openExternal', url),
  },
  
  // Window operations
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    toggleFullscreen: () => ipcRenderer.send('window:toggleFullscreen'),
  },
  
  // Settings operations
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => 
      ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
  },
  
  // Theme operations
  theme: {
    toggle: () => ipcRenderer.send('theme:toggle'),
    set: (theme: 'light' | 'dark' | 'system') => 
      ipcRenderer.send('theme:set', theme),
  }
});
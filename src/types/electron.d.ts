import { Event } from './event';
import { UpdateProgressData } from './update';

declare global {
  interface Window {
    electronAPI: {
      database: {
        getAllEvents: () => Promise<Event[]>;
        addEvent: (event: Event) => Promise<void>;
        updateEvent: (event: Event) => Promise<void>;
        deleteEvent: (id: string) => Promise<void>;
        syncEvents: (events: Event[]) => Promise<void>;
      };
      onUpdateProgress: (callback: (event: Electron.IpcRendererEvent, data: UpdateProgressData) => void) => void;
      onUpdateComplete: (callback: (event: Electron.IpcRendererEvent) => void) => void;
      removeUpdateListeners: () => void;
    };
    electron: {
      ipcRenderer: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
        send: (channel: string, ...args: unknown[]) => void;
      };
    };
  }
}

export {};
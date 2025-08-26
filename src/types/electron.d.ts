import { Event } from './event';

interface UpdateProgressData {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

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
      onUpdateProgress: (callback: (event: any, data: UpdateProgressData) => void) => void;
      onUpdateComplete: (callback: () => void) => void;
      removeUpdateListeners: () => void;
    };
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
        send: (channel: string, ...args: any[]) => void;
      };
    };
  }
}

export {};
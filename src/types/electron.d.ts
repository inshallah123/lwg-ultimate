declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    electronAPI: {
      loadEvents: () => Promise<any[]>;
      saveEvents: (events: any[]) => Promise<void>;
      addEvent: (event: any) => Promise<void>;
      updateEvent: (event: any) => Promise<void>;
      deleteEvent: (id: string) => Promise<void>;
      database: {
        getAllEvents: () => Promise<any[]>;
        syncEvents: (events: any[]) => Promise<void>;
        deleteEvent: (id: string) => Promise<void>;
      };
      onUpdateProgress?: (callback: (event: any, data: any) => void) => void;
      onUpdateComplete?: (callback: () => void) => void;
      removeUpdateListeners?: () => void;
    };
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
        on(channel: string, listener: (event: any, ...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
        send(channel: string, ...args: any[]): void;
      };
    };
  }
}

export {};
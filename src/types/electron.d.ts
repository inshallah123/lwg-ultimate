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
      }
    }
  }
}

export {};
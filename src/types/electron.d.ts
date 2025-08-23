import { Event } from './event';

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
    };
  }
}

export {};
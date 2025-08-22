import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';
import { StoreSet, StoreGet } from './types';

// noinspection JSUnusedGlobalSymbols
export const createCrudActions = (set: StoreSet, get: StoreGet) => ({
  addEvent: (input: CreateEventInput) => {
    const newEvent: Event = {
      ...input,
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set(state => ({
      events: [...state.events, newEvent]
    }));
  },
  
  updateEvent: (id: string, updates: UpdateEventInput) => {
    set(state => ({
      events: state.events.map(event =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      )
    }));
  },
  
  deleteEvent: (id: string) => {
    set(state => ({
      events: state.events.filter(event => event.id !== id)
    }));
  },
  
  getEventById: (id: string) => {
    return get().events.find(e => e.id === id);
  },
  
  getParentEvent: (id: string) => {
    const state = get();
    const event = state.events.find(e => e.id === id);
    if (!event) return undefined;
    
    if (event.parentId) {
      return state.events.find(e => e.id === event.parentId);
    }
    return event;
  }
});
import { useState, useCallback } from 'react';

interface EventFormState {
  isOpen: boolean;
  selectedDate: Date | null;
  selectedHour: number | null;
}

export function useEventFormOpen() {
  const [state, setState] = useState<EventFormState>({
    isOpen: false,
    selectedDate: null,
    selectedHour: null,
  });

  const openEventForm = useCallback((date?: Date, hour?: number) => {
    setState({
      isOpen: true,
      selectedDate: date || null,
      selectedHour: hour !== undefined ? hour : null,
    });
  }, []);

  const closeEventForm = useCallback(() => {
    setState({
      isOpen: false,
      selectedDate: null,
      selectedHour: null,
    });
  }, []);

  return {
    isEventFormOpen: state.isOpen,
    selectedDate: state.selectedDate,
    selectedHour: state.selectedHour,
    openEventForm,
    closeEventForm,
  };
}
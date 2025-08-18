import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { Layout } from '@/components/layout/Layout';
import { CalendarView } from '@/pages/CalendarView';

function App() {
  return (
    <ThemeProvider>
      <CalendarProvider>
        <Layout>
          {/* Main application content placeholder */}
          <CalendarView />
        </Layout>
      </CalendarProvider>
    </ThemeProvider>
  );
}

export default App;
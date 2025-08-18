import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // TODO: Implement responsive layout
  // TODO: Handle sidebar toggle
  // TODO: Theme switching
  
  return (
    <div className="app-layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
};
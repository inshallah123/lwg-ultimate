import React from 'react';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};
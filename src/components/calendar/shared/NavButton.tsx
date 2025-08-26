import React from 'react';
import styles from './NavButton.module.css';

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function NavButton({ onClick, children, className = '', ariaLabel }: NavButtonProps) {
  return (
    <button 
      className={`${styles.navButton} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
import React from 'react';
import styles from './SearchBox.module.css';

interface HighlightTextProps {
  text: string;
  keyword: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, keyword }) => {
  if (!keyword || !text) return <>{text}</>;
  
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className={styles.highlight}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};
import React, { useState } from 'react';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ 
  placeholder = "Search events, dates...",
  onSearch 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // 实时搜索（可选）
    // onSearch?.(value);
  };

  return (
    <div className={`${styles.searchContainer} ${isFocused ? styles.focused : ''}`}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchIconWrapper}>
          <svg 
            className={styles.searchIcon} 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {searchQuery && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </form>
      
      {/* 搜索快捷键提示 */}
      {!isFocused && !searchQuery && (
        <div className={styles.shortcutHint}>
          <kbd className={styles.kbd}>Ctrl</kbd>
          <span className={styles.plus}>+</span>
          <kbd className={styles.kbd}>K</kbd>
        </div>
      )}
    </div>
  );
};
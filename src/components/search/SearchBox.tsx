import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Event } from '@/types/event';
import { SearchSuggestions } from './SearchSuggestions';
import { searchEvents } from './searchUtils';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onEventClick?: (event: Event, date: Date) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ 
  placeholder = "Search events, dates...",
  onSearch,
  onEventClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const getEventsInRange = useEventStore(state => state.getEventsInRange);
  
  // 搜索逻辑
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的开始
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    const allEventsInRange = getEventsInRange(today, oneYearLater);
    console.log('🔍 SearchBox Debug:', {
      searchQuery,
      todayDate: today.toISOString(),
      endDate: oneYearLater.toISOString(),
      eventsCount: allEventsInRange.length,
      events: allEventsInRange
    });
    
    const results = searchEvents(searchQuery, allEventsInRange, today);
    console.log('🎯 Search Results:', results);
    return results;
  }, [searchQuery, getEventsInRange]);
  
  // 处理键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || searchResults.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            const result = searchResults[selectedIndex];
            handleEventClick(result.event, result.nextInstanceDate || result.event.date);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };
    
    if (showSuggestions) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSuggestions, searchResults, selectedIndex]);
  
  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch?.('');
    inputRef.current?.focus();
  };
  
  const handleEventClick = (event: Event, date: Date) => {
    onEventClick?.(event, date);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);
    // 实时搜索（可选）
    // onSearch?.(value);
  };

  return (
    <div className={styles.searchWrapper} ref={searchRef}>
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
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (searchQuery) setShowSuggestions(true);
            }}
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
      
      {/* 搜索建议列表 */}
      {showSuggestions && searchQuery && (
        <SearchSuggestions
          results={searchResults}
          searchQuery={searchQuery}
          selectedIndex={selectedIndex}
          onEventClick={handleEventClick}
          onMouseEnter={setSelectedIndex}
        />
      )}
    </div>
  );
};
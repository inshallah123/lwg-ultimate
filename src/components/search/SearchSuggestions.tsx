import React from 'react';
import { Event } from '@/types/event';
import { formatDate } from '@/utils/dateHelpers';
import { HighlightText } from './HighlightText';
import { SearchResult, formatTag } from './searchUtils';
import styles from './SearchBox.module.css';

interface SearchSuggestionsProps {
  results: SearchResult[];
  searchQuery: string;
  selectedIndex: number;
  onEventClick: (event: Event, date: Date) => void;
  onMouseEnter: (index: number) => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  results,
  searchQuery,
  selectedIndex,
  onEventClick,
  onMouseEnter
}) => {
  if (results.length === 0) {
    return (
      <div className={styles.suggestions}>
        <div className={styles.noResults}>
          No events found for &ldquo;{searchQuery}&rdquo;
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.suggestions}>
      {results.map((result, index) => {
        const { event, isRecurringNext, nextInstanceDate } = result;
        const displayDate = nextInstanceDate || event.date;
        
        return (
          <div
            key={`${event.id}_${index}`}
            className={`${styles.suggestionItem} ${index === selectedIndex ? styles.selected : ''}`}
            onClick={() => onEventClick(event, displayDate)}
            onMouseEnter={() => onMouseEnter(index)}
          >
            <div className={styles.suggestionLeft}>
              <div className={styles.eventTitle}>
                <HighlightText text={event.title} keyword={searchQuery} />
                {isRecurringNext && (
                  <span className={styles.recurringBadge}>Recurring</span>
                )}
              </div>
              <div className={styles.eventMeta}>
                <span className={styles.eventDate}>
                  <HighlightText 
                    text={formatDate(displayDate, 'short')} 
                    keyword={searchQuery} 
                  />
                </span>
                <span className={styles.separator}>•</span>
                <span className={styles.eventTime}>
                  <HighlightText text={event.timeSlot} keyword={searchQuery} />
                </span>
                <span className={styles.separator}>•</span>
                <span className={`${styles.eventTag} ${styles[`tag-${event.tag}`]}`}>
                  <HighlightText 
                    text={formatTag(event.tag, event.customTag)} 
                    keyword={searchQuery} 
                  />
                </span>
              </div>
            </div>
            {event.description && (
              <div className={styles.suggestionRight}>
                <div className={styles.eventDescription}>
                  <HighlightText 
                    text={
                      event.description.length > 50 
                        ? event.description.substring(0, 50) + '...' 
                        : event.description
                    } 
                    keyword={searchQuery} 
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
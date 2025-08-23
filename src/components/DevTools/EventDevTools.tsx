import React, { useState } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { isSimpleEvent, isRecurringParent } from '@/types/event';
import styles from './EventDevTools.module.css';

export function EventDevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const events = useEventStore(state => state.events);
  
  // 统计数据
  const totalEvents = events.length;
  const simpleEvents = events.filter(isSimpleEvent);
  const recurringParents = events.filter(isRecurringParent);
  
  const handleClearAll = () => {
    if (window.confirm(`确定要清除所有 ${totalEvents} 个事件吗？此操作不可恢复。`)) {
      // 清除所有事件
      useEventStore.setState({ events: [] });
      console.log('✅ 所有事件已清除');
    }
  };
  
  const handleResetStorage = () => {
    if (window.confirm('确定要完全重置事件存储吗？')) {
      localStorage.removeItem('event-storage');
      window.location.reload();
    }
  };
  
  const handleExportData = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('✅ 数据已导出');
  };
  
  // 仅在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <>
      {/* 浮动按钮 */}
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Event Dev Tools"
      >
        🔧
      </button>
      
      {/* 工具面板 */}
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3>Event Dev Tools</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className={styles.stats}>
            <h4>📊 事件统计</h4>
            <div className={styles.statItem}>
              <span>总数:</span>
              <strong>{totalEvents}</strong>
            </div>
            <div className={styles.statItem}>
              <span>简单事件 (SE):</span>
              <strong>{simpleEvents.length}</strong>
            </div>
            <div className={styles.statItem}>
              <span>重复母事件 (RP):</span>
              <strong>{recurringParents.length}</strong>
            </div>
          </div>
          
          <div className={styles.actions}>
            <h4>🔧 操作</h4>
            <button 
              className={styles.actionButton}
              onClick={handleClearAll}
              disabled={totalEvents === 0}
            >
              清除所有事件
            </button>
            <button 
              className={styles.actionButton}
              onClick={handleResetStorage}
            >
              重置存储
            </button>
            <button 
              className={styles.actionButton}
              onClick={handleExportData}
              disabled={totalEvents === 0}
            >
              导出数据
            </button>
          </div>
          
          {/* 重复事件详情 */}
          {recurringParents.length > 0 && (
            <div className={styles.details}>
              <h4>📅 重复事件</h4>
              {recurringParents.map(event => (
                <div key={event.id} className={styles.eventItem}>
                  <span>{event.title}</span>
                  <span className={styles.badge}>{event.recurrence}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
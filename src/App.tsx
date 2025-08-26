import React, { useRef, useState, useEffect } from 'react';
import { MonthView } from './components/calendar/month/MonthView';
import { WeekView } from './components/calendar/week/WeekView';
import { YearView } from './components/calendar/year/YearView';
import { SearchBox } from '@/components/search/SearchBox';
import { Sidebar } from './components/Sidebar/sidebar';
import { useSidebarStore } from './components/Sidebar/store';
import { useCalendarStore } from './components/calendar/store';
import { Event } from '@/types/event';
import UpdateProgress from './components/UpdateProgress/UpdateProgress';
import ProxyConfigDialog from './components/ProxyConfigDialog';
import styles from './App.module.css';

function App() {
  const viewMode = useCalendarStore(state => state.viewMode);
  const isTransitioning = useCalendarStore(state => state.isTransitioning);
  const transitionDirection = useCalendarStore(state => state.transitionDirection);
  const handleViewChange = useCalendarStore(state => state.handleViewChange);
  const setDate = useCalendarStore(state => state.setDate);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const openSidebar = useSidebarStore(state => state.open);
  const [isProxyDialogOpen, setIsProxyDialogOpen] = useState(false);
  const [proxyConfig, setProxyConfig] = useState<any>(null);
  
  useEffect(() => {
    // 监听主进程发送的显示代理配置消息
    const handleShowProxyConfig = (_event: any, config: any) => {
      setProxyConfig(config);
      setIsProxyDialogOpen(true);
    };

    window.electron?.ipcRenderer.on('show-proxy-config', handleShowProxyConfig);
    
    return () => {
      window.electron?.ipcRenderer.removeAllListeners('show-proxy-config');
    };
  }, []);
  
  const handleSearch = () => {
    // 基础搜索功能（可选）
  };
  
  const handleEventClick = (event: Event, date: Date) => {
    // 设置日历日期
    setDate(date);
    
    // 切换到周视图
    if (viewMode !== 'week') {
      handleViewChange('week');
    }
    
    // 根据时间段计算hour索引
    const timeSlotIndex = [
      '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
      '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
      '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00'
    ].indexOf(event.timeSlot);
    
    // 打开侧边栏，传入日期和小时
    openSidebar(date, timeSlotIndex !== -1 ? timeSlotIndex : undefined);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Goose's Calendar</h1>
        <SearchBox 
          onSearch={handleSearch}
          onEventClick={handleEventClick}
        />
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewButton} ${viewMode === 'year' ? styles.active : ''}`}
            onClick={() => handleViewChange('year')}
          >
            Year
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'month' ? styles.active : ''}`}
            onClick={() => handleViewChange('month')}
          >
            Month
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'week' ? styles.active : ''}`}
            onClick={() => handleViewChange('week')}
          >
            Week
          </button>
        </div>
      </div>
      <div className={styles.viewWrapper}>
        <div 
          ref={viewContainerRef}
          className={`${styles.viewContainer} ${isTransitioning ? styles.transitioning : ''} ${styles[transitionDirection]}`}
          data-view={viewMode}
        >
          {viewMode === 'year' ? 
            <YearView /> :
            viewMode === 'month' ? 
            <MonthView onOpenSideBar={openSidebar} /> : 
            <WeekView onOpenSideBar={openSidebar} />
          }
        </div>
      </div>
      <Sidebar />
      <UpdateProgress />
      <ProxyConfigDialog 
        isOpen={isProxyDialogOpen}
        onClose={() => setIsProxyDialogOpen(false)}
        initialConfig={proxyConfig}
      />
    </div>
  );
}

export default App;
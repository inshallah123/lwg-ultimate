import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, RotateCcw, Trash2, Move } from 'lucide-react';
import styles from './ThemePalette.module.css';
import GlobalStylePanel from './panels/GlobalStylePanel';
import YearViewPanel from './panels/YearViewPanel';
import MonthCardPanel from './panels/MonthCardPanel';
import MonthViewPanel from './panels/MonthViewPanel';
import WeekViewPanel from './panels/WeekViewPanel';
import { ThemeConfig, ThemeHistoryEntry } from './types';
import { applyThemeToDOM, removeThemeFromDOM } from './utils/themeApplier';
import { saveTheme, loadTheme, getThemeList } from './utils/themeStorage';

interface ThemePaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemePalette: React.FC<ThemePaletteProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    global: {},
    yearView: {},
    monthCard: {},
    monthView: {},
    weekView: {}
  });
  
  const [history, setHistory] = useState<ThemeHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [themeName, setThemeName] = useState('');
  const [savedThemes, setSavedThemes] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      loadThemeList();
    }
  }, [isOpen]);

  const loadThemeList = async () => {
    const themes = await getThemeList();
    setSavedThemes(themes);
  };

  const updateThemeConfig = (section: keyof ThemeConfig, config: any) => {
    const newConfig = {
      ...themeConfig,
      [section]: { ...themeConfig[section], ...config }
    };
    
    setThemeConfig(newConfig);
    
    // 添加到历史记录
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ config: newConfig, timestamp: Date.now() });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // 应用主题
    applyThemeToDOM(newConfig);
  };

  const handlePreview = useCallback((targetComponent: string) => {
    setIsPreviewMode(true);
    
    // 跳转到目标组件
    setTimeout(() => {
      const element = document.querySelector(targetComponent);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // 处理拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousConfig = history[newIndex].config;
      setThemeConfig(previousConfig);
      applyThemeToDOM(previousConfig);
    }
  };

  const handleClear = () => {
    const emptyConfig: ThemeConfig = {
      global: {},
      yearView: {},
      monthCard: {},
      monthView: {},
      weekView: {}
    };
    setThemeConfig(emptyConfig);
    setHistory([]);
    setHistoryIndex(-1);
    removeThemeFromDOM();
  };

  const handleSave = async () => {
    if (!themeName.trim()) {
      alert('请输入主题名称');
      return;
    }
    
    try {
      await saveTheme(themeName, themeConfig);
      alert('主题保存成功');
      await loadThemeList();
    } catch (error) {
      alert('保存失败: ' + error);
    }
  };

  const handleLoadTheme = async (name: string) => {
    try {
      const theme = await loadTheme(name);
      if (theme) {
        setThemeConfig(theme);
        setThemeName(name);
        applyThemeToDOM(theme);
        
        // 重置历史
        setHistory([{ config: theme, timestamp: Date.now() }]);
        setHistoryIndex(0);
      }
    } catch (error) {
      alert('加载失败: ' + error);
    }
  };

  // 如果不是打开状态，直接返回null
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {isPreviewMode && (
        <div 
          ref={dragRef}
          className={styles.previewNotification}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <div 
            className={styles.dragHandle}
            onMouseDown={handleMouseDown}
          >
            <Move size={16} />
          </div>
          <span>预览模式 - 点击返回调色板</span>
          <button onClick={() => setIsPreviewMode(false)}>返回</button>
        </div>
      )}
      
      <div className={styles.overlay} style={{ display: isPreviewMode ? 'none' : 'flex' }}>
        <div className={styles.container}>
        <div className={styles.header}>
          <h2>主题调色板</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'global' ? styles.active : ''}`}
            onClick={() => setActiveTab('global')}
          >
            全局
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'yearView' ? styles.active : ''}`}
            onClick={() => setActiveTab('yearView')}
          >
            年视图
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'monthCard' ? styles.active : ''}`}
            onClick={() => setActiveTab('monthCard')}
          >
            年视图-月份卡片
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'monthView' ? styles.active : ''}`}
            onClick={() => setActiveTab('monthView')}
          >
            月视图
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'weekView' ? styles.active : ''}`}
            onClick={() => setActiveTab('weekView')}
          >
            周视图
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'global' && (
            <GlobalStylePanel
              config={themeConfig.global}
              onChange={(config) => updateThemeConfig('global', config)}
              onPreview={() => handlePreview('body')}
            />
          )}
          {activeTab === 'yearView' && (
            <YearViewPanel
              config={themeConfig.yearView}
              onChange={(config) => updateThemeConfig('yearView', config)}
              onPreview={() => handlePreview('.yearContainer')}
            />
          )}
          {activeTab === 'monthCard' && (
            <MonthCardPanel
              config={themeConfig.monthCard}
              onChange={(config) => updateThemeConfig('monthCard', config)}
              onPreview={() => handlePreview('.monthCard')}
            />
          )}
          {activeTab === 'monthView' && (
            <MonthViewPanel
              config={themeConfig.monthView}
              onChange={(config) => updateThemeConfig('monthView', config)}
              onPreview={() => handlePreview('[class*="monthContainer"]')}
            />
          )}
          {activeTab === 'weekView' && (
            <WeekViewPanel
              config={themeConfig.weekView}
              onChange={(config) => updateThemeConfig('weekView', config)}
              onPreview={() => handlePreview('[class*="weekContainer"]')}
            />
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.themeManager}>
            <input
              type="text"
              placeholder="主题名称"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className={styles.themeNameInput}
            />
            <select
              className={styles.themeSelect}
              onChange={(e) => handleLoadTheme(e.target.value)}
              value=""
            >
              <option value="">加载主题...</option>
              {savedThemes.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <RotateCcw size={18} />
              撤销
            </button>
            <button className={styles.actionBtn} onClick={handleClear}>
              <Trash2 size={18} />
              清空
            </button>
            <button className={styles.saveBtn} onClick={handleSave}>
              <Save size={18} />
              保存主题
            </button>
          </div>
        </div>
      </div>
    </div>
    </>,
    document.body
  );
};

export default ThemePalette;
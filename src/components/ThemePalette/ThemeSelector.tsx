import React, { useState, useEffect } from 'react';
import { Check, Palette, X, Trash2 } from 'lucide-react';
import styles from './ThemeSelector.module.css';
import { getThemeList, loadTheme, deleteTheme } from './utils/themeStorage';
import { applyThemeToDOM, removeThemeFromDOM } from './utils/themeApplier';
import { ThemeConfig } from './types';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeItem {
  name: string;
  isDefault?: boolean;
}

const DEFAULT_THEMES: ThemeItem[] = [
  { name: '默认主题', isDefault: true },
  { name: '深色模式', isDefault: true },
  { name: '护眼模式', isDefault: true }
];

const DEFAULT_THEME_CONFIGS: { [key: string]: ThemeConfig } = {
  '默认主题': {
    global: {},
    yearView: {},
    monthView: {},
    monthCard: {},
    weekView: {}
  },
  '深色模式': {
    global: {
      backgroundColor: '#1a1a1a',
      opacity: 1
    },
    yearView: {
      containerBackground: '#2a2a2a',
      titleColor: '#e0e0e0'
    },
    monthView: {
      containerBackground: '#3a3a3a',
      headerColor: '#e0e0e0',
      dayNumberColor: '#e0e0e0'
    },
    monthCard: {
      background: '#2a2a2a',
      fontColor: '#e0e0e0',
      borderColor: '#404040'
    },
    weekView: {
      containerBackground: '#2a2a2a',
      headerColor: '#e0e0e0',
      dayNameColor: '#e0e0e0',
      hourCellBackground: '#1a1a1a',
      hourCellBorderColor: '#404040'
    }
  },
  '护眼模式': {
    global: {
      backgroundColor: '#f5f3e9',
      opacity: 1
    },
    yearView: {
      containerBackground: '#faf8f0',
      titleColor: '#5d5347'
    },
    monthView: {
      containerBackground: '#faf8f0',
      headerColor: '#5d5347',
      dayNumberColor: '#5d5347'
    },
    monthCard: {
      background: '#faf8f0',
      fontColor: '#5d5347',
      borderColor: '#d4c4a0'
    },
    weekView: {
      containerBackground: '#faf8f0',
      headerColor: '#5d5347',
      dayNameColor: '#5d5347',
      hourCellBackground: '#f5f3e9',
      hourCellBorderColor: '#d4c4a0'
    }
  }
};

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadThemes();
      loadCurrentTheme();
    }
  }, [isOpen]);

  const loadThemes = async () => {
    const customThemes = await getThemeList();
    const customThemeItems = customThemes.map(name => ({ name, isDefault: false }));
    setThemes([...DEFAULT_THEMES, ...customThemeItems]);
  };

  const loadCurrentTheme = async () => {
    try {
      const config = await window.electron.ipcRenderer.invoke('theme:getCurrentTheme');
      if (config && config.themeName) {
        setSelectedTheme(config.themeName);
      } else {
        setSelectedTheme('默认主题');
      }
    } catch (error) {
      console.error('Failed to load current theme:', error);
      setSelectedTheme('默认主题');
    }
  };

  const handleThemeSelect = async (themeName: string) => {
    setSelectedTheme(themeName);
    
    // 应用主题
    if (DEFAULT_THEMES.find(t => t.name === themeName)) {
      // 默认主题
      if (themeName === '默认主题') {
        removeThemeFromDOM();
      } else {
        const config = DEFAULT_THEME_CONFIGS[themeName];
        if (config) {
          applyThemeToDOM(config);
        }
      }
    } else {
      // 自定义主题
      const config = await loadTheme(themeName);
      if (config) {
        applyThemeToDOM(config);
      }
    }

    // 保存用户选择
    await window.electron.ipcRenderer.invoke('theme:setDefaultTheme', themeName);
  };

  const handleThemePreview = async (themeName: string) => {
    if (previewTheme === themeName) {
      // 取消预览
      setPreviewTheme(null);
      handleThemeSelect(selectedTheme);
    } else {
      // 开始预览
      setPreviewTheme(themeName);
      
      if (DEFAULT_THEMES.find(t => t.name === themeName)) {
        // 默认主题
        if (themeName === '默认主题') {
          removeThemeFromDOM();
        } else {
          const config = DEFAULT_THEME_CONFIGS[themeName];
          if (config) {
            applyThemeToDOM(config);
          }
        }
      } else {
        // 自定义主题
        const config = await loadTheme(themeName);
        if (config) {
          applyThemeToDOM(config);
        }
      }
    }
  };

  const handleThemeDelete = async (themeName: string) => {
    if (confirm(`确定要删除主题"${themeName}"吗？`)) {
      await deleteTheme(themeName);
      loadThemes();
      
      // 如果删除的是当前主题，切换到默认主题
      if (selectedTheme === themeName) {
        handleThemeSelect('默认主题');
      }
    }
  };

  const handleClose = () => {
    // 取消预览，恢复选中的主题
    if (previewTheme) {
      handleThemeSelect(selectedTheme);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>主题选择</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.themeGrid}>
            {themes.map(theme => (
              <div
                key={theme.name}
                className={`${styles.themeCard} ${
                  selectedTheme === theme.name ? styles.selected : ''
                } ${previewTheme === theme.name ? styles.previewing : ''}`}
              >
                <div className={styles.themeHeader}>
                  <div className={styles.themeIcon}>
                    <Palette size={24} />
                  </div>
                  <div className={styles.themeName}>
                    {theme.name}
                    {theme.isDefault && (
                      <span className={styles.defaultBadge}>内置</span>
                    )}
                  </div>
                  {selectedTheme === theme.name && (
                    <div className={styles.selectedIcon}>
                      <Check size={18} />
                    </div>
                  )}
                </div>

                <div className={styles.themeActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleThemePreview(theme.name)}
                  >
                    {previewTheme === theme.name ? '取消预览' : '预览'}
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.primary}`}
                    onClick={() => handleThemeSelect(theme.name)}
                    disabled={selectedTheme === theme.name}
                  >
                    选择
                  </button>
                  {!theme.isDefault && (
                    <button
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => handleThemeDelete(theme.name)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.info}>
            <p>选择一个主题作为默认主题，应用将在下次启动时自动加载该主题。</p>
            <p>点击"预览"可以临时查看主题效果，点击"选择"确认使用该主题。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
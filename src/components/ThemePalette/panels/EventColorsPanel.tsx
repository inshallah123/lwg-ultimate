import React from 'react';
import { EventColorsConfig, EventColorConfig } from '../types';
import styles from './Panel.module.css';

interface EventColorsPanelProps {
  config: EventColorsConfig;
  onChange: (config: EventColorsConfig) => void;
  onPreview: () => void;
}

const DEFAULT_COLORS = {
  private: '#ff6b9d',
  work: '#667eea',
  balance: '#48bb78',
  custom: '#a0aec0'
};

const EventColorsPanel: React.FC<EventColorsPanelProps> = ({ config, onChange, onPreview }) => {
  const updateTagConfig = (tag: keyof EventColorsConfig, field: keyof EventColorConfig, value: string | number | EventColorConfig['gradient']) => {
    const tagConfig = config[tag] || {};
    
    if (field === 'gradient' && typeof value === 'object') {
      onChange({
        ...config,
        [tag]: {
          ...tagConfig,
          gradient: {
            ...tagConfig.gradient,
            ...value
          }
        }
      });
    } else {
      onChange({
        ...config,
        [tag]: {
          ...tagConfig,
          [field]: value
        }
      });
    }
  };

  const renderTagSection = (tag: keyof EventColorsConfig, label: string) => {
    const tagConfig = config[tag] || {};
    const isGradient = tagConfig.gradient?.enabled;
    const defaultColor = DEFAULT_COLORS[tag];

    return (
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{label}</h4>
        
        <div className={styles.field}>
          <label className={styles.label}>显示模式</label>
          <select
            className={styles.select}
            value={isGradient ? 'gradient' : 'solid'}
            onChange={(e) => {
              const useGradient = e.target.value === 'gradient';
              updateTagConfig(tag, 'gradient', {
                enabled: useGradient,
                startColor: tagConfig.gradient?.startColor || defaultColor,
                endColor: tagConfig.gradient?.endColor || '#ffffff',
                angle: tagConfig.gradient?.angle || 135
              });
            }}
          >
            <option value="solid">纯色</option>
            <option value="gradient">渐变</option>
          </select>
        </div>

        {!isGradient ? (
          <div className={styles.field}>
            <label className={styles.label}>背景颜色</label>
            <div className={styles.colorInputGroup}>
              <input
                type="color"
                className={styles.colorPicker}
                value={tagConfig.color || defaultColor}
                onChange={(e) => updateTagConfig(tag, 'color', e.target.value)}
              />
              <input
                type="text"
                className={styles.colorText}
                value={tagConfig.color || defaultColor}
                onChange={(e) => updateTagConfig(tag, 'color', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            <div className={styles.field}>
              <label className={styles.label}>起始颜色</label>
              <div className={styles.colorInputGroup}>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={tagConfig.gradient?.startColor || defaultColor}
                  onChange={(e) => updateTagConfig(tag, 'gradient', {
                    ...tagConfig.gradient,
                    startColor: e.target.value
                  })}
                />
                <input
                  type="text"
                  className={styles.colorText}
                  value={tagConfig.gradient?.startColor || defaultColor}
                  onChange={(e) => updateTagConfig(tag, 'gradient', {
                    ...tagConfig.gradient,
                    startColor: e.target.value
                  })}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>结束颜色</label>
              <div className={styles.colorInputGroup}>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={tagConfig.gradient?.endColor || '#ffffff'}
                  onChange={(e) => updateTagConfig(tag, 'gradient', {
                    ...tagConfig.gradient,
                    endColor: e.target.value
                  })}
                />
                <input
                  type="text"
                  className={styles.colorText}
                  value={tagConfig.gradient?.endColor || '#ffffff'}
                  onChange={(e) => updateTagConfig(tag, 'gradient', {
                    ...tagConfig.gradient,
                    endColor: e.target.value
                  })}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>渐变角度: {tagConfig.gradient?.angle || 135}°</label>
              <input
                type="range"
                className={styles.rangeSlider}
                min="0"
                max="360"
                value={tagConfig.gradient?.angle || 135}
                onChange={(e) => updateTagConfig(tag, 'gradient', {
                  ...tagConfig.gradient,
                  angle: parseInt(e.target.value)
                })}
              />
            </div>
          </>
        )}

        <div className={styles.field}>
          <label className={styles.label}>文字颜色</label>
          <div className={styles.colorInputGroup}>
            <input
              type="color"
              className={styles.colorPicker}
              value={tagConfig.textColor || '#ffffff'}
              onChange={(e) => updateTagConfig(tag, 'textColor', e.target.value)}
            />
            <input
              type="text"
              className={styles.colorText}
              value={tagConfig.textColor || '#ffffff'}
              onChange={(e) => updateTagConfig(tag, 'textColor', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>指示点颜色</label>
          <div className={styles.colorInputGroup}>
            <input
              type="color"
              className={styles.colorPicker}
              value={tagConfig.dotColor || tagConfig.color || defaultColor}
              onChange={(e) => updateTagConfig(tag, 'dotColor', e.target.value)}
            />
            <input
              type="text"
              className={styles.colorText}
              value={tagConfig.dotColor || tagConfig.color || defaultColor}
              onChange={(e) => updateTagConfig(tag, 'dotColor', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>事件卡片颜色</h3>
        <button className={styles.previewBtn} onClick={onPreview}>
          预览效果
        </button>
      </div>
      
      <div className={styles.scrollContent}>
        {renderTagSection('private', '私人事件')}
        {renderTagSection('work', '工作事件')}
        {renderTagSection('balance', '平衡事件')}
        {renderTagSection('custom', '自定义事件')}
      </div>
    </div>
  );
};

export default EventColorsPanel;
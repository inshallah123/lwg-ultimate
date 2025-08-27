import React from 'react';
import { Eye } from 'lucide-react';
import { WeekViewConfig } from '../types';
import styles from './Panel.module.css';

interface WeekViewPanelProps {
  config: WeekViewConfig;
  onChange: (config: WeekViewConfig) => void;
  onPreview: () => void;
}

const WeekViewPanel: React.FC<WeekViewPanelProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const handleChange = (key: keyof WeekViewConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>周视图样式设置</h3>
        <button className={styles.previewBtn} onClick={onPreview}>
          <Eye size={16} />
          预览
        </button>
      </div>

      <div className={styles.section}>
        <h4>容器样式</h4>
        <div className={styles.field}>
          <label>背景颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.containerBackground || '#ffffff'}
              onChange={(e) => handleChange('containerBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.containerBackground || '#ffffff'}
              onChange={(e) => handleChange('containerBackground', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>标题样式</h4>
        <div className={styles.field}>
          <label>标题大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="1"
              max="3"
              step="0.25"
              value={config.headerFontSize || 1.5}
              onChange={(e) => handleChange('headerFontSize', parseFloat(e.target.value))}
            />
            <span>{config.headerFontSize || 1.5}rem</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>标题颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.headerColor || '#374151'}
              onChange={(e) => handleChange('headerColor', e.target.value)}
            />
            <input
              type="text"
              value={config.headerColor || '#374151'}
              onChange={(e) => handleChange('headerColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>日期行标题样式</h4>
        <div className={styles.field}>
          <label>背景颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.dayHeaderBackground || '#f9fafb'}
              onChange={(e) => handleChange('dayHeaderBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.dayHeaderBackground || '#f9fafb'}
              onChange={(e) => handleChange('dayHeaderBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>星期名称颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.dayNameColor || '#6b7280'}
              onChange={(e) => handleChange('dayNameColor', e.target.value)}
            />
            <input
              type="text"
              value={config.dayNameColor || '#6b7280'}
              onChange={(e) => handleChange('dayNameColor', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>日期颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.dayDateColor || '#374151'}
              onChange={(e) => handleChange('dayDateColor', e.target.value)}
            />
            <input
              type="text"
              value={config.dayDateColor || '#374151'}
              onChange={(e) => handleChange('dayDateColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>今天标题样式</h4>
        <div className={styles.field}>
          <label>背景颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.todayHeaderBackground || '#dbeafe'}
              onChange={(e) => handleChange('todayHeaderBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.todayHeaderBackground || '#dbeafe'}
              onChange={(e) => handleChange('todayHeaderBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>文字颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.todayHeaderColor || '#1e40af'}
              onChange={(e) => handleChange('todayHeaderColor', e.target.value)}
            />
            <input
              type="text"
              value={config.todayHeaderColor || '#1e40af'}
              onChange={(e) => handleChange('todayHeaderColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>时间列样式</h4>
        <div className={styles.field}>
          <label>背景颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.timeColumnBackground || '#f9fafb'}
              onChange={(e) => handleChange('timeColumnBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.timeColumnBackground || '#f9fafb'}
              onChange={(e) => handleChange('timeColumnBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>时间文字颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.timeSlotColor || '#6b7280'}
              onChange={(e) => handleChange('timeSlotColor', e.target.value)}
            />
            <input
              type="text"
              value={config.timeSlotColor || '#6b7280'}
              onChange={(e) => handleChange('timeSlotColor', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>时间字体大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.05"
              value={config.timeSlotSize || 0.875}
              onChange={(e) => handleChange('timeSlotSize', parseFloat(e.target.value))}
            />
            <span>{config.timeSlotSize || 0.875}rem</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>小时格子样式</h4>
        <div className={styles.field}>
          <label>格子背景</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.hourCellBackground || '#ffffff'}
              onChange={(e) => handleChange('hourCellBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.hourCellBackground || '#ffffff'}
              onChange={(e) => handleChange('hourCellBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>边框颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.hourCellBorderColor || '#e5e7eb'}
              onChange={(e) => handleChange('hourCellBorderColor', e.target.value)}
            />
            <input
              type="text"
              value={config.hourCellBorderColor || '#e5e7eb'}
              onChange={(e) => handleChange('hourCellBorderColor', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>悬浮背景</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.hourCellHoverBackground || '#f0f9ff'}
              onChange={(e) => handleChange('hourCellHoverBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.hourCellHoverBackground || '#f0f9ff'}
              onChange={(e) => handleChange('hourCellHoverBackground', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>农历样式</h4>
        <div className={styles.field}>
          <label>农历字体大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0.6"
              max="1"
              step="0.05"
              value={config.lunarSize || 0.75}
              onChange={(e) => handleChange('lunarSize', parseFloat(e.target.value))}
            />
            <span>{config.lunarSize || 0.75}rem</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>农历颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.lunarColor || '#9ca3af'}
              onChange={(e) => handleChange('lunarColor', e.target.value)}
            />
            <input
              type="text"
              value={config.lunarColor || '#9ca3af'}
              onChange={(e) => handleChange('lunarColor', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>节日颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.festivalColor || '#dc2626'}
              onChange={(e) => handleChange('festivalColor', e.target.value)}
            />
            <input
              type="text"
              value={config.festivalColor || '#dc2626'}
              onChange={(e) => handleChange('festivalColor', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>节气颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.solarTermColor || '#059669'}
              onChange={(e) => handleChange('solarTermColor', e.target.value)}
            />
            <input
              type="text"
              value={config.solarTermColor || '#059669'}
              onChange={(e) => handleChange('solarTermColor', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekViewPanel;
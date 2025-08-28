import React from 'react';
import { Eye } from 'lucide-react';
import { MonthViewConfig } from '../types';
import styles from './Panel.module.css';

interface MonthViewPanelProps {
  config: MonthViewConfig;
  onChange: (config: MonthViewConfig) => void;
  onPreview: () => void;
}

const MonthViewPanel: React.FC<MonthViewPanelProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const handleChange = (key: keyof MonthViewConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleGradientChange = (field: string, value: any) => {
    onChange({
      ...config,
      containerGradient: {
        ...config.containerGradient,
        enabled: config.containerGradient?.enabled || false,
        startColor: config.containerGradient?.startColor || '#ffffff',
        endColor: config.containerGradient?.endColor || '#f8fcfb',
        angle: config.containerGradient?.angle || 180,
        [field]: value
      }
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>月视图样式设置</h3>
        <button className={styles.previewBtn} onClick={onPreview}>
          <Eye size={16} />
          预览
        </button>
      </div>

      <div className={styles.section}>
        <h4>背景样式</h4>
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

        <div className={styles.field}>
          <label>透明度</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.containerOpacity || 1}
              onChange={(e) => handleChange('containerOpacity', parseFloat(e.target.value))}
            />
            <input
              type="number"
              className={styles.numberInput}
              min="0"
              max="1"
              step="0.01"
              value={config.containerOpacity || 1}
              onChange={(e) => {
                const value = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
                handleChange('containerOpacity', value);
              }}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              checked={config.containerGradient?.enabled || false}
              onChange={(e) => handleGradientChange('enabled', e.target.checked)}
            />
            启用渐变背景
          </label>
        </div>

        {config.containerGradient?.enabled && (
          <>
            <div className={styles.field}>
              <label>起始颜色</label>
              <div className={styles.colorInput}>
                <input
                  type="color"
                  value={config.containerGradient.startColor}
                  onChange={(e) => handleGradientChange('startColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.containerGradient.startColor}
                  onChange={(e) => handleGradientChange('startColor', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>结束颜色</label>
              <div className={styles.colorInput}>
                <input
                  type="color"
                  value={config.containerGradient.endColor}
                  onChange={(e) => handleGradientChange('endColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.containerGradient.endColor}
                  onChange={(e) => handleGradientChange('endColor', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>渐变角度</label>
              <div className={styles.rangeInput}>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={config.containerGradient.angle}
                  onChange={(e) => handleGradientChange('angle', parseInt(e.target.value))}
                />
                <span>{config.containerGradient.angle}°</span>
              </div>
            </div>
          </>
        )}
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
              value={config.headerColor || '#7a8a9a'}
              onChange={(e) => handleChange('headerColor', e.target.value)}
            />
            <input
              type="text"
              value={config.headerColor || '#7a8a9a'}
              onChange={(e) => handleChange('headerColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>星期标题样式</h4>
        <div className={styles.field}>
          <label>背景颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.weekdayBackground || '#f8f9fa'}
              onChange={(e) => handleChange('weekdayBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.weekdayBackground || '#f8f9fa'}
              onChange={(e) => handleChange('weekdayBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>文字颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.weekdayColor || '#6b7280'}
              onChange={(e) => handleChange('weekdayColor', e.target.value)}
            />
            <input
              type="text"
              value={config.weekdayColor || '#6b7280'}
              onChange={(e) => handleChange('weekdayColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>日期单元格样式</h4>
        <div className={styles.field}>
          <label>单元格背景</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.dayCellBackground || '#ffffff'}
              onChange={(e) => handleChange('dayCellBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.dayCellBackground || '#ffffff'}
              onChange={(e) => handleChange('dayCellBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>悬浮背景</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.dayCellHoverBackground || '#f0f9ff'}
              onChange={(e) => handleChange('dayCellHoverBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.dayCellHoverBackground || '#f0f9ff'}
              onChange={(e) => handleChange('dayCellHoverBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>日期字体大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={config.dayNumberSize || 1}
              onChange={(e) => handleChange('dayNumberSize', parseFloat(e.target.value))}
            />
            <span>{config.dayNumberSize || 1}rem</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>日期颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.dayNumberColor || '#374151'}
              onChange={(e) => handleChange('dayNumberColor', e.target.value)}
            />
            <input
              type="text"
              value={config.dayNumberColor || '#374151'}
              onChange={(e) => handleChange('dayNumberColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>今天样式</h4>
        <div className={styles.field}>
          <label>背景颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.todayBackground || '#dbeafe'}
              onChange={(e) => handleChange('todayBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.todayBackground || '#dbeafe'}
              onChange={(e) => handleChange('todayBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>文字颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.todayColor || '#1e40af'}
              onChange={(e) => handleChange('todayColor', e.target.value)}
            />
            <input
              type="text"
              value={config.todayColor || '#1e40af'}
              onChange={(e) => handleChange('todayColor', e.target.value)}
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

export default MonthViewPanel;
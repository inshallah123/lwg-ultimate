import React from 'react';
import { Eye } from 'lucide-react';
import { MonthWeekViewConfig } from '../types';
import styles from './Panel.module.css';

interface MonthWeekViewPanelProps {
  config: MonthWeekViewConfig;
  onChange: (config: MonthWeekViewConfig) => void;
  onPreview: () => void;
}

const MonthWeekViewPanel: React.FC<MonthWeekViewPanelProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const handleChange = (key: keyof MonthWeekViewConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleGradientChange = (field: string, value: any) => {
    onChange({
      ...config,
      containerGradient: {
        ...config.containerGradient,
        enabled: config.containerGradient?.enabled || false,
        startColor: config.containerGradient?.startColor || 'rgba(168, 196, 212, 0.06)',
        endColor: config.containerGradient?.endColor || 'rgba(224, 197, 210, 0.03)',
        angle: config.containerGradient?.angle || 180,
        [field]: value
      }
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>月/周视图样式设置</h3>
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

        <div className={styles.field}>
          <label>透明度</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.containerOpacity || 1}
              onChange={(e) => handleChange('containerOpacity', parseFloat(e.target.value))}
            />
            <span>{(config.containerOpacity || 1).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>容器渐变</h4>
        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              checked={config.containerGradient?.enabled || false}
              onChange={(e) => handleGradientChange('enabled', e.target.checked)}
            />
            启用渐变
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
                  style={{ width: '160px' }}
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
                  style={{ width: '160px' }}
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
        <div className={styles.gridSection}>
          <div className={styles.field}>
            <label>字体大小</label>
            <div className={styles.rangeInput}>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.25"
                value={config.titleFontSize || 1.75}
                onChange={(e) => handleChange('titleFontSize', parseFloat(e.target.value))}
              />
              <span>{config.titleFontSize || 1.75}rem</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>字体颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.titleColor || '#2c3e50'}
                onChange={(e) => handleChange('titleColor', e.target.value)}
              />
              <input
                type="text"
                value={config.titleColor || '#2c3e50'}
                onChange={(e) => handleChange('titleColor', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>字体粗细</label>
            <div className={styles.rangeInput}>
              <input
                type="range"
                min="300"
                max="700"
                step="100"
                value={config.titleFontWeight || 400}
                onChange={(e) => handleChange('titleFontWeight', parseInt(e.target.value))}
              />
              <span>{config.titleFontWeight || 400}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>星期标题样式</h4>
        <div className={styles.gridSection}>
          <div className={styles.field}>
            <label>背景颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.weekdayBackground || '#fafbfc'}
                onChange={(e) => handleChange('weekdayBackground', e.target.value)}
              />
              <input
                type="text"
                value={config.weekdayBackground || '#fafbfc'}
                onChange={(e) => handleChange('weekdayBackground', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>字体大小</label>
            <div className={styles.rangeInput}>
              <input
                type="range"
                min="0.6"
                max="1"
                step="0.05"
                value={config.weekdayFontSize || 0.75}
                onChange={(e) => handleChange('weekdayFontSize', parseFloat(e.target.value))}
              />
              <span>{config.weekdayFontSize || 0.75}rem</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>字体颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.weekdayFontColor || '#6b7280'}
                onChange={(e) => handleChange('weekdayFontColor', e.target.value)}
              />
              <input
                type="text"
                value={config.weekdayFontColor || '#6b7280'}
                onChange={(e) => handleChange('weekdayFontColor', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>字体粗细</label>
            <div className={styles.rangeInput}>
              <input
                type="range"
                min="400"
                max="700"
                step="100"
                value={config.weekdayFontWeight || 500}
                onChange={(e) => handleChange('weekdayFontWeight', parseInt(e.target.value))}
              />
              <span>{config.weekdayFontWeight || 500}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>日期单元格样式</h4>
        <div className={styles.gridSection}>
          <div className={styles.field}>
            <label>背景颜色</label>
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
                value={config.dayCellHoverBackground || 'rgba(168, 196, 212, 0.05)'}
                onChange={(e) => handleChange('dayCellHoverBackground', e.target.value)}
              />
              <input
                type="text"
                value={config.dayCellHoverBackground || 'rgba(168, 196, 212, 0.05)'}
                onChange={(e) => handleChange('dayCellHoverBackground', e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>边框颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.dayCellBorderColor || '#f1f5f9'}
                onChange={(e) => handleChange('dayCellBorderColor', e.target.value)}
              />
              <input
                type="text"
                value={config.dayCellBorderColor || '#f1f5f9'}
                onChange={(e) => handleChange('dayCellBorderColor', e.target.value)}
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
                step="0.05"
                value={config.dayNumberFontSize || 1.125}
                onChange={(e) => handleChange('dayNumberFontSize', parseFloat(e.target.value))}
              />
              <span>{config.dayNumberFontSize || 1.125}rem</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>日期颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.dayNumberColor || '#2c3e50'}
                onChange={(e) => handleChange('dayNumberColor', e.target.value)}
              />
              <input
                type="text"
                value={config.dayNumberColor || '#2c3e50'}
                onChange={(e) => handleChange('dayNumberColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>今天样式</h4>
        <div className={styles.gridSection}>
          <div className={styles.field}>
            <label>背景颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.todayBackground || 'rgba(168, 196, 212, 0.15)'}
                onChange={(e) => handleChange('todayBackground', e.target.value)}
              />
              <input
                type="text"
                value={config.todayBackground || 'rgba(168, 196, 212, 0.15)'}
                onChange={(e) => handleChange('todayBackground', e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>边框颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.todayBorderColor || '#a8c4d4'}
                onChange={(e) => handleChange('todayBorderColor', e.target.value)}
              />
              <input
                type="text"
                value={config.todayBorderColor || '#a8c4d4'}
                onChange={(e) => handleChange('todayBorderColor', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>字体颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.todayFontColor || '#5b8dbe'}
                onChange={(e) => handleChange('todayFontColor', e.target.value)}
              />
              <input
                type="text"
                value={config.todayFontColor || '#5b8dbe'}
                onChange={(e) => handleChange('todayFontColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>农历信息样式</h4>
        <div className={styles.gridSection}>
          <div className={styles.field}>
            <label>字体大小</label>
            <div className={styles.rangeInput}>
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.05"
                value={config.lunarFontSize || 0.7}
                onChange={(e) => handleChange('lunarFontSize', parseFloat(e.target.value))}
              />
              <span>{config.lunarFontSize || 0.7}rem</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>字体颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.lunarFontColor || '#94a3b8'}
                onChange={(e) => handleChange('lunarFontColor', e.target.value)}
              />
              <input
                type="text"
                value={config.lunarFontColor || '#94a3b8'}
                onChange={(e) => handleChange('lunarFontColor', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>节日颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.festivalColor || '#d6536d'}
                onChange={(e) => handleChange('festivalColor', e.target.value)}
              />
              <input
                type="text"
                value={config.festivalColor || '#d6536d'}
                onChange={(e) => handleChange('festivalColor', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>节气颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.solarTermColor || '#4a8a73'}
                onChange={(e) => handleChange('solarTermColor', e.target.value)}
              />
              <input
                type="text"
                value={config.solarTermColor || '#4a8a73'}
                onChange={(e) => handleChange('solarTermColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthWeekViewPanel;
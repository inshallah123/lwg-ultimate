import React from 'react';
import { Eye } from 'lucide-react';
import { MonthCardConfig } from '../types';
import styles from './Panel.module.css';

interface MonthCardPanelProps {
  config: MonthCardConfig;
  onChange: (config: MonthCardConfig) => void;
  onPreview: () => void;
}

const MonthCardPanel: React.FC<MonthCardPanelProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const handleChange = (key: keyof MonthCardConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleGradientChange = (field: string, value: any) => {
    onChange({
      ...config,
      backgroundGradient: {
        ...config.backgroundGradient,
        enabled: config.backgroundGradient?.enabled || false,
        startColor: config.backgroundGradient?.startColor || '#ffffff',
        endColor: config.backgroundGradient?.endColor || '#f8fafc',
        angle: config.backgroundGradient?.angle || 135,
        [field]: value
      }
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>年视图-月份卡片样式设置</h3>
        <button className={styles.previewBtn} onClick={onPreview}>
          <Eye size={16} />
          预览
        </button>
      </div>

      <div className={styles.section}>
        <h4>通用卡片样式</h4>
        <div className={styles.field}>
          <label>背景颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.background || '#ffffff'}
              onChange={(e) => handleChange('background', e.target.value)}
            />
            <input
              type="text"
              value={config.background || '#ffffff'}
              onChange={(e) => handleChange('background', e.target.value)}
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
              value={config.opacity || 1}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
            />
            <span>{(config.opacity || 1).toFixed(1)}</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>边框颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.borderColor || '#e2e8f0'}
              onChange={(e) => handleChange('borderColor', e.target.value)}
            />
            <input
              type="text"
              value={config.borderColor || '#e2e8f0'}
              onChange={(e) => handleChange('borderColor', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>圆角</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0"
              max="16"
              step="2"
              value={config.borderRadius || 8}
              onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
            />
            <span>{config.borderRadius || 8}px</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>背景渐变</h4>
        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              checked={config.backgroundGradient?.enabled || false}
              onChange={(e) => handleGradientChange('enabled', e.target.checked)}
            />
            启用渐变
          </label>
        </div>

        {config.backgroundGradient?.enabled && (
          <>
            <div className={styles.field}>
              <label>起始颜色</label>
              <div className={styles.colorInput}>
                <input
                  type="color"
                  value={config.backgroundGradient.startColor}
                  onChange={(e) => handleGradientChange('startColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.backgroundGradient.startColor}
                  onChange={(e) => handleGradientChange('startColor', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>结束颜色</label>
              <div className={styles.colorInput}>
                <input
                  type="color"
                  value={config.backgroundGradient.endColor}
                  onChange={(e) => handleGradientChange('endColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.backgroundGradient.endColor}
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
                  value={config.backgroundGradient.angle}
                  onChange={(e) => handleGradientChange('angle', parseInt(e.target.value))}
                />
                <span>{config.backgroundGradient.angle}°</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.section}>
        <h4>文字样式</h4>
        <div className={styles.field}>
          <label>字体大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={config.fontSize || 1.8}
              onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
            />
            <span>{config.fontSize || 1.8}em</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>字体颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.fontColor || '#2c3e50'}
              onChange={(e) => handleChange('fontColor', e.target.value)}
            />
            <input
              type="text"
              value={config.fontColor || '#2c3e50'}
              onChange={(e) => handleChange('fontColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>今天所在月份样式</h4>
        
        <div className={styles.gridSection}>
          <div className={styles.field}>
            <label>背景颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.todayMonthBackground || '#e8f2fa'}
                onChange={(e) => handleChange('todayMonthBackground', e.target.value)}
              />
              <input
                type="text"
                value={config.todayMonthBackground || '#e8f2fa'}
                onChange={(e) => handleChange('todayMonthBackground', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>边框颜色</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={config.todayMonthBorderColor || '#a8c4d4'}
                onChange={(e) => handleChange('todayMonthBorderColor', e.target.value)}
              />
              <input
                type="text"
                value={config.todayMonthBorderColor || '#a8c4d4'}
                onChange={(e) => handleChange('todayMonthBorderColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>交互样式</h4>
        <div className={styles.field}>
          <label>悬浮背景</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.hoverBackground || '#f8fafc'}
              onChange={(e) => handleChange('hoverBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.hoverBackground || '#f8fafc'}
              onChange={(e) => handleChange('hoverBackground', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthCardPanel;
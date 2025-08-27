import React from 'react';
import { Eye } from 'lucide-react';
import { YearSectionConfig } from '../types';
import styles from './Panel.module.css';

interface YearSectionPanelProps {
  config: YearSectionConfig;
  onChange: (config: YearSectionConfig) => void;
  onPreview: () => void;
}

const YearSectionPanel: React.FC<YearSectionPanelProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const handleChange = (key: keyof YearSectionConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>年份区域样式设置</h3>
        <button className={styles.previewBtn} onClick={onPreview}>
          <Eye size={16} />
          预览
        </button>
      </div>

      <div className={styles.section}>
        <h4>当前年份样式</h4>
        <div className={styles.field}>
          <label>年份数字颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.currentYearBackground || '#a8c4d4'}
              onChange={(e) => handleChange('currentYearBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.currentYearBackground || '#a8c4d4'}
              onChange={(e) => handleChange('currentYearBackground', e.target.value)}
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
              value={config.currentYearOpacity || 0.1}
              onChange={(e) => handleChange('currentYearOpacity', parseFloat(e.target.value))}
            />
            <span>{(config.currentYearOpacity || 0.1).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>字体样式</h4>
        <div className={styles.field}>
          <label>字体大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="2"
              max="5"
              step="0.5"
              value={config.fontSize || 3}
              onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
            />
            <span>{config.fontSize || 3}em</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>字体颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.fontColor || '#a8c4d4'}
              onChange={(e) => handleChange('fontColor', e.target.value)}
            />
            <input
              type="text"
              value={config.fontColor || '#a8c4d4'}
              onChange={(e) => handleChange('fontColor', e.target.value)}
            />
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
              value={config.hoverBackground || '#f0f4f8'}
              onChange={(e) => handleChange('hoverBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.hoverBackground || '#f0f4f8'}
              onChange={(e) => handleChange('hoverBackground', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>选中背景</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.selectedBackground || '#e0e7ff'}
              onChange={(e) => handleChange('selectedBackground', e.target.value)}
            />
            <input
              type="text"
              value={config.selectedBackground || '#e0e7ff'}
              onChange={(e) => handleChange('selectedBackground', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearSectionPanel;
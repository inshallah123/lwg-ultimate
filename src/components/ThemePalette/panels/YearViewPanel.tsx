import React from 'react';
import { Eye } from 'lucide-react';
import { YearViewConfig } from '../types';
import styles from './Panel.module.css';

interface YearViewPanelProps {
  config: YearViewConfig;
  onChange: (config: YearViewConfig) => void;
  onPreview: () => void;
}

const YearViewPanel: React.FC<YearViewPanelProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const handleChange = (key: keyof YearViewConfig, value: any) => {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({
          ...config,
          backgroundImage: {
            enabled: true,
            url: e.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>年视图样式设置</h3>
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

        <div className={styles.field}>
          <label>圆角</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0"
              max="24"
              step="2"
              value={config.borderRadius || 12}
              onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
            />
            <span>{config.borderRadius || 12}px</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>阴影</label>
          <input
            type="text"
            className={styles.numberInput}
            style={{ width: '200px' }}
            value={config.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'}
            onChange={(e) => handleChange('boxShadow', e.target.value)}
            placeholder="0 4px 6px rgba(0, 0, 0, 0.1)"
          />
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
          <label>字体大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="1"
              max="3"
              step="0.25"
              value={config.titleFontSize || 1.5}
              onChange={(e) => handleChange('titleFontSize', parseFloat(e.target.value))}
            />
            <span>{config.titleFontSize || 1.5}rem</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>字体颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.titleColor || '#7a8a9a'}
              onChange={(e) => handleChange('titleColor', e.target.value)}
            />
            <input
              type="text"
              value={config.titleColor || '#7a8a9a'}
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
              max="900"
              step="100"
              value={config.titleFontWeight || 400}
              onChange={(e) => handleChange('titleFontWeight', parseInt(e.target.value))}
            />
            <span>{config.titleFontWeight || 400}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>背景图片</h4>
        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              checked={config.backgroundImage?.enabled || false}
              onChange={(e) => {
                onChange({
                  ...config,
                  backgroundImage: {
                    ...config.backgroundImage,
                    enabled: e.target.checked,
                    url: config.backgroundImage?.url || ''
                  }
                });
              }}
            />
            使用背景图片
          </label>
        </div>

        {config.backgroundImage?.enabled && (
          <div className={styles.field}>
            <label>上传图片</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default YearViewPanel;
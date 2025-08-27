import React from 'react';
import { Eye } from 'lucide-react';
import { GlobalStyleConfig } from '../types';
import styles from './Panel.module.css';

interface GlobalStylePanelProps {
  config: GlobalStyleConfig;
  onChange: (config: GlobalStyleConfig) => void;
  onPreview: () => void;
}

const GlobalStylePanel: React.FC<GlobalStylePanelProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const handleColorChange = (key: keyof GlobalStyleConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  const handleGradientChange = (field: string, value: any) => {
    onChange({
      ...config,
      backgroundGradient: {
        ...config.backgroundGradient,
        enabled: config.backgroundGradient?.enabled || false,
        startColor: config.backgroundGradient?.startColor || '#ffffff',
        endColor: config.backgroundGradient?.endColor || '#f0f0f0',
        angle: config.backgroundGradient?.angle || 180,
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
            url: e.target?.result as string,
            size: 'cover',
            position: 'center'
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>全局样式设置</h3>
        <button className={styles.previewBtn} onClick={onPreview}>
          <Eye size={16} />
          预览
        </button>
      </div>

      <div className={styles.section}>
        <h4>背景颜色</h4>
        <div className={styles.field}>
          <label>颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.backgroundColor || '#f8fcfb'}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
            />
            <input
              type="text"
              value={config.backgroundColor || '#f8fcfb'}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              placeholder="#f8fcfb"
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
              onChange={(e) => onChange({ ...config, opacity: parseFloat(e.target.value) })}
            />
            <span>{(config.opacity || 1).toFixed(1)}</span>
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
                    url: config.backgroundImage?.url || '',
                    size: config.backgroundImage?.size || 'cover',
                    position: config.backgroundImage?.position || 'center'
                  }
                });
              }}
            />
            使用背景图片
          </label>
        </div>

        {config.backgroundImage?.enabled && (
          <>
            <div className={styles.field}>
              <label>上传图片</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </div>

            <div className={styles.field}>
              <label>图片适应方式</label>
              <select
                value={config.backgroundImage.size}
                onChange={(e) => {
                  onChange({
                    ...config,
                    backgroundImage: {
                      enabled: config.backgroundImage?.enabled || false,
                      url: config.backgroundImage?.url || '',
                      position: config.backgroundImage?.position || 'center',
                      ...config.backgroundImage,
                      size: e.target.value as 'cover' | 'contain' | 'auto'
                    }
                  });
                }}
                className={styles.select}
              >
                <option value="cover">覆盖（自动裁剪）</option>
                <option value="contain">包含（完整显示）</option>
                <option value="auto">原始大小</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalStylePanel;
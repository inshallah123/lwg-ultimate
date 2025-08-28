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
              disabled={config.backgroundImage?.enabled}
            />
            <input
              type="text"
              value={config.backgroundColor || '#f8fcfb'}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              placeholder="#f8fcfb"
              disabled={config.backgroundImage?.enabled}
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
              value={config.opacity || 1}
              onChange={(e) => onChange({ ...config, opacity: parseFloat(e.target.value) })}
            />
            <input
              type="number"
              className={styles.numberInput}
              min="0"
              max="1"
              step="0.01"
              value={config.opacity || 1}
              onChange={(e) => {
                const value = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
                onChange({ ...config, opacity: value });
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>标题样式</h4>
        <div className={styles.field}>
          <label>标题颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.titleColor || '#2c3e50'}
              onChange={(e) => handleColorChange('titleColor', e.target.value)}
            />
            <input
              type="text"
              value={config.titleColor || '#2c3e50'}
              onChange={(e) => handleColorChange('titleColor', e.target.value)}
              placeholder="#2c3e50"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>标题大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="1"
              max="3"
              step="0.25"
              value={config.titleFontSize || 1.5}
              onChange={(e) => onChange({ ...config, titleFontSize: parseFloat(e.target.value) })}
            />
            <span>{config.titleFontSize || 1.5}rem</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>副标题颜色</label>
          <div className={styles.colorInput}>
            <input
              type="color"
              value={config.subtitleColor || '#6b7280'}
              onChange={(e) => handleColorChange('subtitleColor', e.target.value)}
            />
            <input
              type="text"
              value={config.subtitleColor || '#6b7280'}
              onChange={(e) => handleColorChange('subtitleColor', e.target.value)}
              placeholder="#6b7280"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>副标题大小</label>
          <div className={styles.rangeInput}>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={config.subtitleFontSize || 0.875}
              onChange={(e) => onChange({ ...config, subtitleFontSize: parseFloat(e.target.value) })}
            />
            <span>{config.subtitleFontSize || 0.875}rem</span>
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
              disabled={config.backgroundImage?.enabled}
            />
            启用渐变 {config.backgroundImage?.enabled && <span style={{color: '#888', fontSize: '0.9em'}}>（使用背景图片时不可用）</span>}
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
                  disabled={config.backgroundImage?.enabled}
                />
                <input
                  type="text"
                  value={config.backgroundGradient.startColor}
                  onChange={(e) => handleGradientChange('startColor', e.target.value)}
                  disabled={config.backgroundImage?.enabled}
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
                  disabled={config.backgroundImage?.enabled}
                />
                <input
                  type="text"
                  value={config.backgroundGradient.endColor}
                  onChange={(e) => handleGradientChange('endColor', e.target.value)}
                  disabled={config.backgroundImage?.enabled}
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
                  disabled={config.backgroundImage?.enabled}
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
                const newConfig = {
                  ...config,
                  backgroundImage: {
                    ...config.backgroundImage,
                    enabled: e.target.checked,
                    url: config.backgroundImage?.url || '',
                    size: config.backgroundImage?.size || 'cover',
                    position: config.backgroundImage?.position || 'center'
                  }
                };
                if (e.target.checked && config.backgroundGradient) {
                  newConfig.backgroundGradient = {
                    ...config.backgroundGradient,
                    enabled: false
                  };
                }
                onChange(newConfig);
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
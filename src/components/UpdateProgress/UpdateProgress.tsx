import React, { useEffect, useState } from 'react';
import { UpdateProgressData } from '../../types/update';
import styles from './UpdateProgress.module.css';

const UpdateProgress: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState<UpdateProgressData | null>(null);

  useEffect(() => {
    // 监听下载进度
    const handleProgress = (_event: unknown, progressData: UpdateProgressData) => {
      setProgress(progressData);
      setVisible(true);
    };

    // 监听下载完成
    const handleComplete = (_event: unknown) => {
      setTimeout(() => {
        setVisible(false);
        setProgress(null);
      }, 2000);
    };

    if (window.electronAPI?.onUpdateProgress) {
      window.electronAPI.onUpdateProgress(handleProgress);
    }
    
    if (window.electronAPI?.onUpdateComplete) {
      window.electronAPI.onUpdateComplete(handleComplete);
    }

    return () => {
      if (window.electronAPI?.removeUpdateListeners) {
        window.electronAPI.removeUpdateListeners();
      }
    };
  }, []);

  if (!visible || !progress) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  return (
    <div className={styles.updateProgress}>
      <div className={styles.progressCard}>
        <h3>正在下载更新...</h3>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        
        <div className={styles.progressInfo}>
          <span className={styles.percent}>{progress.percent.toFixed(1)}%</span>
          <span className={styles.size}>
            {formatBytes(progress.transferred || 0)} / {formatBytes(progress.total || 0)}
          </span>
          <span className={styles.speed}>{formatSpeed(progress.bytesPerSecond || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default UpdateProgress;
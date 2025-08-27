/**
 * 代理配置对话框组件
 * 作用: 提供用户界面来配置更新代理设置
 */

import React, { useState, useEffect } from 'react';
import './style.css';

interface ProxyConfig {
  enabled: boolean;
  host: string;
  port: number;
}

interface ProxyConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: ProxyConfig;
}

const ProxyConfigDialog: React.FC<ProxyConfigDialogProps> = ({ isOpen, onClose, initialConfig }) => {
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('7890');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialConfig) {
      setEnabled(initialConfig.enabled);
      setHost(initialConfig.host);
      setPort(initialConfig.port.toString());
    }
  }, [initialConfig]);

  useEffect(() => {
    // 监听主进程发送的显示代理配置消息
    const handleShowConfig = (_event: any, config: ProxyConfig) => {
      setEnabled(config.enabled);
      setHost(config.host);
      setPort(config.port.toString());
    };

    window.Electron?.ipcRenderer.on('show-proxy-config', handleShowConfig);
    
    return () => {
      window.Electron?.ipcRenderer.removeAllListeners('show-proxy-config');
    };
  }, []);

  if (!isOpen) return null;

  const handleSave = async () => {
    // 验证端口号
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('端口号必须是1-65535之间的数字');
      return;
    }

    // 验证主机地址
    if (!host.trim()) {
      setError('请输入代理服务器地址');
      return;
    }

    try {
      await window.Electron?.ipcRenderer.invoke('update:setProxy', enabled, host, portNum);
      
      // 显示成功消息
      const message = enabled 
        ? `代理已启用: ${host}:${portNum}` 
        : '代理已禁用';
      
      alert(message);
      onClose();
    } catch (_err) {
      setError('保存代理设置失败');
    }
  };

  return (
    <div className="proxy-dialog-overlay">
      <div className="proxy-dialog">
        <div className="proxy-dialog-header">
          <h2>配置更新代理</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="proxy-dialog-content">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              启用代理
            </label>
          </div>

          <div className="form-group">
            <label>代理服务器地址:</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={!enabled}
              placeholder="例如: 127.0.0.1"
            />
          </div>

          <div className="form-group">
            <label>端口:</label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={!enabled}
              placeholder="例如: 7890"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="proxy-dialog-footer">
            <button onClick={onClose}>取消</button>
            <button onClick={handleSave} className="primary">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProxyConfigDialog;
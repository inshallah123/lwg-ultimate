/**
 * 更新配置管理模块
 * 作用: 管理应用更新的配置，包括代理设置等
 */

import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

export interface UpdateConfig {
  proxy?: {
    enabled: boolean;
    host: string;
    port: number;
  };
  autoCheck?: boolean;
  checkInterval?: number; // 检查间隔（小时）
}

const DEFAULT_CONFIG: UpdateConfig = {
  proxy: {
    enabled: false,
    host: '127.0.0.1',
    port: 7890
  },
  autoCheck: true,
  checkInterval: 24
};

class UpdateConfigManager {
  private configPath: string;
  private config: UpdateConfig;

  constructor() {
    this.configPath = join(app.getPath('userData'), 'updateConfig.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): UpdateConfig {
    if (existsSync(this.configPath)) {
      try {
        const data = readFileSync(this.configPath, 'utf8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      } catch (error) {
        console.error('Failed to load update config:', error);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  }

  public getConfig(): UpdateConfig {
    return this.config;
  }

  public saveConfig(config: UpdateConfig): void {
    try {
      this.config = { ...this.config, ...config };
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save update config:', error);
    }
  }

  public getProxyUrl(): string | undefined {
    if (this.config.proxy?.enabled) {
      return `http://${this.config.proxy.host}:${this.config.proxy.port}`;
    }
    return undefined;
  }

  public setProxy(enabled: boolean, host?: string, port?: number): void {
    this.config.proxy = {
      enabled,
      host: host || this.config.proxy?.host || DEFAULT_CONFIG.proxy!.host,
      port: port || this.config.proxy?.port || DEFAULT_CONFIG.proxy!.port
    };
    this.saveConfig(this.config);
  }
}

export default new UpdateConfigManager();
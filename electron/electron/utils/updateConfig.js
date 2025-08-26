"use strict";
/**
 * 更新配置管理模块
 * 作用: 管理应用更新的配置，包括代理设置等
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const DEFAULT_CONFIG = {
    proxy: {
        enabled: false,
        host: '127.0.0.1',
        port: 7890
    },
    autoCheck: true,
    checkInterval: 24
};
class UpdateConfigManager {
    constructor() {
        this.configPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'updateConfig.json');
        this.config = this.loadConfig();
    }
    loadConfig() {
        if ((0, fs_1.existsSync)(this.configPath)) {
            try {
                const data = (0, fs_1.readFileSync)(this.configPath, 'utf8');
                return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
            }
            catch (error) {
                console.error('Failed to load update config:', error);
                return DEFAULT_CONFIG;
            }
        }
        return DEFAULT_CONFIG;
    }
    getConfig() {
        return this.config;
    }
    saveConfig(config) {
        try {
            this.config = { ...this.config, ...config };
            (0, fs_1.writeFileSync)(this.configPath, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            console.error('Failed to save update config:', error);
        }
    }
    getProxyUrl() {
        if (this.config.proxy?.enabled) {
            return `http://${this.config.proxy.host}:${this.config.proxy.port}`;
        }
        return undefined;
    }
    setProxy(enabled, host, port) {
        this.config.proxy = {
            enabled,
            host: host || this.config.proxy?.host || DEFAULT_CONFIG.proxy.host,
            port: port || this.config.proxy?.port || DEFAULT_CONFIG.proxy.port
        };
        this.saveConfig(this.config);
    }
}
exports.default = new UpdateConfigManager();
//# sourceMappingURL=updateConfig.js.map
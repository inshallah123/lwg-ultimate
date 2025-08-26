"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLunarLibraryUpdate = checkLunarLibraryUpdate;
exports.updateLunarLibrary = updateLunarLibrary;
exports.needsRestart = needsRestart;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// NPM 镜像源配置
const NPM_REGISTRIES = {
    npm: 'https://registry.npmjs.org',
    taobao: 'https://registry.npmmirror.com',
    tencent: 'https://mirrors.cloud.tencent.com/npm',
    huawei: 'https://mirrors.huaweicloud.com/repository/npm'
};
// 默认使用淘宝镜像（国内用户友好）
const DEFAULT_REGISTRY = NPM_REGISTRIES.taobao;
async function checkLunarLibraryUpdate() {
    try {
        // 读取当前版本
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const currentVersion = packageJson.dependencies['lunar-javascript']?.replace(/[\^~]/, '');
        if (!currentVersion) {
            console.log('lunar-javascript not found in dependencies');
            return null;
        }
        // 使用镜像源检查最新版本
        const registry = getRegistry();
        console.log(`使用 NPM 镜像源: ${registry}`);
        const { stdout } = await execAsync(`npm view lunar-javascript version --registry ${registry}`);
        const latestVersion = stdout.trim();
        // 比较版本
        const hasUpdate = compareVersions(currentVersion, latestVersion) < 0;
        return {
            name: 'lunar-javascript',
            currentVersion,
            latestVersion,
            hasUpdate
        };
    }
    catch (error) {
        console.error('Error checking for updates:', error);
        // 如果镜像源失败，尝试官方源
        try {
            console.log('镜像源失败，尝试官方 NPM 源...');
            const { stdout } = await execAsync(`npm view lunar-javascript version --registry ${NPM_REGISTRIES.npm}`);
            const currentVersion = await getCurrentVersion();
            const latestVersion = stdout.trim();
            return {
                name: 'lunar-javascript',
                currentVersion,
                latestVersion,
                hasUpdate: compareVersions(currentVersion, latestVersion) < 0
            };
        }
        catch (fallbackError) {
            console.error('所有源都失败:', fallbackError);
            return null;
        }
    }
}
async function updateLunarLibrary() {
    try {
        const registry = getRegistry();
        console.log(`正在使用 ${registry} 更新 lunar-javascript...`);
        const { stdout, stderr } = await execAsync(`npm install lunar-javascript@latest --registry ${registry}`);
        if (stderr && !stderr.includes('warning')) {
            console.error('Update error:', stderr);
            // 尝试使用官方源
            console.log('镜像源失败，尝试官方源...');
            const fallbackResult = await execAsync(`npm install lunar-javascript@latest --registry ${NPM_REGISTRIES.npm}`);
            if (fallbackResult.stderr && !fallbackResult.stderr.includes('warning')) {
                return false;
            }
        }
        console.log('更新完成:', stdout);
        return true;
    }
    catch (error) {
        console.error('Failed to update lunar-javascript:', error);
        return false;
    }
}
function compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1Part = v1Parts[i] || 0;
        const v2Part = v2Parts[i] || 0;
        if (v1Part < v2Part)
            return -1;
        if (v1Part > v2Part)
            return 1;
    }
    return 0;
}
// 获取当前版本
async function getCurrentVersion() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.dependencies['lunar-javascript']?.replace(/[\^~]/, '') || '';
}
// 获取配置的镜像源
function getRegistry() {
    // 可以从配置文件读取，这里先使用默认镜像
    const configPath = path.join(process.cwd(), 'mirror.config.json');
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            return config.npmRegistry || DEFAULT_REGISTRY;
        }
    }
    catch (error) {
        console.log('使用默认镜像源');
    }
    return DEFAULT_REGISTRY;
}
// 检查是否需要重启应用
function needsRestart() {
    // 如果更新了库，建议重启应用以加载新版本
    return true;
}
//# sourceMappingURL=checkUpdates.js.map
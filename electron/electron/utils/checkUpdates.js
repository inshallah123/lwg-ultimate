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
        // 检查最新版本
        const { stdout } = await execAsync('npm view lunar-javascript version');
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
        return null;
    }
}
async function updateLunarLibrary() {
    try {
        console.log('Updating lunar-javascript to latest version...');
        const { stdout, stderr } = await execAsync('npm install lunar-javascript@latest');
        if (stderr && !stderr.includes('warning')) {
            console.error('Update error:', stderr);
            return false;
        }
        console.log('Update completed:', stdout);
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
// 检查是否需要重启应用
function needsRestart() {
    // 如果更新了库，建议重启应用以加载新版本
    return true;
}
//# sourceMappingURL=checkUpdates.js.map
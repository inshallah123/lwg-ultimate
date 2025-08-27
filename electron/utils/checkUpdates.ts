import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// NPM 镜像源配置
const NPM_REGISTRIES = {
  npm: 'https://registry.npmjs.org',
  taobao: 'https://registry.npmmirror.com',
  tencent: 'https://mirrors.cloud.tencent.com/npm',
  huawei: 'https://mirrors.huaweicloud.com/repository/npm'
};

// 默认使用淘宝镜像（国内用户友好）
const DEFAULT_REGISTRY = NPM_REGISTRIES.taobao;

interface PackageInfo {
  name: string;
  currentVersion: string;
  latestVersion?: string;
  hasUpdate?: boolean;
}

export async function checkLunarLibraryUpdate(): Promise<PackageInfo | null> {
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
  } catch (error) {
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
    } catch (fallbackError) {
      console.error('所有源都失败:', fallbackError);
      return null;
    }
  }
}

export async function updateLunarLibrary(): Promise<boolean> {
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
  } catch (error) {
    console.error('Failed to update lunar-javascript:', error);
    return false;
  }
}

function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }
  
  return 0;
}

// 获取当前版本
async function getCurrentVersion(): Promise<string> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.dependencies['lunar-javascript']?.replace(/[\^~]/, '') || '';
}

// 获取配置的镜像源
function getRegistry(): string {
  // 可以从配置文件读取，这里先使用默认镜像
  const configPath = path.join(process.cwd(), 'mirror.config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.npmRegistry || DEFAULT_REGISTRY;
    }
  } catch (_error) {
    console.log('使用默认镜像源');
  }
  
  return DEFAULT_REGISTRY;
}

// 检查是否需要重启应用
export function needsRestart(): boolean {
  // 如果更新了库，建议重启应用以加载新版本
  return true;
}
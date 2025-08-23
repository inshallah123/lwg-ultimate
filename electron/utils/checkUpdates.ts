import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

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
  } catch (error) {
    console.error('Error checking for updates:', error);
    return null;
  }
}

export async function updateLunarLibrary(): Promise<boolean> {
  try {
    console.log('Updating lunar-javascript to latest version...');
    const { stdout, stderr } = await execAsync('npm install lunar-javascript@latest');
    
    if (stderr && !stderr.includes('warning')) {
      console.error('Update error:', stderr);
      return false;
    }
    
    console.log('Update completed:', stdout);
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

// 检查是否需要重启应用
export function needsRestart(): boolean {
  // 如果更新了库，建议重启应用以加载新版本
  return true;
}
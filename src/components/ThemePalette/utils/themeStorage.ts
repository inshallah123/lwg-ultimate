import { ThemeConfig, SavedTheme } from '../types';

const IPC_CHANNELS = {
  SAVE_THEME: 'theme:save',
  LOAD_THEME: 'theme:load',
  GET_THEME_LIST: 'theme:list',
  DELETE_THEME: 'theme:delete'
};

export async function saveTheme(name: string, config: ThemeConfig): Promise<void> {
  try {
    const theme: SavedTheme = {
      name,
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await window.electron.ipcRenderer.invoke(IPC_CHANNELS.SAVE_THEME, theme);
    
    if (!result.success) {
      throw new Error(result.error || '保存失败');
    }
  } catch (error) {
    console.error('保存主题失败:', error);
    throw error;
  }
}

export async function loadTheme(name: string): Promise<ThemeConfig | null> {
  try {
    const result = await window.electron.ipcRenderer.invoke(IPC_CHANNELS.LOAD_THEME, name);
    
    if (result.success && result.theme) {
      return result.theme.config;
    }
    
    return null;
  } catch (error) {
    console.error('加载主题失败:', error);
    throw error;
  }
}

export async function getThemeList(): Promise<string[]> {
  try {
    const result = await window.electron.ipcRenderer.invoke(IPC_CHANNELS.GET_THEME_LIST);
    
    if (result.success && result.themes) {
      return result.themes.map((theme: SavedTheme) => theme.name);
    }
    
    return [];
  } catch (error) {
    console.error('获取主题列表失败:', error);
    return [];
  }
}

export async function deleteTheme(name: string): Promise<void> {
  try {
    const result = await window.electron.ipcRenderer.invoke(IPC_CHANNELS.DELETE_THEME, name);
    
    if (!result.success) {
      throw new Error(result.error || '删除失败');
    }
  } catch (error) {
    console.error('删除主题失败:', error);
    throw error;
  }
}
/**
 * 清除 localStorage 中的所有事件数据
 * 可以在浏览器控制台或应用中调用
 */

export function clearAllEvents() {
  try {
    // 获取当前存储的数据
    const storageKey = 'event-storage';
    const currentData = localStorage.getItem(storageKey);
    
    if (currentData) {
      const parsed = JSON.parse(currentData);
      console.log('当前事件数量:', parsed.state?.events?.length || 0);
      
      // 保留其他状态，只清除 events
      const newData = {
        ...parsed,
        state: {
          ...parsed.state,
          events: []
        }
      };
      
      // 更新 localStorage
      localStorage.setItem(storageKey, JSON.stringify(newData));
      console.log('✅ 事件已清除');
      
      // 刷新页面以使更改生效
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } else {
      console.log('⚠️ 没有找到事件存储数据');
    }
  } catch (error) {
    console.error('❌ 清除事件失败:', error);
  }
}

// 完全清除所有事件存储（包括整个存储键）
export function clearEventStorage() {
  try {
    localStorage.removeItem('event-storage');
    console.log('✅ 事件存储已完全清除');
    
    // 刷新页面
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ 清除失败:', error);
  }
}

// 如果直接在浏览器控制台运行
if (typeof window !== 'undefined') {
  (window as any).clearAllEvents = clearAllEvents;
  (window as any).clearEventStorage = clearEventStorage;
  console.log('🔧 事件清除工具已加载');
  console.log('使用方法:');
  console.log('  clearAllEvents() - 清除所有事件但保留其他设置');
  console.log('  clearEventStorage() - 完全清除事件存储');
}
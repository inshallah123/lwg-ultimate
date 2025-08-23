/**
 * 独立的清除事件脚本
 * 可以直接在浏览器控制台中复制粘贴运行
 * 
 * 使用方法：
 * 1. 打开应用
 * 2. 按 F12 打开开发者工具
 * 3. 切换到 Console 标签
 * 4. 复制粘贴以下代码并回车运行
 */

// 清除所有事件（保留其他设置）
function clearAllEvents() {
  const storageKey = 'event-storage';
  const currentData = localStorage.getItem(storageKey);
  
  if (currentData) {
    const parsed = JSON.parse(currentData);
    const eventCount = parsed.state?.events?.length || 0;
    
    if (eventCount === 0) {
      console.log('📭 没有事件需要清除');
      return;
    }
    
    // 询问确认
    if (!confirm(`确定要清除所有 ${eventCount} 个事件吗？此操作不可恢复。`)) {
      console.log('❌ 操作已取消');
      return;
    }
    
    // 清除事件
    const newData = {
      ...parsed,
      state: {
        ...parsed.state,
        events: []
      }
    };
    
    localStorage.setItem(storageKey, JSON.stringify(newData));
    console.log(`✅ 已清除 ${eventCount} 个事件`);
    
    // 刷新页面
    location.reload();
  } else {
    console.log('⚠️ 没有找到事件存储数据');
  }
}

// 完全重置事件存储
function resetEventStorage() {
  if (!confirm('确定要完全重置事件存储吗？所有数据将被清除。')) {
    console.log('❌ 操作已取消');
    return;
  }
  
  localStorage.removeItem('event-storage');
  console.log('✅ 事件存储已完全重置');
  location.reload();
}

// 查看当前事件统计
function showEventStats() {
  const storageKey = 'event-storage';
  const currentData = localStorage.getItem(storageKey);
  
  if (currentData) {
    const parsed = JSON.parse(currentData);
    const events = parsed.state?.events || [];
    
    console.log('📊 事件统计:');
    console.log(`  总数: ${events.length}`);
    
    // 按类型统计
    const simpleEvents = events.filter(e => e.recurrence === 'none' && !e.parentId);
    const recurringParents = events.filter(e => e.recurrence !== 'none' && !e.parentId);
    
    console.log(`  简单事件 (SE): ${simpleEvents.length}`);
    console.log(`  重复母事件 (RP): ${recurringParents.length}`);
    
    // 显示重复事件详情
    if (recurringParents.length > 0) {
      console.log('\n📅 重复事件详情:');
      recurringParents.forEach(e => {
        console.log(`  - ${e.title} (${e.recurrence})`);
      });
    }
  } else {
    console.log('⚠️ 没有找到事件存储数据');
  }
}

// 自动执行显示菜单
console.log('🔧 事件管理工具已加载');
console.log('');
console.log('可用命令:');
console.log('  clearAllEvents()   - 清除所有事件');
console.log('  resetEventStorage() - 完全重置存储');
console.log('  showEventStats()   - 查看事件统计');
console.log('');

// 显示当前统计
showEventStats();
#!/usr/bin/env node

/**
 * CLI脚本 - 模拟清除localStorage事件
 * 由于我们在Node环境，无法直接访问浏览器的localStorage
 * 这个脚本会创建一个清除标记文件，应用启动时会检查并执行清除
 */

const fs = require('fs');
const path = require('path');

// 创建一个标记文件，告诉应用需要清除事件
const flagFile = path.join(__dirname, '.clear-events-flag');

console.log('🧹 准备清除所有事件...');

// 写入标记文件
fs.writeFileSync(flagFile, JSON.stringify({
  clearEvents: true,
  timestamp: new Date().toISOString(),
  message: 'Events should be cleared on next app start'
}));

console.log('✅ 已设置清除标记');
console.log('📝 说明：');
console.log('   - 已创建清除标记文件');
console.log('   - 下次启动应用时会自动清除所有事件');
console.log('   - 清除完成后标记文件会自动删除');
console.log('');
console.log('🚀 现在请重新启动应用以完成清除操作');

// 同时输出直接的控制台命令供用户手动使用
console.log('');
console.log('💡 或者你也可以在应用控制台中手动运行：');
console.log("   localStorage.setItem('event-storage', JSON.stringify({state:{events:[]},version:0})); location.reload();");
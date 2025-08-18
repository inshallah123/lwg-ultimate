/**
 * React根组件
 * 作用: 应用的主界面组件，定义整体布局和页面结构
 * 运行环境: 浏览器环境（Electron渲染进程）
 * 
 * 信息流:
 *   1. 被src/main.tsx渲染到DOM
 *   2. 导入并使用各个子组件(日历视图、事件组件等)
 *   3. 管理应用级的状态和逻辑
 *   4. 用户交互 -> 更新组件状态 -> 重新渲染UI
 * 
 * 与其他文件关系:
 *   - 被 src/main.tsx 渲染
 *   - 导入 components/ 下的各种子组件
 *   - 未来扩展: 路由管理、全局状态、主题切换等
 */
import React from 'react';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Goose Calendar</h1>
      <MonthView />
    </div>
  );
}

export default App;
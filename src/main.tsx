/**
 * React应用入口文件
 * 作用: 初始化React应用，配置全局设置，渲染根组件
 * 运行环境: 浏览器环境（Electron渲染进程）
 * 
 * 信息流:
 *   1. 被public/index.html通过script标签引入
 *   2. 查找DOM中的#root元素
 *   3. 创建React根节点并渲染App组件
 *   4. StrictMode提供开发时的额外检查和警告
 * 
 * 与其他文件关系:
 *   - 被 public/index.html 引入
 *   - 渲染 App.tsx 根组件
 *   - 被 electron/main/index.ts 间接加载
 *   - 未来可扩展: 全局样式、错误边界、路由、状态管理等
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
# 小白鹅日历 🗓️

基于 Electron、React 和 TypeScript 构建的精美桌面日历应用。

## 功能特性
- 📅 多视图模式（年视图、月视图、周视图）
- 🌙 农历显示与公历农历转换
- 📝 完整的事件管理（添加、编辑、删除）
- 🔄 支持重复事件（每日、每周、每月、每年）
- 🔍 智能事件搜索
- 💾 SQLite 本地数据持久化
- 🔄 自动更新功能
- 🌐 代理配置支持
- ⌨️ 键盘快捷键导航

## 技术栈
- **框架:** Electron 28
- **前端:** React 18 + TypeScript
- **状态管理:** Zustand
- **日期处理:** lunar-javascript（农历）
- **数据库:** SQLite3
- **构建工具:** Vite
- **自动更新:** electron-updater

## 开发
```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 打包应用
npm run dist
```

## 项目结构
```
littlewhitegoose/
├── electron/          # Electron 主进程
├── src/              # React 应用源码
│   ├── components/   # UI 组件
│   ├── stores/       # 状态管理
│   ├── utils/        # 工具函数
│   └── types/        # TypeScript 类型定义
├── public/           # 静态资源
├── dist/            # 构建输出
└── release/         # 打包输出
```

## License
MIT
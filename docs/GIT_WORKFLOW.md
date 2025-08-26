# Git分支管理策略

## 🌲 分支结构

### master (主分支)
- **用途**：稳定的生产版本
- **谁能推送**：只通过PR合并
- **何时更新**：准备发布新版本时

### dev (开发分支)  
- **用途**：日常开发
- **谁能推送**：你随时可以推送
- **何时更新**：每次开发新功能

## 📝 日常开发流程

### 1. 开发新功能
```bash
# 确保在dev分支
git checkout dev

# 开发功能...
git add .
git commit -m "添加新功能"
git push origin dev
```

### 2. 准备发布新版本
```bash
# 1. 切换到master
git checkout master

# 2. 合并dev分支
git merge dev

# 3. 更新版本号
npm version patch  # 或 minor/major

# 4. 推送并触发自动发布
git push origin master --tags

# 5. 切回dev继续开发
git checkout dev
```

## 🚀 快速命令

### 日常开发（在dev分支）
```bash
# 保存工作
git add . && git commit -m "功能描述" && git push
```

### 发布版本（合并到master）
```bash
# 一键发布脚本
git checkout master && git merge dev && npm version patch && git push origin master --tags && git checkout dev
```

## 📊 分支状态

- **当前分支**：`git branch`
- **查看所有分支**：`git branch -a`
- **切换分支**：`git checkout 分支名`

## 💡 注意事项

1. **日常开发都在dev分支**
2. **master分支只用于发布**
3. **发布后记得切回dev**
4. **重要功能可以创建feature分支**

## 🏷️ 版本号规则

- **patch** (1.0.0 → 1.0.1): Bug修复
- **minor** (1.0.0 → 1.1.0): 新功能
- **major** (1.0.0 → 2.0.0): 重大更新

## 🎯 GitHub Actions配置

当前配置：
- 推送标签到master → 自动构建发布
- 推送到dev → 不触发发布

这样可以随意在dev分支测试，不会意外发布！
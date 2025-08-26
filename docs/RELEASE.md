# 发布指南

## 自动发布流程

你的项目已经配置好了完整的自动发布系统，以下是使用步骤：

### 1. 发布新版本

#### 方式一：创建标签触发自动发布（推荐）
```bash
# 1. 更新版本号
npm version patch  # 补丁版本 1.0.0 -> 1.0.1
# 或
npm version minor  # 次要版本 1.0.0 -> 1.1.0
# 或
npm version major  # 主要版本 1.0.0 -> 2.0.0

# 2. 推送代码和标签
git push origin master
git push origin --tags
```

GitHub Actions会自动：
- 在Windows、Mac、Linux上构建应用
- 生成对应平台的安装包
- 创建GitHub Release
- 上传所有安装文件

#### 方式二：手动触发工作流
1. 访问 https://github.com/inshallah123/lwg-ultimate/actions
2. 选择 "Build and Release" 工作流
3. 点击 "Run workflow"
4. 选择分支并运行

### 2. 本地手动打包

```bash
# Windows版本
npm run dist:win

# Mac版本
npm run dist:mac  

# Linux版本
npm run dist:linux

# 所有平台
npm run dist
```

打包完成后，文件在`release`目录下。

### 3. 用户自动更新流程

用户安装你的应用后：
1. 应用启动3秒后自动检查更新
2. 发现新版本会弹窗提示
3. 用户确认后后台下载
4. 下载完成提示重启应用
5. 重启后自动安装新版本

### 4. GitHub配置要求

确保GitHub仓库设置：
1. Settings -> Actions -> General -> Workflow permissions
   - 选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

2. 如果需要Mac代码签名（可选）：
   - Settings -> Secrets and variables -> Actions
   - 添加 `MAC_CERTS`（证书base64）
   - 添加 `MAC_CERTS_PASSWORD`（证书密码）

### 5. 版本管理建议

- **补丁版本**（1.0.x）：Bug修复
- **次要版本**（1.x.0）：新功能，向后兼容
- **主要版本**（x.0.0）：重大更改，可能不兼容

### 6. 更新日志

每次发布时，GitHub会自动生成更新日志。你也可以在Release页面手动编辑。

---

## 问题排查

### 自动更新不工作？
1. 检查是否在开发模式（npm run dev）
2. 确认GitHub Release已发布（不是Draft）
3. 检查网络连接

### 打包失败？
1. 确保已运行 `npm install`
2. 检查 `npm run build` 是否成功
3. Windows需要管理员权限

### Mac签名问题？
- 不签名也可以打包，用户需要在系统偏好设置中允许运行

---

配置已完成！GitHub用户名：inshallah123
仓库地址：https://github.com/inshallah123/lwg-ultimate
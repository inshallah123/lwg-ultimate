# 应用图标设置指南

## 图标文件要求

你需要准备以下格式的图标文件，放在 `build/icons/` 目录下：

### Windows (必需)
- **icon.ico** - Windows图标文件
  - 推荐包含多种尺寸：16x16, 32x32, 48x48, 64x64, 128x128, 256x256
  - 使用工具：可以用在线转换器或Photoshop生成

### macOS (可选)
- **icon.icns** - macOS图标文件
  - 需要包含多种尺寸的图标
  - 使用工具：可以用iconutil命令行工具生成

### Linux (可选)
- **256x256.png** - Linux图标文件
- 其他尺寸：512x512.png, 1024x1024.png

## 快速制作图标

### 方法1：使用在线工具（推荐）

1. 准备一个高清PNG图片（建议1024x1024像素）
2. 访问在线转换工具：
   - https://cloudconvert.com/png-to-ico
   - https://www.icoconverter.com/
   - https://convertio.co/zh/png-ico/

3. 上传PNG图片，转换为ICO格式
4. 下载并重命名为 `icon.ico`
5. 放入 `build/icons/` 目录

### 方法2：使用electron-icon-builder（自动生成所有格式）

```bash
# 安装工具
npm install -g electron-icon-builder

# 准备一个 icon.png (1024x1024) 放在项目根目录
# 然后运行
electron-icon-builder --input=icon.png --output=build/icons
```

### 方法3：使用图像编辑软件

1. **Photoshop**：
   - 创建256x256的图像
   - 保存为ICO格式

2. **GIMP**（免费）：
   - 创建多个图层（不同尺寸）
   - 导出为ICO格式

## 应用图标到项目

1. 将制作好的 `icon.ico` 放入 `build/icons/` 目录
2. 重新打包应用：
   ```bash
   npm run dist:win
   ```

## 图标显示位置

设置完成后，图标会显示在：
- Windows任务栏
- Windows开始菜单
- 桌面快捷方式
- 安装程序
- 应用窗口左上角

## 注意事项

1. ICO文件必须包含至少256x256的图标，否则Windows 10可能显示模糊
2. 透明背景的PNG转换效果更好
3. 避免过于复杂的图案，小尺寸时可能无法识别
4. 建议使用方形图标，会自动适配各种显示场景

## 测试图标

打包完成后检查：
1. 安装程序的图标
2. 桌面快捷方式的图标
3. 任务栏的图标
4. 窗口左上角的图标

如果某处图标未更新，可能需要：
- 清理Windows图标缓存
- 重启电脑
- 卸载旧版本后重新安装
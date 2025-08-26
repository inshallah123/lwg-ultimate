# 镜像和代理配置指南

本应用支持配置国内镜像源和代理，以改善在中国大陆的访问速度。

## 配置文件

配置文件位置：`mirror.config.json`（项目根目录）

## 配置说明

### 1. NPM 镜像源配置

用于节假日数据库（lunar-javascript）的更新。

```json
{
  "npmRegistry": "https://registry.npmmirror.com"
}
```

可选镜像源：
- `https://registry.npmjs.org` - NPM 官方源（国外）
- `https://registry.npmmirror.com` - 淘宝镜像（推荐）
- `https://mirrors.cloud.tencent.com/npm` - 腾讯云镜像
- `https://mirrors.huaweicloud.com/repository/npm` - 华为云镜像

### 2. GitHub 代理配置

用于应用自动更新（从 GitHub Release 下载）。

```json
{
  "githubProxy": "http://127.0.0.1:7890"
}
```

注意：
- 请根据您的代理软件配置相应的地址和端口
- 支持 HTTP 和 SOCKS 代理
- 留空则使用直连

## 完整配置示例

```json
{
  "npmRegistry": "https://registry.npmmirror.com",
  "githubProxy": "http://127.0.0.1:7890",
  "comment": "配置说明文件"
}
```

## 用户使用说明

### 方式一：修改配置文件

1. 在应用安装目录找到 `mirror.config.json` 文件
2. 根据需要修改镜像源或代理配置
3. 重启应用使配置生效

### 方式二：命令行设置代理（临时）

在 PowerShell 中运行应用前设置：

```powershell
# 设置 HTTP 代理
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"

# 运行应用
./小白鹅日历.exe
```

## 故障排查

### 节假日数据更新失败
1. 检查网络连接
2. 尝试切换不同的 NPM 镜像源
3. 查看控制台日志了解具体错误

### 应用更新失败
1. 检查是否能访问 GitHub
2. 配置正确的代理地址
3. 确保代理软件正在运行

## 技术细节

- 节假日数据更新会自动回退：如果镜像源失败，会尝试使用官方源
- 应用启动时自动读取配置文件
- 配置更改需要重启应用才能生效
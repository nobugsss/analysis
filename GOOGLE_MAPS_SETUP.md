<!--
 * @Author: boykaaa
 * @Date: 2025-10-16 16:19:26
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 16:19:35
 * @description:
 * @param:
 * @return:
-->

# Google Maps API密钥配置指南

## 问题说明

如果您看到以下错误：

```
Google Maps JavaScript API error: InvalidKeyMapError
```

这表示Google Maps API密钥未正确配置。

## 解决步骤

### 1. 获取Google Maps API密钥

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 在左侧菜单中，选择 "APIs & Services" > "Library"
4. 搜索 "Maps JavaScript API" 并启用
5. 选择 "APIs & Services" > "Credentials"
6. 点击 "Create Credentials" > "API Key"
7. 复制生成的API密钥

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# Google Maps API密钥
GOOGLE_MAPS_API_KEY=您的实际API密钥

# 服务器端口
PORT=3000
```

### 3. 重新启动服务

```bash
# 停止当前服务（Ctrl+C）
# 重新启动
npm run ip-analyze -- --input examples/sample.log --map --port 3000
```

### 4. 访问地图

打开浏览器访问：http://localhost:3000

## 安全建议

- **设置HTTP引用限制**：在Google Cloud Console中限制API密钥只能从特定域名使用
- **定期轮换密钥**：定期更新API密钥以提高安全性
- **监控使用情况**：定期检查API使用量和费用

## 常见问题

### Q: API密钥无效

A: 确保已启用 "Maps JavaScript API" 服务

### Q: 地图不显示

A: 检查浏览器控制台是否有错误信息，确认API密钥正确

### Q: 配额超限

A: 在Google Cloud Console中检查API配额使用情况

## 费用说明

Google Maps JavaScript API有免费配额：

- 每月前28,000次地图加载免费
- 超出部分按使用量收费

建议设置预算警报以避免意外费用。

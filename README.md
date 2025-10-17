# Analysis Tools

TypeScript工具集，包含以下功能：

## 功能模块

### 1. JSON文件验证器

- 验证文件是否为有效的JSON格式
- 支持批量验证
- 提供详细的错误信息

### 2. 简繁中文转换工具

- 简体中文转繁体中文
- 繁体中文转简体中文
- 支持多种地区变体（台湾、香港、日本汉字）
- 基于opencc-js库，提供高质量转换
- 支持文件和目录批量转换
- 命令行界面

### 3. IP日志分析器

- 解析不同IP的日志文件
- 根据IP区域进行聚合统计
- 支持多种日志格式

### 4. IP日志分析器

- 解析IP日志文件，提取IP地址
- 获取IP地址的省市地理信息
- 筛选出中国IP地址
- 生成详细的统计报告
- 支持Google地图可视化

### 5. 中国地图IP可视化

- 在地图上显示中国IP分布
- 支持热力图显示
- Web界面展示
- 实时数据更新

## 快速开始

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **构建项目**
   ```bash
   pnpm run build
   ```

3. **运行示例**
   ```bash
   # IP日志分析并启动地图可视化
   pnpm run ip-analyze --input examples/sample.log --map --port 3000
   ```

4. **访问地图可视化**
   - 打开浏览器访问 `http://localhost:3000`
   - 查看中国IP地址分布地图

## 安装依赖

推荐使用 pnpm（更快、更节省空间），但也支持其他包管理器：

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

## Google Maps API密钥配置

在使用地图可视化功能前，需要配置Google Maps API密钥。

### 快速配置

1. 创建 `.env` 文件：

```bash
GOOGLE_MAPS_API_KEY=您的实际API密钥
PORT=3000
```

2. 获取API密钥：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 启用 "Maps JavaScript API"
   - 创建API密钥

3. 重新启动服务

### API密钥格式

Google Maps API密钥通常以 `AIza` 开头，长度为39个字符。


## 构建和运行

### 构建项目

```bash
# 使用 pnpm（推荐）
pnpm run build

# 或使用 npm
npm run build

# 或使用 yarn
yarn build
```

### 运行项目

```bash
# 运行主程序（显示帮助信息）
pnpm start

# 运行特定命令
pnpm run validate examples/valid.json
pnpm run convert --input examples/simplified.txt --output examples/traditional.txt --mode s2t
pnpm run ip-analyze --input examples/sample.log --map --port 3000
```

## 使用方法

### JSON验证

```bash
# 验证单个文件
pnpm run validate examples/valid.json

# 验证多个文件（递归）
pnpm run validate examples/ --recursive

# 显示详细信息
pnpm run validate examples/valid.json --verbose
```

### 简繁转换

```bash
# 基本用法
pnpm run convert --input <input-file> --output <output-file> --mode <mode>

# 递归转换目录
pnpm run convert --input <input-dir> --output <output-dir> --mode <mode> --recursive
```

**支持的转换模式：**

- `s2t` - 简体转繁体
- `t2s` - 繁体转简体
- `s2tw` - 简体转台湾繁体
- `s2hk` - 简体转香港繁体
- `s2twp` - 简体转台湾繁体(短语)
- `t2tw` - 繁体转台湾繁体
- `t2hk` - 繁体转香港繁体
- `t2jp` - 繁体转日文汉字
- `jp2t` - 日文汉字转繁体

**示例：**

```bash
# 简体转繁体
pnpm run convert --input examples/simplified.txt --output examples/traditional.txt --mode s2t

# 繁体转简体
pnpm run convert --input examples/traditional.txt --output examples/simplified.txt --mode t2s

# 简体转台湾繁体
pnpm run convert --input examples/simplified.txt --output examples/taiwan.txt --mode s2tw

# 简体转香港繁体
pnpm run convert --input examples/simplified.txt --output examples/hongkong.txt --mode s2hk

# 简体转台湾繁体(短语)
pnpm run convert --input examples/simplified.txt --output examples/taiwan-phrase.txt --mode s2twp

# 繁体转台湾繁体
pnpm run convert --input examples/traditional.txt --output examples/taiwan-from-trad.txt --mode t2tw

# 繁体转香港繁体
pnpm run convert --input examples/traditional.txt --output examples/hongkong-from-trad.txt --mode t2hk

# 繁体转日文汉字
pnpm run convert --input examples/traditional.txt --output examples/japanese.txt --mode t2jp

# 日文汉字转繁体
pnpm run convert --input examples/japanese.txt --output examples/japanese-to-trad.txt --mode jp2t
```

**完整示例：**
假设有一个简体中文文件 `input.txt` 内容如下：

```
这是一个简体中文的示例文件。
计算机软件硬件数据信息。
网络系统程序管理功能。
```

使用不同模式转换后的结果：

| 模式    | 输出示例                                                                           |
| ------- | ---------------------------------------------------------------------------------- |
| `s2t`   | 這是一個簡體中文的示例文件。<br>計算機軟件硬件數據信息。<br>網絡系統程序管理功能。 |
| `s2tw`  | 這是一個簡體中文的示例檔案。<br>電腦軟體硬體資料資訊。<br>網路系統程式管理功能。   |
| `s2hk`  | 這是一個簡體中文的示例檔案。<br>電腦軟件硬件數據信息。<br>網絡系統程式管理功能。   |
| `s2twp` | 這是一個簡體中文的示例檔案。<br>電腦軟體硬體資料資訊。<br>網路系統程式管理功能。   |

### 日志分析

```bash
# 基本日志分析
pnpm run analyze --input <log-file> --output <result-file>

# 指定输出格式
pnpm run analyze --input <log-file> --output <result-file> --format json
pnpm run analyze --input <log-file> --output <result-file> --format csv
```

### IP日志分析

```bash
# 基本分析
pnpm run ip-analyze --input <log-file>

# 保存分析结果
pnpm run ip-analyze --input <log-file> --output <result-file>

# 显示详细信息
pnpm run ip-analyze --input <log-file> --verbose

# 分析并启动地图可视化
pnpm run ip-analyze --input <log-file> --map --port 3000
```

**示例：**

```bash
# 分析日志文件
pnpm run ip-analyze --input examples/sample.log --verbose

# 分析并在地图上可视化
pnpm run ip-analyze --input examples/sample.log --map --port 3000
```

### 地图可视化

```bash
# 启动地图服务
pnpm run map --port 3000

# 指定数据文件
pnpm run map --port 3000 --file public/data/china-ips.json
```

## 项目结构

```
src/
├── cli/                 # 命令行工具
│   ├── json-validator.ts
│   ├── chinese-converter.ts
│   ├── log-analyzer.ts
│   ├── ip-log-analyzer.ts
│   └── map-visualizer.ts
├── modules/             # 核心功能模块
│   ├── json-validator.ts
│   ├── chinese-converter.ts
│   ├── log-parser.ts
│   ├── ip-log-analyzer.ts
│   ├── map-server.ts
│   └── map-visualizer.ts
├── utils/               # 工具函数
│   └── index.ts
├── web/                 # Web界面
│   ├── server.ts
│   ├── public/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── views/
├── index.ts             # 主入口文件
dist/                    # 编译输出目录
tests/                   # 测试文件
examples/                # 示例文件
```

## 开发环境

### 开发模式

```bash
# 使用 pnpm（推荐）
pnpm run dev          # 构建并运行项目
pnpm run watch        # 监听模式（自动重新编译）

# 或使用 npm
npm run dev
npm run watch

# 或使用 yarn
yarn dev
yarn watch
```

### 开发说明

- 项目使用 **CommonJS** 模块系统以确保兼容性
- 开发模式会自动构建项目然后运行
- 使用 `pnpm run watch` 可以监听文件变化并自动重新编译
- 所有 CLI 工具都可以独立运行

## 测试

```bash
# 使用 pnpm（推荐）
pnpm test

# 或使用 npm
npm test

# 或使用 yarn
yarn test
```

## TypeScript配置

项目使用TypeScript 5.2+，包含以下配置文件：

- `tsconfig.json` - 开发环境配置（CommonJS模块）
- `tsconfig.build.json` - 构建环境配置
- `jest.config.js` - 测试配置

### 主要特性

- 严格模式
- ES2020目标
- CommonJS模块系统
- 声明文件生成
- 源码映射
- 路径解析

## 故障排除

### 常见问题

1. **模块导入错误**
   ```bash
   Error: Cannot find module '...'
   ```
   - 确保已运行 `pnpm run build`
   - 检查文件路径是否正确

2. **Google Maps API 密钥问题**
   ```bash
   Google Maps API密钥未配置
   ```
   - 检查 `.env` 文件是否存在
   - 确保 `GOOGLE_MAPS_API_KEY` 已正确设置
   - API密钥应以 `AIza` 开头，长度为39个字符

3. **端口占用问题**
   ```bash
   Error: listen EADDRINUSE: address already in use :::3000
   ```
   - 使用不同的端口：`--port 3001`
   - 或者停止占用端口的进程

4. **依赖安装问题**
   ```bash
   Error: Cannot find module 'ts-jest'
   ```
   - 运行 `pnpm install` 重新安装依赖
   - 确保使用正确的包管理器

### 调试模式

```bash
# 显示详细输出
pnpm run ip-analyze --input examples/sample.log --verbose

# 查看构建输出
pnpm run build --verbose
```

## 示例文件

查看 `examples/` 目录中的示例文件：

- `valid.json` - 有效的JSON文件示例
- `invalid.json` - 无效的JSON文件示例
- `sample.log` - 日志文件示例
- `simplified.txt` - 简体中文文件示例
- `traditional.txt` - 繁体中文文件示例

### 完整示例

```bash
# 1. JSON验证示例
pnpm run validate examples/valid.json
pnpm run validate examples/invalid.json

# 2. 简繁转换示例
pnpm run convert --input examples/simplified.txt --output examples/traditional.txt --mode s2t

# 3. IP日志分析示例
pnpm run ip-analyze --input examples/sample.log --verbose

# 4. 地图可视化示例
pnpm run ip-analyze --input examples/sample.log --map --port 3000
# 然后访问 http://localhost:3000
```

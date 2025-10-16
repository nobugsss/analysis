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

## 安装依赖

```bash
npm install
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

### 快速设置

运行以下命令进行快速设置：

```bash
npm run setup-maps
```

## 构建项目

```bash
npm run build
```

## 使用方法

### JSON验证

```bash
npm run validate <file-path>
# 或
npx ts-node src/cli/json-validator.ts <file-path>
```

### 简繁转换

```bash
npm run convert -- --input <input-file> --output <output-file> --mode <mode>
# 或
npx ts-node src/cli/chinese-converter.ts --input <input-file> --output <output-file> --mode <mode>
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
npm run convert -- --input examples/simplified.txt --output examples/traditional.txt --mode s2t

# 繁体转简体
npm run convert -- --input examples/traditional.txt --output examples/simplified.txt --mode t2s

# 简体转台湾繁体
npm run convert -- --input examples/simplified.txt --output examples/taiwan.txt --mode s2tw

# 简体转香港繁体
npm run convert -- --input examples/simplified.txt --output examples/hongkong.txt --mode s2hk

# 简体转台湾繁体(短语)
npm run convert -- --input examples/simplified.txt --output examples/taiwan-phrase.txt --mode s2twp

# 繁体转台湾繁体
npm run convert -- --input examples/traditional.txt --output examples/taiwan-from-trad.txt --mode t2tw

# 繁体转香港繁体
npm run convert -- --input examples/traditional.txt --output examples/hongkong-from-trad.txt --mode t2hk

# 繁体转日文汉字
npm run convert -- --input examples/traditional.txt --output examples/japanese.txt --mode t2jp

# 日文汉字转繁体
npm run convert -- --input examples/japanese.txt --output examples/japanese-to-trad.txt --mode jp2t
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
npm run analyze -- --input <log-file> --output <result-file>
# 或
npx ts-node src/cli/log-analyzer.ts --input <log-file> --output <result-file>
```

### IP日志分析

```bash
# 分析日志文件
npm run ip-analyze -- --input <log-file> --output <result-file>

# 分析并启动地图可视化
npm run ip-analyze -- --input <log-file> --map --port 3000

# 显示详细信息
npm run ip-analyze -- --input <log-file> --verbose
```

**示例：**

```bash
# 分析日志文件
npm run ip-analyze -- --input examples/sample.log --verbose

# 分析并在地图上可视化
npm run ip-analyze -- --input examples/sample.log --map --port 3000
```

### 地图可视化

```bash
npm run map -- --port 3000
# 或
npx ts-node src/cli/map-visualizer.ts --port 3000
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

## 开发

```bash
# 开发模式（使用ts-node）
npm run dev

# 监听模式（自动重新编译）
npm run watch
```

## 测试

```bash
npm test
```

## TypeScript配置

项目使用TypeScript 5.2+，配置文件为 `tsconfig.json`，包含以下特性：

- 严格模式
- ES2020目标
- 声明文件生成
- 源码映射
- 路径解析

## 示例

查看 `examples/` 目录中的示例文件：

- `valid.json` - 有效的JSON文件示例
- `invalid.json` - 无效的JSON文件示例
- `sample.log` - 日志文件示例
- `simplified.txt` - 简体中文文件示例

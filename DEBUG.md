
# 调试快速入门

## 开始调试

1. **打开项目**：在 VS Code 中打开项目文件夹
2. **设置断点**：在 `src/cli/json-validator.ts` 第34行点击行号左侧
3. **启动调试**：按 `F5`，选择 "Debug JSON Validator"
4. **开始调试**：程序会在断点处暂停，可以查看变量、单步执行

## 📋 调试配置说明

### launch.json 文件详解

项目根目录下的 `.vscode/launch.json` 文件包含了所有调试配置。这个文件告诉 VS Code 如何启动和调试你的程序。

**文件位置**：`.vscode/launch.json`

**文件作用**：
- 定义调试会话的启动方式
- 指定要调试的文件和参数
- 配置调试环境（Node.js、TypeScript等）

### 预配置的调试选项

项目已预配置以下调试选项：

- **Debug JSON Validator** - 调试JSON验证功能
- **Debug Chinese Converter** - 调试简繁转换功能  
- **Debug IP Log Analyzer** - 调试IP日志分析功能
- **Debug Main Program** - 调试主程序

### launch.json 文件内容示例

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug JSON Validator",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/cli/json-validator.ts",
      "args": ["examples/valid.json"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 配置参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `name` | 调试配置的名称 | "Debug JSON Validator" |
| `type` | 调试器类型 | "node" (Node.js调试器) |
| `request` | 请求类型 | "launch" (启动新进程) |
| `program` | 要调试的主文件 | "${workspaceFolder}/src/cli/json-validator.ts" |
| `args` | 传递给程序的参数 | ["examples/valid.json"] |
| `runtimeArgs` | Node.js运行时参数 | ["-r", "ts-node/register"] |
| `env` | 环境变量 | {"TS_NODE_PROJECT": "tsconfig.json"} |
| `console` | 控制台类型 | "integratedTerminal" |

### 自定义调试配置

如果你想调试其他文件或添加新的调试配置：

1. **打开 launch.json**：
   ```bash
   # 在 VS Code 中打开
   code .vscode/launch.json
   ```

2. **添加新配置**：
   ```json
   {
     "name": "Debug My Custom Script",
     "type": "node",
     "request": "launch",
     "program": "${workspaceFolder}/src/my-script.ts",
     "args": ["--input", "data.txt", "--output", "result.json"],
     "runtimeArgs": ["-r", "ts-node/register"],
     "env": {
       "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json"
     },
     "console": "integratedTerminal"
   }
   ```

3. **保存文件**：按 `Ctrl+S` 保存

4. **使用新配置**：按 `F5`，选择你新添加的配置

### 实际使用场景

**场景1：调试简繁转换功能**
```json
{
  "name": "Debug Chinese Converter",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/src/cli/chinese-converter.ts",
  "args": ["--input", "examples/simplified.txt", "--output", "debug-output.txt", "--mode", "s2t"],
  "runtimeArgs": ["-r", "ts-node/register"],
  "env": {
    "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json"
  },
  "console": "integratedTerminal"
}
```

**场景2：调试IP日志分析功能**
```json
{
  "name": "Debug IP Log Analyzer",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/src/cli/ip-log-analyzer.ts",
  "args": ["--input", "examples/sample.log", "--verbose"],
  "runtimeArgs": ["-r", "ts-node/register"],
  "env": {
    "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json"
  },
  "console": "integratedTerminal"
}
```

**场景3：调试自定义脚本**
```json
{
  "name": "Debug Custom Script",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/src/my-custom-script.ts",
  "args": ["--config", "config.json", "--debug"],
  "runtimeArgs": ["-r", "ts-node/register"],
  "env": {
    "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json",
    "NODE_ENV": "development"
  },
  "console": "integratedTerminal"
}
```

### 常用变量说明

- `${workspaceFolder}` - 项目根目录路径
- `${file}` - 当前打开的文件路径
- `${fileBasename}` - 当前文件的文件名
- `${fileDirname}` - 当前文件的目录路径

## 🎯 常用调试操作

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 设置断点 | `F9` | 在行号左侧点击或按F9 |
| 启动调试 | `F5` | 开始调试会话 |
| 继续执行 | `F5` | 从断点继续执行 |
| 单步跳过 | `F10` | 执行下一行，跳过函数调用 |
| 单步进入 | `F11` | 执行下一行，进入函数内部 |
| 停止调试 | `Shift+F5` | 停止当前调试会话 |

## 🔧 故障排除

**断点不生效？**
- 确保使用 `F5` 启动调试，而不是直接运行文件
- 检查断点是否设置在可执行代码行
- 确保选择了正确的调试配置

**调试器无法连接？**
- 确保项目依赖已安装：`pnpm install`
- 重启 VS Code 后重试
- 检查 `.vscode/launch.json` 文件是否存在

**launch.json 配置错误？**
- 检查 JSON 语法是否正确（注意逗号、引号）
- 确保 `program` 路径指向正确的文件
- 验证 `args` 参数格式是否正确
- 检查 `runtimeArgs` 是否包含 `-r ts-node/register`

**找不到调试配置？**
- 确保 `.vscode/launch.json` 文件在项目根目录
- 检查文件内容是否包含 `configurations` 数组
- 重启 VS Code 后重试

## 💡 调试技巧

- **条件断点**：右键断点，设置条件（如 `inputPath.includes('test')`）
- **监视变量**：在调试面板添加要监视的变量
- **控制台**：调试时可以在控制台执行代码
- **日志断点**：右键断点选择"编辑断点"，输出日志而不暂停

## 📚 更多帮助

- 查看 README.md 中的"调试指南"部分
- VS Code 调试文档：https://code.visualstudio.com/docs/editor/debugging
- Node.js 调试文档：https://nodejs.org/en/docs/guides/debugging-getting-started

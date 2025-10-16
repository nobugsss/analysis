"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 12:05:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:49:46
 * @description: 主入口文件
 * @param:
 * @return:
 */
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
// 导入各个模块
require("./cli/json-validator");
require("./cli/chinese-converter");
require("./cli/log-analyzer");
require("./cli/map-visualizer");
commander_1.program.name("analysis-tools").description("TypeScript工具集：JSON验证、简繁转换、IP日志分析、地图可视化").version("1.0.0");
commander_1.program
    .command("validate <path>")
    .description("验证JSON文件的有效性")
    .option("-r, --recursive", "递归验证子目录")
    .option("-v, --verbose", "显示详细信息")
    .action(async (_path, _options) => {
    console.log(chalk_1.default.blue("使用JSON验证器..."));
    // 这里可以调用验证器
});
commander_1.program
    .command("convert")
    .description("简繁中文转换工具")
    .requiredOption("-i, --input <path>", "输入文件或目录路径")
    .requiredOption("-o, --output <path>", "输出文件或目录路径")
    .requiredOption("-m, --mode <mode>", "转换模式: simplified(简体转繁体) 或 traditional(繁体转简体)")
    .option("-v, --verbose", "显示详细信息")
    .action(async (_options) => {
    console.log(chalk_1.default.blue("使用简繁转换器..."));
    // 这里可以调用转换器
});
commander_1.program
    .command("analyze")
    .description("IP日志分析工具")
    .requiredOption("-i, --input <path>", "输入日志文件路径")
    .requiredOption("-o, --output <path>", "输出结果文件路径")
    .option("-f, --format <format>", "输出格式: json, csv", "json")
    .option("-v, --verbose", "显示详细信息")
    .action(async (_options) => {
    console.log(chalk_1.default.blue("使用日志分析器..."));
    // 这里可以调用分析器
});
commander_1.program
    .command("map")
    .description("中国地图IP可视化工具")
    .option("-p, --port <port>", "服务器端口", "3000")
    .option("-f, --file <file>", "要可视化的数据文件路径")
    .action(async (_options) => {
    console.log(chalk_1.default.blue("使用地图可视化器..."));
    // 这里可以调用可视化器
});
// 如果没有提供命令，显示帮助信息
if (process.argv.length <= 2) {
    console.log(chalk_1.default.blue("\n=== Analysis Tools ==="));
    console.log(chalk_1.default.green("TypeScript工具集：JSON验证、简繁转换、IP日志分析、地图可视化\n"));
    console.log(chalk_1.default.yellow("可用命令:"));
    console.log("  validate <path>     验证JSON文件的有效性");
    console.log("  convert            简繁中文转换工具");
    console.log("  analyze            IP日志分析工具");
    console.log("  map                中国地图IP可视化工具\n");
    console.log(chalk_1.default.cyan("使用 --help 查看详细帮助信息"));
    console.log(chalk_1.default.cyan("例如: npm run validate -- --help"));
}
commander_1.program.parse();
//# sourceMappingURL=index.js.map
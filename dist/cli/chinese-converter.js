"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:50:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:50:00
 * @description: 简繁转换命令行工具
 * @param:
 * @return:
 */
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs-extra"));
const chinese_converter_1 = require("../modules/chinese-converter");
commander_1.program
    .name("chinese-converter")
    .description("简繁中文转换工具")
    .version("1.0.0")
    .requiredOption("-i, --input <path>", "输入文件或目录路径")
    .requiredOption("-o, --output <path>", "输出文件或目录路径")
    .requiredOption("-m, --mode <mode>", "转换模式: s2t(简体转繁体), t2s(繁体转简体), s2tw(简体转台湾繁体), s2hk(简体转香港繁体), s2twp(简体转台湾繁体短语), t2tw(繁体转台湾繁体), t2hk(繁体转香港繁体), t2jp(繁体转日文汉字), jp2t(日文汉字转繁体)", "s2t")
    .option("-r, --recursive", "递归处理子目录")
    .option("-v, --verbose", "显示详细信息")
    .action(async (options) => {
    const spinner = (0, ora_1.default)("正在转换文件...").start();
    try {
        // 检查输入路径是否存在
        await fs.access(options.input);
        const inputStats = await fs.stat(options.input);
        if (!inputStats.isFile() && !inputStats.isDirectory()) {
            spinner.fail("无效的输入路径");
            process.exit(1);
        }
        // 验证转换模式
        if (!Object.values(chinese_converter_1.ConvertMode).includes(options.mode)) {
            spinner.fail("无效的转换模式，请使用: s2t, t2s, s2tw, s2hk, s2twp, t2tw, t2hk, t2jp, jp2t");
            process.exit(1);
        }
        let results = [];
        if (inputStats.isFile()) {
            // 转换单个文件
            const result = await chinese_converter_1.ChineseConverter.convertFile(options.input, options.output, options.mode);
            results = [result];
        }
        else if (inputStats.isDirectory()) {
            // 转换目录
            results = await chinese_converter_1.ChineseConverter.convertDirectory(options.input, options.output, options.mode);
        }
        spinner.stop();
        // 显示结果
        const statsInfo = chinese_converter_1.ChineseConverter.getStats(results);
        console.log(chalk_1.default.blue("\n=== 转换结果 ==="));
        console.log(chalk_1.default.green(`总计: ${statsInfo.total} 个文件`));
        console.log(chalk_1.default.green(`成功: ${statsInfo.success} 个文件`));
        console.log(chalk_1.default.red(`失败: ${statsInfo.failed} 个文件`));
        console.log(chalk_1.default.yellow(`成功率: ${statsInfo.successPercentage}%`));
        if (options.verbose) {
            console.log(chalk_1.default.blue("\n=== 详细信息 ==="));
            results.forEach((result) => {
                if (result.success) {
                    console.log(chalk_1.default.green(`✓ ${result.inputPath} -> ${result.outputPath}`));
                    console.log(`  大小: ${result.size} 字符`);
                }
                else {
                    console.log(chalk_1.default.red(`✗ ${result.inputPath}`));
                    console.log(`  错误: ${result.error}`);
                }
            });
        }
        // 如果有失败的文件，退出码为1
        if (statsInfo.failed > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(`转换失败: ${error instanceof Error ? error.message : "未知错误"}`);
        process.exit(1);
    }
});
commander_1.program.parse();
//# sourceMappingURL=chinese-converter.js.map
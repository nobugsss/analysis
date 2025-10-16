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
 * @Date: 2025-10-16 11:45:47
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:45:56
 * @description: JSON验证器命令行工具
 * @param:
 * @return:
 */
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs-extra"));
const json_validator_1 = require("../modules/json-validator");
commander_1.program
    .name("json-validator")
    .description("验证JSON文件的有效性")
    .version("1.0.0")
    .argument("<path>", "要验证的文件或目录路径")
    .option("-r, --recursive", "递归验证子目录")
    .option("-v, --verbose", "显示详细信息")
    .action(async (inputPath, options) => {
    const spinner = (0, ora_1.default)("正在验证JSON文件...").start();
    try {
        // 检查文件是否存在
        await fs.access(inputPath);
        const stats = await fs.stat(inputPath);
        let results = [];
        if (stats.isFile()) {
            // 验证单个文件
            const result = await json_validator_1.JsonValidator.validateFile(inputPath);
            results = [result];
        }
        else if (stats.isDirectory()) {
            // 验证目录
            results = await json_validator_1.JsonValidator.validateDirectory(inputPath);
        }
        else {
            spinner.fail("无效的路径");
            process.exit(1);
        }
        spinner.stop();
        // 显示结果
        const statsInfo = json_validator_1.JsonValidator.getStats(results);
        console.log(chalk_1.default.blue("\n=== JSON验证结果 ==="));
        console.log(chalk_1.default.green(`总计: ${statsInfo.total} 个文件`));
        console.log(chalk_1.default.green(`有效: ${statsInfo.valid} 个文件`));
        console.log(chalk_1.default.red(`无效: ${statsInfo.invalid} 个文件`));
        console.log(chalk_1.default.yellow(`有效率: ${statsInfo.validPercentage}%`));
        if (options.verbose) {
            console.log(chalk_1.default.blue("\n=== 详细信息 ==="));
            results.forEach((result) => {
                if (result.valid) {
                    console.log(chalk_1.default.green(`✓ ${result.filePath}`));
                    console.log(`  大小: ${result.size} 字符, 键数: ${result.keys}`);
                }
                else {
                    console.log(chalk_1.default.red(`✗ ${result.filePath}`));
                    console.log(`  错误: ${result.error}`);
                }
            });
        }
        // 如果有无效文件，退出码为1
        if (statsInfo.invalid > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(`验证失败: ${error instanceof Error ? error.message : "未知错误"}`);
        process.exit(1);
    }
});
commander_1.program.parse();
//# sourceMappingURL=json-validator.js.map
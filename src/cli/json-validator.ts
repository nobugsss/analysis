/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:45:47
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:45:56
 * @description: JSON验证器命令行工具
 * @param:
 * @return:
 */
import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs-extra";
import { JsonValidator, JsonValidationResult } from "../modules/json-validator";

interface CliOptions {
	recursive?: boolean;
	verbose?: boolean;
}

program
	.name("json-validator")
	.description("验证JSON文件的有效性")
	.version("1.0.0")
	.argument("<path>", "要验证的文件或目录路径")
	.option("-r, --recursive", "递归验证子目录")
	.option("-v, --verbose", "显示详细信息")
	.action(async (inputPath: string, options: CliOptions) => {
		const spinner = ora("正在验证JSON文件...").start();

		try {
			// 检查文件是否存在
			await fs.access(inputPath);
			const stats = await fs.stat(inputPath);
			let results: JsonValidationResult[] = [];

			if (stats.isFile()) {
				// 验证单个文件
				const result = await JsonValidator.validateFile(inputPath);
				results = [result];
			} else if (stats.isDirectory()) {
				// 验证目录
				results = await JsonValidator.validateDirectory(inputPath);
			} else {
				spinner.fail("无效的路径");
				process.exit(1);
			}

			spinner.stop();

			// 显示结果
			const statsInfo = JsonValidator.getStats(results);

			console.log(chalk.blue("\n=== JSON验证结果 ==="));
			console.log(chalk.green(`总计: ${statsInfo.total} 个文件`));
			console.log(chalk.green(`有效: ${statsInfo.valid} 个文件`));
			console.log(chalk.red(`无效: ${statsInfo.invalid} 个文件`));
			console.log(chalk.yellow(`有效率: ${statsInfo.validPercentage}%`));

			if (options.verbose) {
				console.log(chalk.blue("\n=== 详细信息 ==="));
				results.forEach((result) => {
					if (result.valid) {
						console.log(chalk.green(`✓ ${result.filePath}`));
						console.log(`  大小: ${result.size} 字符, 键数: ${result.keys}`);
					} else {
						console.log(chalk.red(`✗ ${result.filePath}`));
						console.log(`  错误: ${result.error}`);
					}
				});
			}

			// 如果有无效文件，退出码为1
			if (statsInfo.invalid > 0) {
				process.exit(1);
			}
		} catch (error) {
			spinner.fail(`验证失败: ${error instanceof Error ? error.message : "未知错误"}`);
			process.exit(1);
		}
	});

program.parse();

/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:50:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:50:00
 * @description: 简繁转换命令行工具
 * @param:
 * @return:
 */
import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs-extra";
import { ChineseConverter, ConvertMode, FileConvertResult } from "../modules/chinese-converter";

interface CliOptions {
	input: string;
	output: string;
	mode: ConvertMode;
	recursive?: boolean;
	verbose?: boolean;
}

program
	.name("chinese-converter")
	.description("简繁中文转换工具")
	.version("1.0.0")
	.requiredOption("-i, --input <path>", "输入文件或目录路径")
	.requiredOption("-o, --output <path>", "输出文件或目录路径")
	.requiredOption("-m, --mode <mode>", "转换模式: s2t(简体转繁体), t2s(繁体转简体), s2tw(简体转台湾繁体), s2hk(简体转香港繁体), s2twp(简体转台湾繁体短语), t2tw(繁体转台湾繁体), t2hk(繁体转香港繁体), t2jp(繁体转日文汉字), jp2t(日文汉字转繁体)", "s2t")
	.option("-r, --recursive", "递归处理子目录")
	.option("-v, --verbose", "显示详细信息")
	.action(async (options: CliOptions) => {
		const spinner = ora("正在转换文件...").start();

		try {
			// 检查输入路径是否存在
			await fs.access(options.input);
			const inputStats = await fs.stat(options.input);
			if (!inputStats.isFile() && !inputStats.isDirectory()) {
				spinner.fail("无效的输入路径");
				process.exit(1);
			}

			// 验证转换模式
			if (!Object.values(ConvertMode).includes(options.mode as ConvertMode)) {
				spinner.fail("无效的转换模式，请使用: s2t, t2s, s2tw, s2hk, s2twp, t2tw, t2hk, t2jp, jp2t");
				process.exit(1);
			}

			let results: FileConvertResult[] = [];

			if (inputStats.isFile()) {
				// 转换单个文件
				const result = await ChineseConverter.convertFile(options.input, options.output, options.mode as ConvertMode);
				results = [result];
			} else if (inputStats.isDirectory()) {
				// 转换目录
				results = await ChineseConverter.convertDirectory(options.input, options.output, options.mode as ConvertMode);
			}

			spinner.stop();

			// 显示结果
			const statsInfo = ChineseConverter.getStats(results);

			console.log(chalk.blue("\n=== 转换结果 ==="));
			console.log(chalk.green(`总计: ${statsInfo.total} 个文件`));
			console.log(chalk.green(`成功: ${statsInfo.success} 个文件`));
			console.log(chalk.red(`失败: ${statsInfo.failed} 个文件`));
			console.log(chalk.yellow(`成功率: ${statsInfo.successPercentage}%`));

			if (options.verbose) {
				console.log(chalk.blue("\n=== 详细信息 ==="));
				results.forEach((result) => {
					if (result.success) {
						console.log(chalk.green(`✓ ${result.inputPath} -> ${result.outputPath}`));
						console.log(`  大小: ${result.size} 字符`);
					} else {
						console.log(chalk.red(`✗ ${result.inputPath}`));
						console.log(`  错误: ${result.error}`);
					}
				});
			}

			// 如果有失败的文件，退出码为1
			if (statsInfo.failed > 0) {
				process.exit(1);
			}
		} catch (error) {
			spinner.fail(`转换失败: ${error instanceof Error ? error.message : "未知错误"}`);
			process.exit(1);
		}
	});

program.parse();

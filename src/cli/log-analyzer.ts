/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:55:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 12:18:12
 * @description: 日志分析命令行工具
 * @param:
 * @return:
 */
import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs-extra";
import { LogParser } from "../modules/log-parser";

interface CliOptions {
	input: string;
	output: string;
	format?: string;
	verbose?: boolean;
}

program
	.name("log-analyzer")
	.description("IP日志分析工具")
	.version("1.0.0")
	.requiredOption("-i, --input <path>", "输入日志文件路径")
	.requiredOption("-o, --output <path>", "输出结果文件路径")
	.option("-f, --format <format>", "输出格式: json, csv", "json")
	.option("-v, --verbose", "显示详细信息")
	.action(async (options: CliOptions) => {
		const spinner = ora("正在分析日志文件...").start();

		try {
			// 检查输入文件是否存在
			await fs.access(options.input);
			// 验证输入文件
			const inputStats = await fs.stat(options.input);
			if (!inputStats.isFile()) {
				spinner.fail("输入路径不是文件");
				process.exit(1);
			}

			// 解析日志文件
			spinner.text = "正在解析日志文件...";
			const entries = await LogParser.parseLogFile(options.input);

			if (entries.length === 0) {
				spinner.fail("未找到有效的日志条目");
				process.exit(1);
			}

			// 按IP聚合
			spinner.text = "正在按IP聚合统计...";
			const ipStats = LogParser.aggregateByIp(entries);

			// 按区域聚合
			spinner.text = "正在按区域聚合统计...";
			const regionStats = LogParser.aggregateByRegion(ipStats);

			// 准备输出数据
			const results = {
				summary: {
					totalEntries: entries.length,
					uniqueIps: ipStats.length,
					regions: regionStats.length,
					analysisTime: new Date().toISOString()
				},
				ipStats,
				regionStats,
				rawEntries: options.verbose ? entries : undefined
			};

			// 保存结果
			spinner.text = "正在保存分析结果...";
			await LogParser.saveResults(results, options.output);

			spinner.stop();

			// 显示结果摘要
			console.log(chalk.blue("\n=== 日志分析结果 ==="));
			console.log(chalk.green(`总日志条目: ${results.summary.totalEntries}`));
			console.log(chalk.green(`唯一IP数量: ${results.summary.uniqueIps}`));
			console.log(chalk.green(`涉及区域: ${results.summary.regions}`));
			console.log(chalk.yellow(`结果已保存到: ${options.output}`));

			if (options.verbose) {
				console.log(chalk.blue("\n=== 前10个IP统计 ==="));
				ipStats.slice(0, 10).forEach((stat, index) => {
					console.log(chalk.green(`${index + 1}. ${stat.ip}`));
					console.log(`   请求次数: ${stat.count}`);
					console.log(`   地理位置: ${stat.geoLocation?.country || "Unknown"} ${stat.geoLocation?.region || "Unknown"}`);
					console.log(`   首次访问: ${stat.firstSeen}`);
					console.log(`   最后访问: ${stat.lastSeen}`);
					console.log("");
				});

				console.log(chalk.blue("\n=== 区域统计 ==="));
				regionStats.slice(0, 5).forEach((stat, index) => {
					console.log(chalk.green(`${index + 1}. ${stat.country} - ${stat.region}`));
					console.log(`   IP数量: ${stat.ipCount}`);
					console.log(`   总请求: ${stat.totalRequests}`);
					console.log("");
				});
			}
		} catch (error) {
			spinner.fail(`分析失败: ${error instanceof Error ? error.message : "未知错误"}`);
			process.exit(1);
		}
	});

program.parse();

/*
 * @Author: boykaaa
 * @Date: 2025-10-16 12:00:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 12:00:00
 * @description: 地图可视化命令行工具
 * @param:
 * @return:
 */
import { program } from "commander";
import chalk from "chalk";
import { MapVisualizer } from "../modules/map-visualizer";

interface CliOptions {
	port: number;
	file?: string;
}

program
	.name("map-visualizer")
	.description("中国地图IP可视化工具")
	.version("1.0.0")
	.option("-p, --port <port>", "服务器端口", "3000")
	.option("-f, --file <file>", "要可视化的数据文件路径")
	.action(async (options: CliOptions) => {
		const port = parseInt(options.port.toString());

		if (isNaN(port) || port < 1 || port > 65535) {
			console.error(chalk.red("无效的端口号"));
			process.exit(1);
		}

		console.log(chalk.blue("正在启动地图可视化服务器..."));

		const visualizer = new MapVisualizer(port);

		// 处理进程退出
		process.on("SIGINT", () => {
			console.log(chalk.yellow("\n正在关闭服务器..."));
			visualizer.stop();
		});

		process.on("SIGTERM", () => {
			console.log(chalk.yellow("\n正在关闭服务器..."));
			visualizer.stop();
		});

		visualizer.start();

		if (options.file) {
			console.log(chalk.green(`\n数据文件: ${options.file}`));
			console.log(chalk.green(`访问地址: http://localhost:${port}?file=${encodeURIComponent(options.file)}`));
		} else {
			console.log(chalk.green(`\n访问地址: http://localhost:${port}`));
			console.log(chalk.yellow("提示: 使用 ?file=<数据文件路径> 参数来加载特定数据"));
		}
	});

program.parse();

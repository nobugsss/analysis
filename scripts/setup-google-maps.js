/*
 * @Author: boykaaa
 * @Date: 2025-10-16 15:30:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 15:30:00
 * @description: Google Maps API密钥配置脚本
 * @param:
 * @return:
 */
import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";

/**
 * 配置Google Maps API密钥
 */
async function setupGoogleMapsApiKey() {
	const spinner = ora("正在配置Google Maps API密钥...").start();

	try {
		// 检查.env文件是否存在
		const envPath = path.join(process.cwd(), ".env");
		let envContent = "";

		if (await fs.pathExists(envPath)) {
			envContent = await fs.readFile(envPath, "utf-8");
		}

		// 检查是否已有GOOGLE_MAPS_API_KEY
		if (envContent.includes("GOOGLE_MAPS_API_KEY")) {
			spinner.warn("Google Maps API密钥已存在");
			console.log(chalk.yellow("如需更新API密钥，请手动编辑 .env 文件"));
			return;
		}

		// 添加API密钥配置
		const apiKeyConfig = `
# Google Maps API配置
# 请替换YOUR_API_KEY为您的实际API密钥
GOOGLE_MAPS_API_KEY=YOUR_API_KEY
`;

		envContent += apiKeyConfig;
		await fs.writeFile(envPath, envContent, "utf-8");

		// 更新HTML文件中的API密钥
		await updateHtmlApiKey();

		spinner.succeed("Google Maps API密钥配置完成");

		console.log(chalk.blue("\n=== 配置说明 ==="));
		console.log(chalk.green("1. 请访问 https://console.cloud.google.com/"));
		console.log(chalk.green("2. 创建新项目或选择现有项目"));
		console.log(chalk.green("3. 启用 'Maps JavaScript API'"));
		console.log(chalk.green("4. 创建API密钥"));
		console.log(chalk.green("5. 编辑 .env 文件，将 YOUR_API_KEY 替换为实际密钥"));
		console.log(chalk.green("6. 重新启动服务"));

		console.log(chalk.blue("\n=== 安全建议 ==="));
		console.log(chalk.yellow("• 建议设置API密钥的HTTP引用限制"));
		console.log(chalk.yellow("• 仅允许您的域名使用此API密钥"));
		console.log(chalk.yellow("• 定期轮换API密钥"));
	} catch (error) {
		spinner.fail(`配置失败: ${error instanceof Error ? error.message : "未知错误"}`);
		process.exit(1);
	}
}

/**
 * 更新HTML文件中的API密钥
 */
async function updateHtmlApiKey() {
	const htmlPath = path.join(process.cwd(), "public", "index.html");

	if (await fs.pathExists(htmlPath)) {
		let htmlContent = await fs.readFile(htmlPath, "utf-8");

		// 替换API密钥占位符
		htmlContent = htmlContent.replace("key=YOUR_API_KEY", "key=${process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}");

		await fs.writeFile(htmlPath, htmlContent, "utf-8");
	}
}

/**
 * 创建环境变量示例文件
 */
async function createEnvExample() {
	const envExamplePath = path.join(process.cwd(), ".env.example");
	const envExampleContent = `# 环境变量配置示例
# 复制此文件为 .env 并填入实际值

# Google Maps API密钥
# 获取地址: https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=YOUR_API_KEY

# 服务器端口
PORT=3000
`;

	await fs.writeFile(envExamplePath, envExampleContent, "utf-8");
	console.log(chalk.green("已创建 .env.example 文件"));
}

// 主函数
async function main() {
	console.log(chalk.blue("=== Google Maps API密钥配置工具 ==="));

	await setupGoogleMapsApiKey();
	await createEnvExample();

	console.log(chalk.blue("\n=== 下一步 ==="));
	console.log(chalk.green("1. 编辑 .env 文件，设置您的Google Maps API密钥"));
	console.log(chalk.green("2. 运行: npm run ip-analyze -- --input examples/sample.log --map"));
	console.log(chalk.green("3. 访问: http://localhost:3000"));
}

// 运行配置
main().catch(console.error);

export { setupGoogleMapsApiKey };

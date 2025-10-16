/*
 * @Author: boykaaa
 * @Date: 2025-10-16 15:20:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 17:20:10
 * @description: 地图可视化服务器
 * @param:
 * @return:
 */
import express from "express";
import * as path from "path";
import * as fs from "fs-extra";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();

/**
 * 启动地图可视化服务器
 * @param port - 端口号
 */
export async function startMapServer(port: number): Promise<void> {
	const app = express();

	// 打印环境变量信息
	console.log("=== 服务器启动信息 ===");
	console.log("端口:", port);
	console.log("环境变量 GOOGLE_MAPS_API_KEY:", process.env["GOOGLE_MAPS_API_KEY"] ? process.env["GOOGLE_MAPS_API_KEY"] : "未设置");
	console.log("环境变量长度:", process.env["GOOGLE_MAPS_API_KEY"]?.length || 0);
	console.log("=====================");

	// 设置静态文件目录
	app.use(express.static(path.join(__dirname, "../../public")));

	// 确保数据目录存在
	await fs.ensureDir(path.join(__dirname, "../../public/data"));

	// 主页路由
	app.get("/", (_req, res) => {
		const htmlPath = path.join(__dirname, "../../public/index.html");

		// 打印API密钥信息
		const apiKey = process.env["GOOGLE_MAPS_API_KEY"];
		console.log("=== API密钥调试信息 ===");
		console.log("环境变量 GOOGLE_MAPS_API_KEY:", apiKey ? `${apiKey.substring(0, 10)}...` : "未设置");
		console.log("API密钥长度:", apiKey ? apiKey.length : 0);
		console.log("API密钥是否为空:", !apiKey);
		console.log("=========================");

		// 读取HTML文件并替换环境变量
		fs.readFile(htmlPath, "utf-8")
			.then((htmlContent) => {
				// 替换环境变量
				const processedHtml = htmlContent.replace(/\$\{process\.env\.GOOGLE_MAPS_API_KEY \|\| "YOUR_API_KEY"\}/g, apiKey || "YOUR_API_KEY");

				res.send(processedHtml);
			})
			.catch((error) => {
				console.error("读取HTML文件失败:", error);
				res.status(500).send("服务器内部错误");
			});
	});

	// API路由 - 获取中国IP数据
	app.get("/api/china-ips", async (_req, res) => {
		try {
			const dataPath = path.join(__dirname, "../../public/data/china-ips.json");
			if (await fs.pathExists(dataPath)) {
				const data = await fs.readJson(dataPath);
				res.json(data);
			} else {
				res.json({ error: "数据文件不存在" });
			}
		} catch (error) {
			res.status(500).json({ error: "读取数据失败" });
		}
	});

	// 启动服务器
	app.listen(port, () => {
		console.log(`地图可视化服务已启动: http://localhost:${port}`);
	});
}

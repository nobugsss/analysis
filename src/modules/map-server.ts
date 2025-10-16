/*
 * @Author: boykaaa
 * @Date: 2025-10-16 15:20:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 16:19:28
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

	// 设置静态文件目录
	app.use(express.static(path.join(__dirname, "../../public")));

	// 确保数据目录存在
	await fs.ensureDir(path.join(__dirname, "../../public/data"));

	// 主页路由
	app.get("/", (_req, res) => {
		const htmlPath = path.join(__dirname, "../../public/index.html");

		// 读取HTML文件并替换环境变量
		fs.readFile(htmlPath, "utf-8")
			.then((htmlContent) => {
				// 替换环境变量
				const processedHtml = htmlContent.replace(/\$\{process\.env\.GOOGLE_MAPS_API_KEY \|\| "YOUR_API_KEY"\}/g, process.env["GOOGLE_MAPS_API_KEY"] || "YOUR_API_KEY");

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

/*
 * @Author: boykaaa
 * @Date: 2025-10-16 12:00:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:53:28
 * @description: 中国地图IP可视化器
 * @param:
 * @return:
 */
import express from "express";
import * as fs from "fs-extra";
import * as path from "path";
import { IpStats, RegionStats } from "./log-parser";
import { getGoogleMapsApiKey, isValidApiKey } from "../config/google-maps";

/**
 * 地图标记点接口
 */
export interface MapMarker {
	lat: number;
	lng: number;
	title: string;
	description: string;
	count: number;
	region: string;
	country: string;
}

/**
 * 地图数据接口
 */
export interface MapData {
	markers: MapMarker[];
	regions: RegionStats[];
	summary: {
		totalIps: number;
		totalRequests: number;
		regions: number;
	};
}

/**
 * 中国地图IP可视化器
 */
export class MapVisualizer {
	private app: express.Application;
	private port: number;

	constructor(port: number = 3000) {
		this.app = express();
		this.port = port;
		this.setupMiddleware();
		this.setupRoutes();
	}

	/**
	 * 设置中间件
	 */
	private setupMiddleware(): void {
		this.app.use(express.static(path.join(__dirname, "../web/public")));
		this.app.use(express.json());
	}

	/**
	 * 设置路由
	 */
	private setupRoutes(): void {
		// 主页
		this.app.get("/", (_req, res) => {
			const apiKey = getGoogleMapsApiKey();

			// 检查API密钥是否有效
			if (!isValidApiKey(apiKey)) {
				res.status(500).send(`
					<html>
						<head><title>Google Maps API密钥错误</title></head>
						<body style="font-family: Arial, sans-serif; padding: 20px;">
							<h1 style="color: #d32f2f;">Google Maps API密钥配置错误</h1>
							<p>请按照以下步骤配置Google Maps API密钥：</p>
							<ol>
								<li>访问 <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
								<li>创建或选择一个项目</li>
								<li>启用Maps JavaScript API</li>
								<li>创建API密钥</li>
								<li>将API密钥设置为环境变量 GOOGLE_MAPS_API_KEY 或修改配置文件</li>
							</ol>
							<p><strong>当前API密钥:</strong> ${apiKey}</p>
							<p><strong>注意:</strong> 请确保API密钥格式正确（以AIza开头，39个字符长度）</p>
						</body>
					</html>
				`);
				return;
			}

			res.sendFile(path.join(__dirname, "../web/views/index.html"));
		});

		// API: 获取地图数据
		this.app.get("/api/map-data", async (req, res) => {
			try {
				const dataPath = req.query["file"] as string;
				if (!dataPath) {
					res.status(400).json({ error: "缺少文件参数" });
					return;
				}

				const data = await fs.readJson(dataPath);
				const mapData = this.convertToMapData(data);
				res.json(mapData);
			} catch (error) {
				res.status(500).json({
					error: `读取数据失败: ${error instanceof Error ? error.message : "未知错误"}`
				});
			}
		});

		// API: 获取IP详情
		this.app.get("/api/ip-details/:ip", async (req, res) => {
			try {
				const dataPath = req.query["file"] as string;
				const ip = req.params.ip;

				if (!dataPath) {
					res.status(400).json({ error: "缺少文件参数" });
					return;
				}

				const data = await fs.readJson(dataPath);
				const ipStats = data.ipStats.find((stat: IpStats) => stat.ip === ip);

				if (!ipStats) {
					res.status(404).json({ error: "未找到IP信息" });
					return;
				}

				res.json(ipStats);
			} catch (error) {
				res.status(500).json({
					error: `获取IP详情失败: ${error instanceof Error ? error.message : "未知错误"}`
				});
			}
		});

		// API: 获取Google Maps API密钥
		this.app.get("/api/google-maps-key", (_req, res) => {
			const apiKey = getGoogleMapsApiKey();
			res.json({ apiKey });
		});
	}

	/**
	 * 将分析结果转换为地图数据
	 * @param data - 分析结果数据
	 * @returns 地图数据
	 */
	private convertToMapData(data: any): MapData {
		const ipStats: IpStats[] = data.ipStats || [];
		const regionStats: RegionStats[] = data.regionStats || [];

		const markers: MapMarker[] = regionStats.map((region) => {
			// 计算区域中心点
			const avgLat = region.geoLocations.reduce((sum, geo) => sum + geo.latitude, 0) / region.geoLocations.length;
			const avgLng = region.geoLocations.reduce((sum, geo) => sum + geo.longitude, 0) / region.geoLocations.length;

			return {
				lat: avgLat,
				lng: avgLng,
				title: `${region.country} - ${region.region}`,
				description: `IP数量: ${region.ipCount}, 总请求: ${region.totalRequests}`,
				count: region.totalRequests,
				region: region.region,
				country: region.country
			};
		});

		return {
			markers,
			regions: regionStats,
			summary: {
				totalIps: ipStats.length,
				totalRequests: ipStats.reduce((sum, stat) => sum + stat.count, 0),
				regions: regionStats.length
			}
		};
	}

	/**
	 * 启动服务器
	 */
	public start(): void {
		this.app.listen(this.port, () => {
			console.log(`地图可视化服务器已启动: http://localhost:${this.port}`);
		});
	}

	/**
	 * 停止服务器
	 */
	public stop(): void {
		process.exit(0);
	}
}

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
exports.MapVisualizer = void 0;
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 12:00:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:53:28
 * @description: 中国地图IP可视化器
 * @param:
 * @return:
 */
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const google_maps_1 = require("../config/google-maps");
/**
 * 中国地图IP可视化器
 */
class MapVisualizer {
    constructor(port = 3000) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
    }
    /**
     * 设置中间件
     */
    setupMiddleware() {
        this.app.use(express_1.default.static(path.join(__dirname, "../web/public")));
        this.app.use(express_1.default.json());
    }
    /**
     * 设置路由
     */
    setupRoutes() {
        // 主页
        this.app.get("/", (_req, res) => {
            const apiKey = (0, google_maps_1.getGoogleMapsApiKey)();
            // 检查API密钥是否有效
            if (!(0, google_maps_1.isValidApiKey)(apiKey)) {
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
                const dataPath = req.query["file"];
                if (!dataPath) {
                    res.status(400).json({ error: "缺少文件参数" });
                    return;
                }
                const data = await fs.readJson(dataPath);
                const mapData = this.convertToMapData(data);
                res.json(mapData);
            }
            catch (error) {
                res.status(500).json({
                    error: `读取数据失败: ${error instanceof Error ? error.message : "未知错误"}`
                });
            }
        });
        // API: 获取IP详情
        this.app.get("/api/ip-details/:ip", async (req, res) => {
            try {
                const dataPath = req.query["file"];
                const ip = req.params.ip;
                if (!dataPath) {
                    res.status(400).json({ error: "缺少文件参数" });
                    return;
                }
                const data = await fs.readJson(dataPath);
                const ipStats = data.ipStats.find((stat) => stat.ip === ip);
                if (!ipStats) {
                    res.status(404).json({ error: "未找到IP信息" });
                    return;
                }
                res.json(ipStats);
            }
            catch (error) {
                res.status(500).json({
                    error: `获取IP详情失败: ${error instanceof Error ? error.message : "未知错误"}`
                });
            }
        });
        // API: 获取Google Maps API密钥
        this.app.get("/api/google-maps-key", (_req, res) => {
            const apiKey = (0, google_maps_1.getGoogleMapsApiKey)();
            res.json({ apiKey });
        });
    }
    /**
     * 将分析结果转换为地图数据
     * @param data - 分析结果数据
     * @returns 地图数据
     */
    convertToMapData(data) {
        const ipStats = data.ipStats || [];
        const regionStats = data.regionStats || [];
        const markers = regionStats.map((region) => {
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
    start() {
        this.app.listen(this.port, () => {
            console.log(`地图可视化服务器已启动: http://localhost:${this.port}`);
        });
    }
    /**
     * 停止服务器
     */
    stop() {
        process.exit(0);
    }
}
exports.MapVisualizer = MapVisualizer;
//# sourceMappingURL=map-visualizer.js.map
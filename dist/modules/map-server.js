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
exports.startMapServer = startMapServer;
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 15:20:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 14:50:47
 * @description: 地图可视化服务器
 * @param:
 * @return:
 */
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const dotenv = __importStar(require("dotenv"));
// 加载环境变量
dotenv.config();
/**
 * 启动地图可视化服务器
 * @param port - 端口号
 */
async function startMapServer(port) {
    const app = (0, express_1.default)();
    // 设置静态文件目录
    app.use(express_1.default.static(path.join(__dirname, "../../public")));
    // 确保数据目录存在
    await fs.ensureDir(path.join(__dirname, "../../public/data"));
    // 主页路由
    app.get("/", (_req, res) => {
        const htmlPath = path.join(__dirname, "../../public/index.html");
        // 读取HTML文件并替换环境变量
        fs.readFile(htmlPath, "utf-8").then(htmlContent => {
            // 替换环境变量
            const processedHtml = htmlContent.replace(/\$\{process\.env\.GOOGLE_MAPS_API_KEY \|\| "YOUR_API_KEY"\}/g, process.env["GOOGLE_MAPS_API_KEY"] || "YOUR_API_KEY");
            res.send(processedHtml);
        }).catch(error => {
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
            }
            else {
                res.json({ error: "数据文件不存在" });
            }
        }
        catch (error) {
            res.status(500).json({ error: "读取数据失败" });
        }
    });
    // 启动服务器
    app.listen(port, () => {
        console.log(`地图可视化服务已启动: http://localhost:${port}`);
    });
}
//# sourceMappingURL=map-server.js.map
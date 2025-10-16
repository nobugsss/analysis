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
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 15:10:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 14:50:59
 * @description: IP日志分析命令行工具
 * @param:
 * @return:
 */
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs-extra"));
const ip_log_analyzer_1 = require("../modules/ip-log-analyzer");
commander_1.program
    .name("ip-log-analyzer")
    .description("IP日志分析工具 - 分析日志文件并在地图上可视化中国IP分布")
    .version("1.0.0")
    .requiredOption("-i, --input <file>", "输入日志文件路径")
    .option("-o, --output <file>", "输出分析结果文件路径")
    .option("-v, --verbose", "显示详细信息")
    .option("--map", "启动地图可视化服务")
    .option("--port <port>", "地图服务端口号", "3000")
    .action(async (options) => {
    const spinner = (0, ora_1.default)("正在分析日志文件...").start();
    try {
        // 分析日志文件
        const result = await ip_log_analyzer_1.IpLogAnalyzer.analyzeLogFile(options.input);
        spinner.stop();
        // 显示基本统计
        console.log(chalk_1.default.blue("\n=== 分析结果 ==="));
        console.log(chalk_1.default.green(`总日志条数: ${result.totalLogs}`));
        console.log(chalk_1.default.green(`唯一IP数量: ${result.uniqueIps}`));
        console.log(chalk_1.default.green(`中国IP数量: ${result.chinaIps}`));
        console.log(chalk_1.default.yellow(`海外IP数量: ${result.foreignIps}`));
        if (result.chinaIps > 0) {
            console.log(chalk_1.default.blue("\n=== 中国IP省市分布 ==="));
            // 显示省份分布
            console.log(chalk_1.default.green("省份分布:"));
            Array.from(result.provinceStats.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([province, count]) => {
                console.log(`  ${province}: ${count} 次访问`);
            });
            // 显示城市分布
            console.log(chalk_1.default.green("\n城市分布:"));
            Array.from(result.cityStats.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([city, count]) => {
                console.log(`  ${city}: ${count} 次访问`);
            });
        }
        if (options.verbose) {
            console.log(chalk_1.default.blue("\n=== 详细信息 ==="));
            result.ipGeoList
                .filter((ip) => ip.isChina)
                .sort((a, b) => b.count - a.count)
                .forEach((ip, index) => {
                console.log(chalk_1.default.cyan(`\n${index + 1}. IP: ${ip.ip}`));
                console.log(`   省份: ${ip.province}`);
                console.log(`   城市: ${ip.city}`);
                console.log(`   坐标: ${ip.latitude}, ${ip.longitude}`);
                console.log(`   访问次数: ${ip.count}`);
                console.log(`   首次访问: ${ip.firstSeen}`);
                console.log(`   最后访问: ${ip.lastSeen}`);
            });
        }
        // 生成报告
        const report = ip_log_analyzer_1.IpLogAnalyzer.generateReport(result);
        if (options.output) {
            await fs.writeFile(options.output, report, "utf-8");
            console.log(chalk_1.default.green(`\n分析报告已保存到: ${options.output}`));
        }
        // 保存JSON数据用于地图可视化
        const chinaIpsData = result.ipGeoList.filter((ip) => ip.isChina);
        const mapData = {
            analysis: {
                totalLogs: result.totalLogs,
                uniqueIps: result.uniqueIps,
                chinaIps: result.chinaIps,
                foreignIps: result.foreignIps
            },
            chinaIps: chinaIpsData.map((ip) => ({
                ip: ip.ip,
                province: ip.province,
                city: ip.city,
                latitude: ip.latitude,
                longitude: ip.longitude,
                count: ip.count,
                firstSeen: ip.firstSeen,
                lastSeen: ip.lastSeen
            })),
            provinceStats: Array.from(result.provinceStats.entries()).map(([province, count]) => ({
                province,
                count
            })),
            cityStats: Array.from(result.cityStats.entries()).map(([city, count]) => ({
                city,
                count
            }))
        };
        await fs.writeFile("public/data/china-ips.json", JSON.stringify(mapData, null, 2), "utf-8");
        console.log(chalk_1.default.green("地图数据已保存到: public/data/china-ips.json"));
        // 启动地图可视化服务
        if (options.map) {
            console.log(chalk_1.default.blue("\n=== 启动地图可视化服务 ==="));
            console.log(chalk_1.default.green(`服务地址: http://localhost:${options.port}`));
            console.log(chalk_1.default.yellow("按 Ctrl+C 停止服务"));
            // 启动地图服务
            const { startMapServer } = await Promise.resolve().then(() => __importStar(require("../modules/map-server")));
            await startMapServer(parseInt(String(options.port || "3000"), 10));
        }
    }
    catch (error) {
        spinner.fail(`分析失败: ${error instanceof Error ? error.message : "未知错误"}`);
        process.exit(1);
    }
});
commander_1.program.parse();
//# sourceMappingURL=ip-log-analyzer.js.map
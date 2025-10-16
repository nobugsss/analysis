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
 * @Date: 2025-10-16 14:20:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 14:37:51
 * @description: 中国IP地址省市查询命令行工具
 * @param:
 * @return:
 */
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs-extra"));
const china_ip_query_1 = require("../modules/china-ip-query");
commander_1.program
    .name("china-ip-query")
    .description("中国IP地址省市查询工具")
    .version("1.0.0")
    .option("-i, --input <file>", "输入IP地址文件路径（每行一个IP）")
    .option("-o, --output <file>", "输出结果文件路径")
    .option("--ip <ip>", "查询单个IP地址")
    .option("-v, --verbose", "显示详细信息")
    .action(async (options) => {
    const spinner = (0, ora_1.default)("正在查询IP地址...").start();
    try {
        let ips = [];
        let results = [];
        // 获取IP地址列表
        if (options.ip) {
            // 查询单个IP
            ips = [options.ip];
            spinner.text = `正在查询IP: ${options.ip}`;
        }
        else if (options.input) {
            // 从文件读取IP列表
            await fs.access(options.input);
            const content = await fs.readFile(options.input, "utf-8");
            ips = content
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
            spinner.text = `正在查询 ${ips.length} 个IP地址`;
        }
        else {
            spinner.fail("请提供IP地址或输入文件");
            commander_1.program.help();
            return;
        }
        // 执行查询
        results = await china_ip_query_1.ChinaIpQuery.queryIps(ips);
        spinner.stop();
        // 显示结果
        console.log(chalk_1.default.blue("\n=== 查询结果 ==="));
        const chinaCount = results.filter((r) => r.isChina).length;
        const foreignCount = results.filter((r) => !r.isChina).length;
        console.log(chalk_1.default.green(`总计: ${results.length} 个IP地址`));
        console.log(chalk_1.default.green(`中国IP: ${chinaCount} 个`));
        console.log(chalk_1.default.yellow(`海外IP: ${foreignCount} 个`));
        if (options.verbose) {
            console.log(chalk_1.default.blue("\n=== 详细信息 ==="));
            results.forEach((result, index) => {
                console.log(chalk_1.default.cyan(`\n${index + 1}. IP: ${result.ip}`));
                if (result.error) {
                    console.log(chalk_1.default.red(`   错误: ${result.error}`));
                }
                else if (result.location) {
                    if (result.isChina) {
                        console.log(chalk_1.default.green(`   国家: ${result.location.country}`));
                        console.log(chalk_1.default.green(`   省份: ${result.location.province}`));
                        console.log(chalk_1.default.green(`   城市: ${result.location.city}`));
                        console.log(chalk_1.default.green(`   坐标: ${result.location.latitude}, ${result.location.longitude}`));
                        console.log(chalk_1.default.green(`   时区: ${result.location.timezone}`));
                    }
                    else {
                        console.log(chalk_1.default.yellow(`   国家: ${result.location.country}`));
                        console.log(chalk_1.default.yellow(`   地区: ${result.location.province}`));
                        console.log(chalk_1.default.yellow(`   城市: ${result.location.city}`));
                    }
                }
            });
        }
        // 生成报告
        const report = china_ip_query_1.ChinaIpQuery.generateReport(results);
        if (options.output) {
            await fs.writeFile(options.output, report, "utf-8");
            console.log(chalk_1.default.green(`\n报告已保存到: ${options.output}`));
        }
        else {
            console.log(chalk_1.default.blue("\n=== 详细报告 ==="));
            console.log(report);
        }
        // 显示中国IP统计
        if (chinaCount > 0) {
            console.log(chalk_1.default.blue("\n=== 中国IP省市统计 ==="));
            const provinceStats = new Map();
            const cityStats = new Map();
            results
                .filter((r) => r.isChina && r.location)
                .forEach((result) => {
                const province = result.location.province;
                const city = result.location.city;
                provinceStats.set(province, (provinceStats.get(province) || 0) + 1);
                cityStats.set(city, (cityStats.get(city) || 0) + 1);
            });
            console.log(chalk_1.default.green("省份分布:"));
            Array.from(provinceStats.entries())
                .sort((a, b) => b[1] - a[1])
                .forEach(([province, count]) => {
                console.log(`  ${province}: ${count} 个IP`);
            });
            console.log(chalk_1.default.green("\n城市分布:"));
            Array.from(cityStats.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10) // 只显示前10个城市
                .forEach(([city, count]) => {
                console.log(`  ${city}: ${count} 个IP`);
            });
        }
    }
    catch (error) {
        spinner.fail(`查询失败: ${error instanceof Error ? error.message : "未知错误"}`);
        process.exit(1);
    }
});
commander_1.program.parse();
//# sourceMappingURL=china-ip-query.js.map
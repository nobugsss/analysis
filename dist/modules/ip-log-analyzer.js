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
exports.IpLogAnalyzer = void 0;
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 15:00:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 17:16:38
 * @description: IP日志分析器 - 从日志文件提取IP并获取地理信息
 * @param:
 * @return:
 */
const fs = __importStar(require("fs-extra"));
const geoip = __importStar(require("geoip-lite"));
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
/**
 * IP日志分析器
 */
class IpLogAnalyzer {
    /**
     * 解析日志文件
     * @param logFilePath - 日志文件路径
     * @returns 解析后的日志条目数组
     */
    static async parseLogFile(logFilePath) {
        try {
            await fs.access(logFilePath);
            const content = await fs.readFile(logFilePath, "utf-8");
            const lines = content.split("\n");
            const logEntries = [];
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith("#")) {
                    continue; // 跳过空行和注释行
                }
                const parsed = this.parseLogLine(trimmedLine);
                if (parsed) {
                    logEntries.push(parsed);
                }
            }
            return logEntries;
        }
        catch (error) {
            throw new Error(`解析日志文件失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }
    }
    /**
     * 解析单行日志
     * @param line - 日志行
     * @returns 解析后的日志条目或null
     */
    static parseLogLine(line) {
        const match = line.match(this.LOG_PATTERN);
        if (!match) {
            return null;
        }
        const [, ip, timestamp, request, status, _size, referer, userAgent] = match;
        // 解析请求信息
        const requestParts = request?.split(" ") || [];
        const method = requestParts[0] || "";
        const url = requestParts[1] || "";
        return {
            timestamp: this.parseTimestamp(timestamp || ""),
            ip: (ip || "").trim(),
            method,
            url,
            status: parseInt(status || "0", 10),
            userAgent: userAgent || "",
            referer: referer || "",
            rawLine: line
        };
    }
    /**
     * 解析时间戳
     * @param timestamp - 时间戳字符串
     * @returns 格式化后的时间戳
     */
    static parseTimestamp(timestamp) {
        try {
            // 解析格式: 16/Oct/2025:10:30:15 +0800
            const parsed = (0, moment_1.default)(timestamp, "DD/MMM/YYYY:HH:mm:ss Z");
            return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : timestamp;
        }
        catch {
            return timestamp;
        }
    }
    /**
     * 从日志条目中提取IP地址
     * @param logEntries - 日志条目数组
     * @returns IP地址数组
     */
    static extractIps(logEntries) {
        const ipSet = new Set();
        for (const entry of logEntries) {
            const matches = entry.ip.match(this.IP_REGEX);
            if (matches) {
                for (const ip of matches) {
                    if (this.isValidIp(ip)) {
                        ipSet.add(ip);
                    }
                }
            }
        }
        return Array.from(ipSet);
    }
    /**
     * 使用在线API获取中国IP地理信息
     * @param ip - IP地址
     * @returns 地理信息
     */
    static async getChinaIpFromApi(ip) {
        try {
            // 使用ip-api.com的免费服务
            const response = await axios_1.default.get(`http://ip-api.com/json/${ip}?lang=zh-CN`, {
                timeout: 5000
            });
            if (response.data && response.data.status === "success") {
                return {
                    country: response.data.country,
                    countryCode: response.data.countryCode,
                    region: response.data.regionName,
                    city: response.data.city,
                    latitude: response.data.lat,
                    longitude: response.data.lon,
                    timezone: response.data.timezone,
                    isp: response.data.isp
                };
            }
            return null;
        }
        catch (error) {
            console.warn(`API查询失败 ${ip}:`, error instanceof Error ? error.message : "未知错误");
            return null;
        }
    }
    /**
     * 获取IP的地理信息
     * @param ip - IP地址
     * @returns 地理信息
     */
    static async getIpGeoInfo(ip) {
        try {
            // 首先尝试使用在线API获取更准确的信息
            let geo = null;
            let dataSource = "none";
            try {
                geo = await this.getChinaIpFromApi(ip);
                if (geo) {
                    dataSource = "api";
                    console.log(`在线API查询 ${ip}:`, {
                        country: geo.country,
                        region: geo.region,
                        city: geo.city,
                        latitude: geo.latitude,
                        longitude: geo.longitude
                    });
                }
            }
            catch (apiError) {
                console.warn(`在线API查询失败 ${ip}:`, apiError);
            }
            // 如果API查询失败，回退到geoip-lite
            if (!geo) {
                geo = geoip.lookup(ip);
                if (geo) {
                    dataSource = "geoip-lite";
                }
            }
            if (!geo) {
                return null;
            }
            const isChina = geo.countryCode === this.CHINA_COUNTRY_CODE || geo.country === "中国";
            let province;
            let city;
            let latitude;
            let longitude;
            let timezone;
            if (dataSource === "api") {
                // 使用在线API的结果
                province = geo.region || "未知";
                city = geo.city || "未知";
                latitude = geo.latitude || 0;
                longitude = geo.longitude || 0;
                timezone = geo.timezone || "UTC";
            }
            else {
                // 使用geoip-lite的结果
                province = isChina ? this.getProvinceFromRegion(geo.region) : geo.region || "未知";
                city = geo.city || "未知";
                latitude = geo.ll[0];
                longitude = geo.ll[1];
                timezone = geo.timezone || "UTC";
            }
            return {
                ip,
                country: geo.country || "未知",
                province,
                city,
                latitude,
                longitude,
                timezone,
                isChina,
                count: 0, // 将在后续统计中设置
                firstSeen: "",
                lastSeen: ""
            };
        }
        catch (error) {
            console.warn(`获取IP ${ip} 地理信息失败: ${error instanceof Error ? error.message : "未知错误"}`);
            return null;
        }
    }
    /**
     * 根据地区代码获取省份名称
     * @param region - 地区代码
     * @returns 省份名称
     */
    static getProvinceFromRegion(region) {
        const regionMap = {
            "Beijing": "北京市",
            "Tianjin": "天津市",
            "Hebei": "河北省",
            "Shanxi": "山西省",
            "Nei Mongol": "内蒙古自治区",
            "Liaoning": "辽宁省",
            "Jilin": "吉林省",
            "Heilongjiang": "黑龙江省",
            "Shanghai": "上海市",
            "Jiangsu": "江苏省",
            "Zhejiang": "浙江省",
            "Anhui": "安徽省",
            "Fujian": "福建省",
            "Jiangxi": "江西省",
            "Shandong": "山东省",
            "Henan": "河南省",
            "Hubei": "湖北省",
            "Hunan": "湖南省",
            "Guangdong": "广东省",
            "Guangxi": "广西壮族自治区",
            "Hainan": "海南省",
            "Chongqing": "重庆市",
            "Sichuan": "四川省",
            "Guizhou": "贵州省",
            "Yunnan": "云南省",
            "Xizang": "西藏自治区",
            "Shaanxi": "陕西省",
            "Gansu": "甘肃省",
            "Qinghai": "青海省",
            "Ningxia": "宁夏回族自治区",
            "Xinjiang": "新疆维吾尔自治区",
            "Taiwan": "台湾省",
            "Hong Kong": "香港特别行政区",
            "Macau": "澳门特别行政区"
        };
        return regionMap[region] || region || "未知";
    }
    /**
     * 验证IP地址格式
     * @param ip - IP地址
     * @returns 是否为有效IP
     */
    static isValidIp(ip) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(ip);
    }
    /**
     * 分析日志文件并生成地理信息
     * @param logFilePath - 日志文件路径
     * @returns 分析结果
     */
    static async analyzeLogFile(logFilePath) {
        console.log("正在解析日志文件...");
        const logEntries = await this.parseLogFile(logFilePath);
        console.log("正在提取IP地址...");
        const ips = this.extractIps(logEntries);
        console.log("正在获取地理信息...");
        const ipGeoMap = new Map();
        const ipCountMap = new Map();
        const ipTimeMap = new Map();
        // 统计IP出现次数和时间
        for (const entry of logEntries) {
            const ip = entry.ip;
            ipCountMap.set(ip, (ipCountMap.get(ip) || 0) + 1);
            const timeInfo = ipTimeMap.get(ip);
            if (!timeInfo) {
                ipTimeMap.set(ip, { first: entry.timestamp, last: entry.timestamp });
            }
            else {
                if (entry.timestamp < timeInfo.first) {
                    timeInfo.first = entry.timestamp;
                }
                if (entry.timestamp > timeInfo.last) {
                    timeInfo.last = entry.timestamp;
                }
            }
        }
        // 获取地理信息
        for (const ip of ips) {
            const geoInfo = await this.getIpGeoInfo(ip);
            if (geoInfo) {
                const count = ipCountMap.get(ip) || 0;
                const timeInfo = ipTimeMap.get(ip);
                geoInfo.count = count;
                geoInfo.firstSeen = timeInfo?.first || "";
                geoInfo.lastSeen = timeInfo?.last || "";
                ipGeoMap.set(ip, geoInfo);
            }
        }
        const ipGeoList = Array.from(ipGeoMap.values());
        const chinaIps = ipGeoList.filter((ip) => ip.isChina);
        const foreignIps = ipGeoList.filter((ip) => !ip.isChina);
        // 统计省市分布
        const provinceStats = new Map();
        const cityStats = new Map();
        for (const ip of chinaIps) {
            provinceStats.set(ip.province, (provinceStats.get(ip.province) || 0) + ip.count);
            cityStats.set(ip.city, (cityStats.get(ip.city) || 0) + ip.count);
        }
        return {
            totalLogs: logEntries.length,
            uniqueIps: ips.length,
            chinaIps: chinaIps.length,
            foreignIps: foreignIps.length,
            ipGeoList,
            provinceStats,
            cityStats
        };
    }
    /**
     * 生成分析报告
     * @param result - 分析结果
     * @returns 格式化的报告
     */
    static generateReport(result) {
        let report = "=== IP日志分析报告 ===\n\n";
        report += `总日志条数: ${result.totalLogs}\n`;
        report += `唯一IP数量: ${result.uniqueIps}\n`;
        report += `中国IP数量: ${result.chinaIps}\n`;
        report += `海外IP数量: ${result.foreignIps}\n\n`;
        if (result.chinaIps > 0) {
            report += "=== 中国IP省市分布 ===\n";
            report += "\n省份分布:\n";
            Array.from(result.provinceStats.entries())
                .sort((a, b) => b[1] - a[1])
                .forEach(([province, count]) => {
                report += `  ${province}: ${count} 次访问\n`;
            });
            report += "\n城市分布:\n";
            Array.from(result.cityStats.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([city, count]) => {
                report += `  ${city}: ${count} 次访问\n`;
            });
            report += "\n=== 中国IP详细信息 ===\n";
            result.ipGeoList
                .filter((ip) => ip.isChina)
                .sort((a, b) => b.count - a.count)
                .forEach((ip) => {
                report += `IP: ${ip.ip}\n`;
                report += `  省份: ${ip.province}\n`;
                report += `  城市: ${ip.city}\n`;
                report += `  坐标: ${ip.latitude}, ${ip.longitude}\n`;
                report += `  访问次数: ${ip.count}\n`;
                report += `  首次访问: ${ip.firstSeen}\n`;
                report += `  最后访问: ${ip.lastSeen}\n\n`;
            });
        }
        return report;
    }
}
exports.IpLogAnalyzer = IpLogAnalyzer;
IpLogAnalyzer.CHINA_COUNTRY_CODE = "CN";
IpLogAnalyzer.IP_REGEX = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
IpLogAnalyzer.LOG_PATTERN = /^(\S+) - - \[([^\]]+)\] "([^"]+)" (\d+) (\d+) "([^"]*)" "([^"]*)"$/;
//# sourceMappingURL=ip-log-analyzer.js.map
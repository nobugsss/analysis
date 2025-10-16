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
exports.LogParser = void 0;
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:55:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:48:08
 * @description: IP日志解析器
 * @param:
 * @return:
 */
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const geoip = __importStar(require("geoip-lite"));
const moment_1 = __importDefault(require("moment"));
/**
 * IP日志解析器
 */
class LogParser {
    /**
     * 从文本中提取IP地址
     * @param text - 文本内容
     * @returns IP地址数组
     */
    static extractIps(text) {
        const matches = text.match(this.IP_REGEX);
        return matches ? [...new Set(matches)] : [];
    }
    /**
     * 解析单行日志
     * @param line - 日志行
     * @returns 解析后的日志条目
     */
    static parseLogLine(line) {
        try {
            // 尝试解析JSON格式
            if (line.trim().startsWith("{")) {
                return JSON.parse(line);
            }
            // 尝试解析CSV格式
            if (line.includes(",")) {
                const parts = line.split(",");
                return {
                    timestamp: parts[0] || "",
                    ip: parts[1] || "",
                    method: parts[2] || "",
                    url: parts[3] || "",
                    status: parseInt(parts[4] || "0") || 0,
                    userAgent: parts[5] || "",
                    referer: parts[6] || ""
                };
            }
            // 尝试解析Apache/Nginx日志格式
            for (const format of this.COMMON_LOG_FORMATS) {
                const match = line.match(format);
                if (match) {
                    return {
                        timestamp: match[4] || match[2] || "",
                        ip: match[1] || "",
                        method: match[5] || match[3] || "",
                        url: match[6] || match[4] || "",
                        status: parseInt(match[7] || match[6] || "0"),
                        userAgent: match[9] || match[8] || "",
                        referer: match[8] || match[7] || ""
                    };
                }
            }
            // 如果无法解析，尝试提取IP
            const ips = this.extractIps(line);
            if (ips.length > 0) {
                return {
                    timestamp: (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss"),
                    ip: ips[0] || "",
                    raw: line
                };
            }
            return null;
        }
        catch (error) {
            console.warn(`解析日志行失败: ${line.substring(0, 100)}...`);
            return null;
        }
    }
    /**
     * 解析日志文件
     * @param filePath - 日志文件路径
     * @returns 解析后的日志条目数组
     */
    static async parseLogFile(filePath) {
        const entries = [];
        try {
            const content = await fs.readFile(filePath, "utf8");
            const lines = content.split("\n").filter((line) => line.trim());
            for (const line of lines) {
                const entry = this.parseLogLine(line);
                if (entry) {
                    entries.push(entry);
                }
            }
        }
        catch (error) {
            throw new Error(`读取日志文件失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }
        return entries;
    }
    /**
     * 获取IP的地理位置信息
     * @param ip - IP地址
     * @returns 地理位置信息
     */
    static getGeoLocation(ip) {
        const geo = geoip.lookup(ip);
        if (!geo)
            return null;
        return {
            country: geo.country || "Unknown",
            region: geo.region || "Unknown",
            city: geo.city || "Unknown",
            latitude: geo.ll[0],
            longitude: geo.ll[1],
            timezone: geo.timezone || "Unknown"
        };
    }
    /**
     * 按IP聚合统计
     * @param entries - 日志条目数组
     * @returns IP统计信息数组
     */
    static aggregateByIp(entries) {
        const ipMap = new Map();
        for (const entry of entries) {
            if (!entry.ip)
                continue;
            if (!ipMap.has(entry.ip)) {
                const geoLocation = this.getGeoLocation(entry.ip);
                ipMap.set(entry.ip, {
                    ip: entry.ip,
                    count: 0,
                    firstSeen: entry.timestamp,
                    lastSeen: entry.timestamp,
                    methods: [],
                    statusCodes: [],
                    userAgents: [],
                    ...(geoLocation && { geoLocation })
                });
            }
            const stats = ipMap.get(entry.ip);
            stats.count++;
            if (entry.timestamp < stats.firstSeen) {
                stats.firstSeen = entry.timestamp;
            }
            if (entry.timestamp > stats.lastSeen) {
                stats.lastSeen = entry.timestamp;
            }
            if (entry.method && !stats.methods.includes(entry.method)) {
                stats.methods.push(entry.method);
            }
            if (entry.status && !stats.statusCodes.includes(entry.status)) {
                stats.statusCodes.push(entry.status);
            }
            if (entry.userAgent && !stats.userAgents.includes(entry.userAgent)) {
                stats.userAgents.push(entry.userAgent);
            }
        }
        return Array.from(ipMap.values()).sort((a, b) => b.count - a.count);
    }
    /**
     * 按区域聚合统计
     * @param ipStats - IP统计信息数组
     * @returns 区域统计信息数组
     */
    static aggregateByRegion(ipStats) {
        const regionMap = new Map();
        for (const ipStat of ipStats) {
            if (!ipStat.geoLocation)
                continue;
            const regionKey = `${ipStat.geoLocation.country}-${ipStat.geoLocation.region}`;
            if (!regionMap.has(regionKey)) {
                regionMap.set(regionKey, {
                    region: ipStat.geoLocation.region,
                    country: ipStat.geoLocation.country,
                    ipCount: 0,
                    totalRequests: 0,
                    ips: [],
                    geoLocations: []
                });
            }
            const regionStats = regionMap.get(regionKey);
            regionStats.ipCount++;
            regionStats.totalRequests += ipStat.count;
            if (!regionStats.ips.includes(ipStat.ip)) {
                regionStats.ips.push(ipStat.ip);
            }
            if (!regionStats.geoLocations.some((geo) => geo.latitude === ipStat.geoLocation.latitude && geo.longitude === ipStat.geoLocation.longitude)) {
                regionStats.geoLocations.push(ipStat.geoLocation);
            }
        }
        return Array.from(regionMap.values()).sort((a, b) => b.totalRequests - a.totalRequests);
    }
    /**
     * 保存分析结果到JSON文件
     * @param data - 要保存的数据
     * @param outputPath - 输出文件路径
     */
    static async saveResults(data, outputPath) {
        try {
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeJson(outputPath, data, { spaces: 2 });
        }
        catch (error) {
            throw new Error(`保存结果失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }
    }
}
exports.LogParser = LogParser;
LogParser.IP_REGEX = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
LogParser.COMMON_LOG_FORMATS = [/^(\S+) (\S+) (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+)$/, /^(\S+) - - \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)"$/, /^(\S+) (\S+) (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)" "([^"]*)"$/];
//# sourceMappingURL=log-parser.js.map
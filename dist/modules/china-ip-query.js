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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChinaIpQuery = void 0;
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 14:15:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 14:37:33
 * @description: 中国IP地址省市查询工具
 * @param:
 * @return:
 */
const geoip = __importStar(require("geoip-lite"));
/**
 * 中国IP地址省市查询器
 */
class ChinaIpQuery {
    /**
     * 查询单个IP地址的省市信息
     * @param ip - IP地址
     * @returns 查询结果
     */
    static async queryIp(ip) {
        try {
            // 验证IP地址格式
            if (!this.isValidIp(ip)) {
                return {
                    ip,
                    isChina: false,
                    error: "无效的IP地址格式"
                };
            }
            // 使用geoip-lite查询地理位置
            const geo = geoip.lookup(ip);
            if (!geo) {
                return {
                    ip,
                    isChina: false,
                    error: "无法获取IP地理位置信息"
                };
            }
            const isChina = geo.country === this.CHINA_COUNTRY_CODE;
            if (!isChina) {
                return {
                    ip,
                    isChina: false,
                    location: {
                        country: geo.country,
                        province: geo.region,
                        city: geo.city,
                        latitude: geo.ll[0],
                        longitude: geo.ll[1],
                        timezone: geo.timezone || "UTC"
                    }
                };
            }
            // 对于中国IP，尝试获取更详细的省市信息
            const chinaLocation = await this.getChinaLocation(ip, geo);
            return {
                ip,
                isChina: true,
                location: chinaLocation
            };
        }
        catch (error) {
            return {
                ip,
                isChina: false,
                error: `查询失败: ${error instanceof Error ? error.message : "未知错误"}`
            };
        }
    }
    /**
     * 批量查询IP地址
     * @param ips - IP地址数组
     * @returns 查询结果数组
     */
    static async queryIps(ips) {
        const results = [];
        // 为了避免API限制，添加延迟
        for (const ip of ips) {
            const result = await this.queryIp(ip);
            results.push(result);
            // 添加100ms延迟避免请求过快
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return results;
    }
    /**
     * 获取中国IP的详细位置信息
     * @param _ip - IP地址
     * @param geo - 基础地理位置信息
     * @returns 中国位置信息
     */
    static async getChinaLocation(_ip, geo) {
        // 这里可以集成更精确的中国IP数据库
        // 目前使用geoip-lite的基础信息
        const province = this.getProvinceFromRegion(geo.region);
        return {
            country: "中国",
            province: province,
            city: geo.city || "未知",
            latitude: geo.ll[0],
            longitude: geo.ll[1],
            timezone: geo.timezone || "Asia/Shanghai"
        };
    }
    /**
     * 根据地区代码获取省份名称
     * @param region - 地区代码
     * @returns 省份名称
     */
    static getProvinceFromRegion(region) {
        // geoip-lite的地区代码映射
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
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }
    /**
     * 生成IP查询报告
     * @param results - 查询结果数组
     * @returns 格式化的报告
     */
    static generateReport(results) {
        const chinaIps = results.filter((r) => r.isChina);
        const foreignIps = results.filter((r) => !r.isChina);
        let report = "=== IP地址查询报告 ===\n\n";
        report += `总计查询: ${results.length} 个IP地址\n`;
        report += `中国IP: ${chinaIps.length} 个\n`;
        report += `海外IP: ${foreignIps.length} 个\n\n`;
        if (chinaIps.length > 0) {
            report += "=== 中国IP地址详情 ===\n";
            chinaIps.forEach((result) => {
                if (result.location) {
                    report += `IP: ${result.ip}\n`;
                    report += `  省份: ${result.location.province}\n`;
                    report += `  城市: ${result.location.city}\n`;
                    report += `  坐标: ${result.location.latitude}, ${result.location.longitude}\n`;
                    report += `  时区: ${result.location.timezone}\n\n`;
                }
            });
        }
        if (foreignIps.length > 0) {
            report += "=== 海外IP地址详情 ===\n";
            foreignIps.forEach((result) => {
                if (result.location) {
                    report += `IP: ${result.ip}\n`;
                    report += `  国家: ${result.location.country}\n`;
                    report += `  地区: ${result.location.province}\n`;
                    report += `  城市: ${result.location.city}\n\n`;
                }
                else if (result.error) {
                    report += `IP: ${result.ip} - ${result.error}\n`;
                }
            });
        }
        return report;
    }
}
exports.ChinaIpQuery = ChinaIpQuery;
ChinaIpQuery.CHINA_COUNTRY_CODE = "CN";
//# sourceMappingURL=china-ip-query.js.map
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 15:00:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 14:47:18
 * @description: IP日志分析器 - 从日志文件提取IP并获取地理信息
 * @param:
 * @return:
 */
import * as fs from "fs-extra";
import * as geoip from "geoip-lite";
import moment from "moment";

/**
 * 日志条目接口
 */
export interface LogEntry {
	timestamp: string;
	ip: string;
	method?: string;
	url?: string;
	status?: number;
	userAgent?: string;
	referer?: string;
	rawLine: string;
}

/**
 * IP地理位置信息接口
 */
export interface IpGeoInfo {
	ip: string;
	country: string;
	province: string;
	city: string;
	latitude: number;
	longitude: number;
	timezone: string;
	isChina: boolean;
	count: number;
	firstSeen: string;
	lastSeen: string;
}

/**
 * 分析结果接口
 */
export interface AnalysisResult {
	totalLogs: number;
	uniqueIps: number;
	chinaIps: number;
	foreignIps: number;
	ipGeoList: IpGeoInfo[];
	provinceStats: Map<string, number>;
	cityStats: Map<string, number>;
}

/**
 * IP日志分析器
 */
export class IpLogAnalyzer {
	private static readonly CHINA_COUNTRY_CODE = "CN";
	private static readonly IP_REGEX = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
	private static readonly LOG_PATTERN = /^(\S+) - - \[([^\]]+)\] "([^"]+)" (\d+) (\d+) "([^"]*)" "([^"]*)"$/;

	/**
	 * 解析日志文件
	 * @param logFilePath - 日志文件路径
	 * @returns 解析后的日志条目数组
	 */
	static async parseLogFile(logFilePath: string): Promise<LogEntry[]> {
		try {
			await fs.access(logFilePath);
			const content = await fs.readFile(logFilePath, "utf-8");
			const lines = content.split("\n");

			const logEntries: LogEntry[] = [];

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
		} catch (error) {
			throw new Error(`解析日志文件失败: ${error instanceof Error ? error.message : "未知错误"}`);
		}
	}

	/**
	 * 解析单行日志
	 * @param line - 日志行
	 * @returns 解析后的日志条目或null
	 */
	private static parseLogLine(line: string): LogEntry | null {
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
	private static parseTimestamp(timestamp: string): string {
		try {
			// 解析格式: 16/Oct/2025:10:30:15 +0800
			const parsed = moment(timestamp, "DD/MMM/YYYY:HH:mm:ss Z");
			return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : timestamp;
		} catch {
			return timestamp;
		}
	}

	/**
	 * 从日志条目中提取IP地址
	 * @param logEntries - 日志条目数组
	 * @returns IP地址数组
	 */
	static extractIps(logEntries: LogEntry[]): string[] {
		const ipSet = new Set<string>();

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
	 * 获取IP的地理信息
	 * @param ip - IP地址
	 * @returns 地理信息
	 */
	static getIpGeoInfo(ip: string): IpGeoInfo | null {
		try {
			const geo = geoip.lookup(ip);
			if (!geo) {
				return null;
			}

			const isChina = geo.country === this.CHINA_COUNTRY_CODE;
			const province = this.getProvinceFromRegion(geo.region);

			return {
				ip,
				country: geo.country || "未知",
				province: isChina ? province : geo.region || "未知",
				city: geo.city || "未知",
				latitude: geo.ll[0],
				longitude: geo.ll[1],
				timezone: geo.timezone || "UTC",
				isChina,
				count: 0, // 将在后续统计中设置
				firstSeen: "",
				lastSeen: ""
			};
		} catch (error) {
			console.warn(`获取IP ${ip} 地理信息失败: ${error instanceof Error ? error.message : "未知错误"}`);
			return null;
		}
	}

	/**
	 * 根据地区代码获取省份名称
	 * @param region - 地区代码
	 * @returns 省份名称
	 */
	private static getProvinceFromRegion(region: string): string {
		const regionMap: Record<string, string> = {
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
	private static isValidIp(ip: string): boolean {
		const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return ipv4Regex.test(ip);
	}

	/**
	 * 分析日志文件并生成地理信息
	 * @param logFilePath - 日志文件路径
	 * @returns 分析结果
	 */
	static async analyzeLogFile(logFilePath: string): Promise<AnalysisResult> {
		console.log("正在解析日志文件...");
		const logEntries = await this.parseLogFile(logFilePath);

		console.log("正在提取IP地址...");
		const ips = this.extractIps(logEntries);

		console.log("正在获取地理信息...");
		const ipGeoMap = new Map<string, IpGeoInfo>();
		const ipCountMap = new Map<string, number>();
		const ipTimeMap = new Map<string, { first: string; last: string }>();

		// 统计IP出现次数和时间
		for (const entry of logEntries) {
			const ip = entry.ip;
			ipCountMap.set(ip, (ipCountMap.get(ip) || 0) + 1);

			const timeInfo = ipTimeMap.get(ip);
			if (!timeInfo) {
				ipTimeMap.set(ip, { first: entry.timestamp, last: entry.timestamp });
			} else {
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
			const geoInfo = this.getIpGeoInfo(ip);
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
		const provinceStats = new Map<string, number>();
		const cityStats = new Map<string, number>();

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
	static generateReport(result: AnalysisResult): string {
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

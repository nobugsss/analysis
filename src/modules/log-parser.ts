/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:55:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:48:08
 * @description: IP日志解析器
 * @param:
 * @return:
 */
import * as fs from "fs-extra";
import * as path from "path";
import * as geoip from "geoip-lite";
import moment from "moment";

/**
 * IP日志条目接口
 */
export interface LogEntry {
	timestamp: string;
	ip: string;
	method?: string;
	url?: string;
	status?: number;
	userAgent?: string;
	referer?: string;
	[key: string]: any;
}

/**
 * IP地理位置信息接口
 */
export interface GeoLocation {
	country: string;
	region: string;
	city: string;
	latitude: number;
	longitude: number;
	timezone: string;
}

/**
 * IP统计信息接口
 */
export interface IpStats {
	ip: string;
	count: number;
	geoLocation?: GeoLocation;
	firstSeen: string;
	lastSeen: string;
	methods: string[];
	statusCodes: number[];
	userAgents: string[];
}

/**
 * 区域聚合统计接口
 */
export interface RegionStats {
	region: string;
	country: string;
	ipCount: number;
	totalRequests: number;
	ips: string[];
	geoLocations: GeoLocation[];
}

/**
 * IP日志解析器
 */
export class LogParser {
	private static readonly IP_REGEX = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
	private static readonly COMMON_LOG_FORMATS = [/^(\S+) (\S+) (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+)$/, /^(\S+) - - \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)"$/, /^(\S+) (\S+) (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)" "([^"]*)"$/];

	/**
	 * 从文本中提取IP地址
	 * @param text - 文本内容
	 * @returns IP地址数组
	 */
	static extractIps(text: string): string[] {
		const matches = text.match(this.IP_REGEX);
		return matches ? [...new Set(matches)] : [];
	}

	/**
	 * 解析单行日志
	 * @param line - 日志行
	 * @returns 解析后的日志条目
	 */
	static parseLogLine(line: string): LogEntry | null {
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
					timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
					ip: ips[0] || "",
					raw: line
				};
			}

			return null;
		} catch (error) {
			console.warn(`解析日志行失败: ${line.substring(0, 100)}...`);
			return null;
		}
	}

	/**
	 * 解析日志文件
	 * @param filePath - 日志文件路径
	 * @returns 解析后的日志条目数组
	 */
	static async parseLogFile(filePath: string): Promise<LogEntry[]> {
		const entries: LogEntry[] = [];

		try {
			const content = await fs.readFile(filePath, "utf8");
			const lines = content.split("\n").filter((line) => line.trim());

			for (const line of lines) {
				const entry = this.parseLogLine(line);
				if (entry) {
					entries.push(entry);
				}
			}
		} catch (error) {
			throw new Error(`读取日志文件失败: ${error instanceof Error ? error.message : "未知错误"}`);
		}

		return entries;
	}

	/**
	 * 获取IP的地理位置信息
	 * @param ip - IP地址
	 * @returns 地理位置信息
	 */
	static getGeoLocation(ip: string): GeoLocation | null {
		const geo = geoip.lookup(ip);
		if (!geo) return null;

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
	static aggregateByIp(entries: LogEntry[]): IpStats[] {
		const ipMap = new Map<string, IpStats>();

		for (const entry of entries) {
			if (!entry.ip) continue;

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

			const stats = ipMap.get(entry.ip)!;
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
	static aggregateByRegion(ipStats: IpStats[]): RegionStats[] {
		const regionMap = new Map<string, RegionStats>();

		for (const ipStat of ipStats) {
			if (!ipStat.geoLocation) continue;

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

			const regionStats = regionMap.get(regionKey)!;
			regionStats.ipCount++;
			regionStats.totalRequests += ipStat.count;

			if (!regionStats.ips.includes(ipStat.ip)) {
				regionStats.ips.push(ipStat.ip);
			}

			if (!regionStats.geoLocations.some((geo) => geo.latitude === ipStat.geoLocation!.latitude && geo.longitude === ipStat.geoLocation!.longitude)) {
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
	static async saveResults(data: any, outputPath: string): Promise<void> {
		try {
			await fs.ensureDir(path.dirname(outputPath));
			await fs.writeJson(outputPath, data, { spaces: 2 });
		} catch (error) {
			throw new Error(`保存结果失败: ${error instanceof Error ? error.message : "未知错误"}`);
		}
	}
}

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
export declare class LogParser {
    private static readonly IP_REGEX;
    private static readonly COMMON_LOG_FORMATS;
    /**
     * 从文本中提取IP地址
     * @param text - 文本内容
     * @returns IP地址数组
     */
    static extractIps(text: string): string[];
    /**
     * 解析单行日志
     * @param line - 日志行
     * @returns 解析后的日志条目
     */
    static parseLogLine(line: string): LogEntry | null;
    /**
     * 解析日志文件
     * @param filePath - 日志文件路径
     * @returns 解析后的日志条目数组
     */
    static parseLogFile(filePath: string): Promise<LogEntry[]>;
    /**
     * 获取IP的地理位置信息
     * @param ip - IP地址
     * @returns 地理位置信息
     */
    static getGeoLocation(ip: string): GeoLocation | null;
    /**
     * 按IP聚合统计
     * @param entries - 日志条目数组
     * @returns IP统计信息数组
     */
    static aggregateByIp(entries: LogEntry[]): IpStats[];
    /**
     * 按区域聚合统计
     * @param ipStats - IP统计信息数组
     * @returns 区域统计信息数组
     */
    static aggregateByRegion(ipStats: IpStats[]): RegionStats[];
    /**
     * 保存分析结果到JSON文件
     * @param data - 要保存的数据
     * @param outputPath - 输出文件路径
     */
    static saveResults(data: any, outputPath: string): Promise<void>;
}
//# sourceMappingURL=log-parser.d.ts.map
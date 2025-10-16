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
export declare class IpLogAnalyzer {
    private static readonly CHINA_COUNTRY_CODE;
    private static readonly IP_REGEX;
    private static readonly LOG_PATTERN;
    /**
     * 解析日志文件
     * @param logFilePath - 日志文件路径
     * @returns 解析后的日志条目数组
     */
    static parseLogFile(logFilePath: string): Promise<LogEntry[]>;
    /**
     * 解析单行日志
     * @param line - 日志行
     * @returns 解析后的日志条目或null
     */
    private static parseLogLine;
    /**
     * 解析时间戳
     * @param timestamp - 时间戳字符串
     * @returns 格式化后的时间戳
     */
    private static parseTimestamp;
    /**
     * 从日志条目中提取IP地址
     * @param logEntries - 日志条目数组
     * @returns IP地址数组
     */
    static extractIps(logEntries: LogEntry[]): string[];
    /**
     * 获取IP的地理信息
     * @param ip - IP地址
     * @returns 地理信息
     */
    static getIpGeoInfo(ip: string): IpGeoInfo | null;
    /**
     * 根据地区代码获取省份名称
     * @param region - 地区代码
     * @returns 省份名称
     */
    private static getProvinceFromRegion;
    /**
     * 验证IP地址格式
     * @param ip - IP地址
     * @returns 是否为有效IP
     */
    private static isValidIp;
    /**
     * 分析日志文件并生成地理信息
     * @param logFilePath - 日志文件路径
     * @returns 分析结果
     */
    static analyzeLogFile(logFilePath: string): Promise<AnalysisResult>;
    /**
     * 生成分析报告
     * @param result - 分析结果
     * @returns 格式化的报告
     */
    static generateReport(result: AnalysisResult): string;
}
//# sourceMappingURL=ip-log-analyzer.d.ts.map
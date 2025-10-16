/**
 * 中国省市信息接口
 */
export interface ChinaLocation {
    country: string;
    province: string;
    city: string;
    district?: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isp?: string;
}
/**
 * IP查询结果接口
 */
export interface IpQueryResult {
    ip: string;
    location?: ChinaLocation;
    isChina: boolean;
    error?: string;
}
/**
 * 中国IP地址省市查询器
 */
export declare class ChinaIpQuery {
    private static readonly CHINA_COUNTRY_CODE;
    /**
     * 查询单个IP地址的省市信息
     * @param ip - IP地址
     * @returns 查询结果
     */
    static queryIp(ip: string): Promise<IpQueryResult>;
    /**
     * 批量查询IP地址
     * @param ips - IP地址数组
     * @returns 查询结果数组
     */
    static queryIps(ips: string[]): Promise<IpQueryResult[]>;
    /**
     * 获取中国IP的详细位置信息
     * @param _ip - IP地址
     * @param geo - 基础地理位置信息
     * @returns 中国位置信息
     */
    private static getChinaLocation;
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
     * 生成IP查询报告
     * @param results - 查询结果数组
     * @returns 格式化的报告
     */
    static generateReport(results: IpQueryResult[]): string;
}
//# sourceMappingURL=china-ip-query.d.ts.map
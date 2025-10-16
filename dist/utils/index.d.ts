/**
 * 文件工具类
 */
export declare class FileUtils {
    /**
     * 确保目录存在
     * @param dirPath - 目录路径
     */
    static ensureDir(dirPath: string): Promise<void>;
    /**
     * 检查文件是否存在
     * @param filePath - 文件路径
     * @returns 是否存在
     */
    static exists(filePath: string): Promise<boolean>;
    /**
     * 获取文件扩展名
     * @param filePath - 文件路径
     * @returns 扩展名
     */
    static getExtension(filePath: string): string;
    /**
     * 获取文件名（不含扩展名）
     * @param filePath - 文件路径
     * @returns 文件名
     */
    static getBasename(filePath: string): string;
    /**
     * 获取目录名
     * @param filePath - 文件路径
     * @returns 目录名
     */
    static getDirname(filePath: string): string;
}
/**
 * IP工具类
 */
export declare class IpUtils {
    /**
     * 验证IP地址格式
     * @param ip - IP地址
     * @returns 是否有效
     */
    static isValidIp(ip: string): boolean;
    /**
     * 检查是否为私有IP
     * @param ip - IP地址
     * @returns 是否为私有IP
     */
    static isPrivateIp(ip: string): boolean;
    /**
     * 格式化IP地址
     * @param ip - IP地址
     * @returns 格式化后的IP地址
     */
    static formatIp(ip: string): string;
}
/**
 * 地理工具类
 */
export declare class GeoUtils {
    /**
     * 计算两点之间的距离（公里）
     * @param lat1 - 纬度1
     * @param lng1 - 经度1
     * @param lat2 - 纬度2
     * @param lng2 - 经度2
     * @returns 距离（公里）
     */
    static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
    /**
     * 角度转弧度
     * @param degrees - 角度
     * @returns 弧度
     */
    private static toRadians;
    /**
     * 检查坐标是否在中国境内
     * @param lat - 纬度
     * @param lng - 经度
     * @returns 是否在中国境内
     */
    static isInChina(lat: number, lng: number): boolean;
}
//# sourceMappingURL=index.d.ts.map